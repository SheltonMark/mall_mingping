import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma.service';
import { getErpDatabaseConfig, getErpSyncConfig } from '../config/erp-database.config';
import * as bcrypt from 'bcrypt';

export interface SalespersonSyncResult {
  success: boolean;
  created: number;
  updated: number;
  total: number;
  duration: number;
  error?: string;
}

// 预览数据结构
export interface SalespersonPreviewItem {
  salNo: string;
  name: string;
  englishName: string | null;
  department: string | null;
  position: string | null;
  isNew: boolean;
}

export interface SalespersonPreviewResult {
  success: boolean;
  salespersons: SalespersonPreviewItem[];
  total: number;
  newCount: number;
  updateCount: number;
  error?: string;
}

interface ErpSalesperson {
  SAL_NO: string;      // 业务员编号（如 MP0001, MP0008）
  NAME: string;        // 中文姓名
  ENG_NAME: string | null; // 英文名
  DEP: string | null;  // 部门
  POS: string | null;  // 职位
}

@Injectable()
export class ErpSalespersonSyncService {
  private readonly logger = new Logger(ErpSalespersonSyncService.name);
  private pool: sql.ConnectionPool | null = null;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 获取 ERP 数据库连接池
   */
  private async getPool(): Promise<sql.ConnectionPool> {
    if (this.pool && this.pool.connected) {
      return this.pool;
    }

    const config = getErpDatabaseConfig();
    this.pool = await new sql.ConnectionPool({
      server: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      options: {
        ...config.options,
        tdsVersion: '7_4',
      },
      requestTimeout: 60000,
    }).connect();

    this.logger.log('ERP 数据库连接成功');
    return this.pool;
  }

  /**
   * 关闭数据库连接
   */
  async closeConnection(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.logger.log('ERP 数据库连接已关闭');
    }
  }

  /**
   * 同步 ERP 业务员数据
   * 只同步有效的业务员（SAL_NO 以 MP 开头）
   */
  async syncSalespersons(): Promise<SalespersonSyncResult> {
    const startTime = Date.now();
    const syncConfig = getErpSyncConfig();

    if (!syncConfig.enabled) {
      return {
        success: false,
        created: 0,
        updated: 0,
        total: 0,
        duration: Date.now() - startTime,
        error: 'ERP 同步未启用',
      };
    }

    let created = 0;
    let updated = 0;

    try {
      const pool = await this.getPool();

      // 查询 ERP 业务员数据
      // 使用 CAST 转换 varchar 到 nvarchar 并指定中文排序规则解决编码问题
      const salespersonQuery = `
        SELECT
          SAL_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS NAME,
          CAST(ENG_NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS ENG_NAME,
          CAST(DEP COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS DEP,
          CAST(POS COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS POS
        FROM SALM
        WHERE SAL_NO LIKE 'MP%'
      `;

      const result = await pool.request().query<ErpSalesperson>(salespersonQuery);
      const salespersons = result.recordset;
      this.logger.log(`[业务员同步] 查询到 ${salespersons.length} 个ERP业务员`);

      if (salespersons.length === 0) {
        return {
          success: true,
          created: 0,
          updated: 0,
          total: 0,
          duration: Date.now() - startTime,
        };
      }

      // 同步每个业务员
      for (const sp of salespersons) {
        const existingSp = await this.prisma.salesperson.findUnique({
          where: { accountId: sp.SAL_NO },
        });

        const spData = {
          chineseName: sp.NAME || sp.SAL_NO,
          englishName: sp.ENG_NAME || null,
          department: sp.DEP || null,
          position: sp.POS || null,
          erpSyncAt: new Date(),
        };

        if (existingSp) {
          // 更新（不更新密码）
          await this.prisma.salesperson.update({
            where: { id: existingSp.id },
            data: spData,
          });
          updated++;
        } else {
          // 创建（设置默认密码）
          const defaultPassword = await bcrypt.hash('123456', 10);
          await this.prisma.salesperson.create({
            data: {
              accountId: sp.SAL_NO,
              password: defaultPassword,
              ...spData,
            },
          });
          created++;
          this.logger.log(`[业务员同步] 新增业务员: ${sp.SAL_NO} - ${sp.NAME}`);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `[业务员同步] 完成! 新增${created}/更新${updated}, 总计${salespersons.length}, 耗时${duration}ms`,
      );

      // 记录同步时间
      await this.recordSyncTime();

      return {
        success: true,
        created,
        updated,
        total: salespersons.length,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[业务员同步] 失败: ${errorMessage}`);

      return {
        success: false,
        created,
        updated,
        total: 0,
        duration: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取上次同步时间
   */
  async getLastSyncTime(): Promise<Date | null> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: 'erp_salesperson_last_sync' },
    });
    return config?.configValue ? new Date(config.configValue) : null;
  }

  /**
   * 记录同步时间
   */
  async recordSyncTime(): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { configKey: 'erp_salesperson_last_sync' },
      update: { configValue: new Date().toISOString() },
      create: {
        configKey: 'erp_salesperson_last_sync',
        configValue: new Date().toISOString(),
        configType: 'text',
        description: 'ERP 业务员同步最后执行时间',
      },
    });
  }

  /**
   * 预览待同步的业务员（不实际同步）
   */
  async previewSalespersons(): Promise<SalespersonPreviewResult> {
    const syncConfig = getErpSyncConfig();

    if (!syncConfig.enabled) {
      return {
        success: false,
        salespersons: [],
        total: 0,
        newCount: 0,
        updateCount: 0,
        error: 'ERP 同步未启用',
      };
    }

    try {
      const pool = await this.getPool();

      // 查询 ERP 业务员数据
      const salespersonQuery = `
        SELECT
          SAL_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS NAME,
          CAST(ENG_NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS ENG_NAME,
          CAST(DEP COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS DEP,
          CAST(POS COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS POS
        FROM SALM
        WHERE SAL_NO LIKE 'MP%'
        ORDER BY SAL_NO
      `;

      const result = await pool.request().query<ErpSalesperson>(salespersonQuery);
      const erpSalespersons = result.recordset;

      // 获取已存在的业务员编号
      const existingSalespersons = await this.prisma.salesperson.findMany({
        select: { accountId: true },
      });
      const existingAccountIds = new Set(existingSalespersons.map(s => s.accountId));

      // 构建预览列表
      const salespersons: SalespersonPreviewItem[] = erpSalespersons.map(sp => ({
        salNo: sp.SAL_NO,
        name: sp.NAME || sp.SAL_NO,
        englishName: sp.ENG_NAME || null,
        department: sp.DEP || null,
        position: sp.POS || null,
        isNew: !existingAccountIds.has(sp.SAL_NO),
      }));

      const newCount = salespersons.filter(s => s.isNew).length;
      const updateCount = salespersons.length - newCount;

      return {
        success: true,
        salespersons,
        total: salespersons.length,
        newCount,
        updateCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[业务员预览] 失败: ${errorMessage}`);
      return {
        success: false,
        salespersons: [],
        total: 0,
        newCount: 0,
        updateCount: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * 选择性同步业务员
   */
  async syncSelectedSalespersons(selectedSalNos: string[]): Promise<SalespersonSyncResult> {
    const startTime = Date.now();
    const syncConfig = getErpSyncConfig();

    if (!syncConfig.enabled) {
      return {
        success: false,
        created: 0,
        updated: 0,
        total: 0,
        duration: Date.now() - startTime,
        error: 'ERP 同步未启用',
      };
    }

    if (selectedSalNos.length === 0) {
      return {
        success: true,
        created: 0,
        updated: 0,
        total: 0,
        duration: Date.now() - startTime,
      };
    }

    let created = 0;
    let updated = 0;

    try {
      const pool = await this.getPool();

      // 构建 IN 查询条件
      const placeholders = selectedSalNos.map((_, i) => `@sal${i}`).join(', ');
      const request = pool.request();
      selectedSalNos.forEach((salNo, i) => {
        request.input(`sal${i}`, sql.NVarChar, salNo);
      });

      const salespersonQuery = `
        SELECT
          SAL_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS NAME,
          CAST(ENG_NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS ENG_NAME,
          CAST(DEP COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS DEP,
          CAST(POS COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS POS
        FROM SALM
        WHERE SAL_NO IN (${placeholders})
      `;

      const result = await request.query<ErpSalesperson>(salespersonQuery);
      const salespersons = result.recordset;

      this.logger.log(`[业务员选择性同步] 查询到 ${salespersons.length} 个业务员`);

      // 同步每个业务员
      for (const sp of salespersons) {
        const existingSp = await this.prisma.salesperson.findUnique({
          where: { accountId: sp.SAL_NO },
        });

        const spData = {
          chineseName: sp.NAME || sp.SAL_NO,
          englishName: sp.ENG_NAME || null,
          department: sp.DEP || null,
          position: sp.POS || null,
          erpSyncAt: new Date(),
        };

        if (existingSp) {
          // 更新（不更新密码）
          await this.prisma.salesperson.update({
            where: { id: existingSp.id },
            data: spData,
          });
          updated++;
        } else {
          // 创建（设置默认密码）
          const defaultPassword = await bcrypt.hash('123456', 10);
          await this.prisma.salesperson.create({
            data: {
              accountId: sp.SAL_NO,
              password: defaultPassword,
              ...spData,
            },
          });
          created++;
          this.logger.log(`[业务员选择性同步] 新增业务员: ${sp.SAL_NO} - ${sp.NAME}`);
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `[业务员选择性同步] 完成! 新增${created}/更新${updated}, 耗时${duration}ms`,
      );

      await this.recordSyncTime();

      return {
        success: true,
        created,
        updated,
        total: salespersons.length,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[业务员选择性同步] 失败: ${errorMessage}`);

      return {
        success: false,
        created,
        updated,
        total: 0,
        duration: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取所有业务员（带分页和搜索）
   */
  async findAll(query?: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 20 } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { accountId: { contains: search } },
        { chineseName: { contains: search } },
        { englishName: { contains: search } },
      ];
    }

    const [salespersons, total] = await Promise.all([
      this.prisma.salesperson.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          accountId: true,
          chineseName: true,
          englishName: true,
          department: true,
          position: true,
          erpSyncAt: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              customers: true,
              erpCustomers: true,
              orders: true,
            },
          },
        },
        orderBy: { accountId: 'asc' },
      }),
      this.prisma.salesperson.count({ where }),
    ]);

    return {
      data: salespersons,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

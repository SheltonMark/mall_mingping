import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma.service';
import { getErpDatabaseConfig, getErpSyncConfig } from '../config/erp-database.config';

export interface CustomerSyncResult {
  success: boolean;
  created: number;
  updated: number;
  total: number;
  duration: number;
  error?: string;
}

// 预览数据结构
export interface CustomerPreviewItem {
  cusNo: string;
  name: string;
  shortName: string | null;
  salespersonNo: string | null;
  isNew: boolean;
}

export interface CustomerPreviewResult {
  success: boolean;
  customers: CustomerPreviewItem[];
  total: number;
  newCount: number;
  updateCount: number;
  error?: string;
}

interface ErpCustomer {
  CUS_NO: string;      // 客户编号（如 C0098, D04057）
  NAME: string;        // 客户全称
  SNM: string | null;  // 客户简称
  COUNTRY: string | null;
  TEL1: string | null;
  E_MAIL: string | null;
  ADR1: string | null;
  CNT_MAN1: string | null; // 联系人
  SAL: string | null;  // 所属业务员编号
}

@Injectable()
export class ErpCustomerSyncService {
  private readonly logger = new Logger(ErpCustomerSyncService.name);
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
   * 同步 ERP 客户数据
   * 只同步 OBJ_ID = 1 的记录（客户，非供应商）
   */
  async syncCustomers(): Promise<CustomerSyncResult> {
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

      // 查询 ERP 客户数据（OBJ_ID = 1 表示客户）
      // 使用 CAST 转换 varchar 到 nvarchar 并指定中文排序规则解决编码问题
      const customerQuery = `
        SELECT
          CUS_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(200)) AS NAME,
          CAST(SNM COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS SNM,
          CAST(COUNTRY COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS COUNTRY,
          TEL1,
          E_MAIL,
          CAST(ADR1 COLLATE Chinese_PRC_CI_AS AS NVARCHAR(MAX)) AS ADR1,
          CAST(CNT_MAN1 COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS CNT_MAN1,
          SAL
        FROM CUST
        WHERE OBJ_ID = 1
      `;

      const result = await pool.request().query<ErpCustomer>(customerQuery);
      const customers = result.recordset;
      this.logger.log(`[客户同步] 查询到 ${customers.length} 个ERP客户`);

      if (customers.length === 0) {
        return {
          success: true,
          created: 0,
          updated: 0,
          total: 0,
          duration: Date.now() - startTime,
        };
      }

      // 获取所有业务员的 accountId -> id 映射
      const salespersons = await this.prisma.salesperson.findMany({
        select: { id: true, accountId: true },
      });
      const salespersonMap = new Map(salespersons.map(s => [s.accountId, s.id]));

      // 同步每个客户
      for (const customer of customers) {
        const existingCustomer = await this.prisma.erpCustomer.findUnique({
          where: { cusNo: customer.CUS_NO },
        });

        // 查找对应的业务员ID
        const salespersonId = customer.SAL ? salespersonMap.get(customer.SAL) : null;

        const customerData = {
          name: customer.NAME || '',
          shortName: customer.SNM || null,
          country: customer.COUNTRY || null,
          phone: customer.TEL1 || null,
          email: customer.E_MAIL || null,
          address: customer.ADR1 || null,
          contactPerson: customer.CNT_MAN1 || null,
          salespersonNo: customer.SAL || null,
          salespersonId: salespersonId || null,
          erpSyncAt: new Date(),
        };

        if (existingCustomer) {
          // 更新
          await this.prisma.erpCustomer.update({
            where: { id: existingCustomer.id },
            data: customerData,
          });
          updated++;
        } else {
          // 创建
          await this.prisma.erpCustomer.create({
            data: {
              cusNo: customer.CUS_NO,
              ...customerData,
            },
          });
          created++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `[客户同步] 完成! 新增${created}/更新${updated}, 总计${customers.length}, 耗时${duration}ms`,
      );

      // 记录同步时间
      await this.recordSyncTime();

      return {
        success: true,
        created,
        updated,
        total: customers.length,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[客户同步] 失败: ${errorMessage}`);

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
      where: { configKey: 'erp_customer_last_sync' },
    });
    return config?.configValue ? new Date(config.configValue) : null;
  }

  /**
   * 记录同步时间
   */
  async recordSyncTime(): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { configKey: 'erp_customer_last_sync' },
      update: { configValue: new Date().toISOString() },
      create: {
        configKey: 'erp_customer_last_sync',
        configValue: new Date().toISOString(),
        configType: 'text',
        description: 'ERP 客户同步最后执行时间',
      },
    });
  }

  /**
   * 获取所有 ERP 客户（带分页和搜索）
   */
  async findAll(query?: {
    search?: string;
    salespersonId?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, salespersonId, page = 1, limit = 20 } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { cusNo: { contains: search } },
        { name: { contains: search } },
        { shortName: { contains: search } },
      ];
    }

    if (salespersonId) {
      where.salespersonId = salespersonId;
    }

    const [customers, total] = await Promise.all([
      this.prisma.erpCustomer.findMany({
        where,
        skip,
        take: limit,
        include: {
          salesperson: {
            select: {
              id: true,
              accountId: true,
              chineseName: true,
            },
          },
        },
        orderBy: { cusNo: 'asc' },
      }),
      this.prisma.erpCustomer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取单个 ERP 客户
   */
  async findOne(id: string) {
    return this.prisma.erpCustomer.findUnique({
      where: { id },
      include: {
        salesperson: {
          select: {
            id: true,
            accountId: true,
            chineseName: true,
          },
        },
      },
    });
  }

  /**
   * 根据客户编号获取 ERP 客户
   */
  async findByCusNo(cusNo: string) {
    return this.prisma.erpCustomer.findUnique({
      where: { cusNo },
      include: {
        salesperson: {
          select: {
            id: true,
            accountId: true,
            chineseName: true,
          },
        },
      },
    });
  }

  /**
   * 预览待同步的客户（不实际同步）
   */
  async previewCustomers(): Promise<CustomerPreviewResult> {
    const syncConfig = getErpSyncConfig();

    if (!syncConfig.enabled) {
      return {
        success: false,
        customers: [],
        total: 0,
        newCount: 0,
        updateCount: 0,
        error: 'ERP 同步未启用',
      };
    }

    try {
      const pool = await this.getPool();

      // 查询 ERP 客户数据
      const customerQuery = `
        SELECT
          CUS_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(200)) AS NAME,
          CAST(SNM COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS SNM,
          SAL
        FROM CUST
        WHERE OBJ_ID = 1
        ORDER BY CUS_NO
      `;

      const result = await pool.request().query<ErpCustomer>(customerQuery);
      const erpCustomers = result.recordset;

      // 获取已存在的客户编号
      const existingCustomers = await this.prisma.erpCustomer.findMany({
        select: { cusNo: true },
      });
      const existingCusNos = new Set(existingCustomers.map(c => c.cusNo));

      // 构建预览列表
      const customers: CustomerPreviewItem[] = erpCustomers.map(c => ({
        cusNo: c.CUS_NO,
        name: c.NAME || '',
        shortName: c.SNM || null,
        salespersonNo: c.SAL || null,
        isNew: !existingCusNos.has(c.CUS_NO),
      }));

      const newCount = customers.filter(c => c.isNew).length;
      const updateCount = customers.length - newCount;

      return {
        success: true,
        customers,
        total: customers.length,
        newCount,
        updateCount,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[客户预览] 失败: ${errorMessage}`);
      return {
        success: false,
        customers: [],
        total: 0,
        newCount: 0,
        updateCount: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * 选择性同步客户
   */
  async syncSelectedCustomers(selectedCusNos: string[]): Promise<CustomerSyncResult> {
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

    if (selectedCusNos.length === 0) {
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
      const placeholders = selectedCusNos.map((_, i) => `@cus${i}`).join(', ');
      const request = pool.request();
      selectedCusNos.forEach((cusNo, i) => {
        request.input(`cus${i}`, sql.NVarChar, cusNo);
      });

      const customerQuery = `
        SELECT
          CUS_NO,
          CAST(NAME COLLATE Chinese_PRC_CI_AS AS NVARCHAR(200)) AS NAME,
          CAST(SNM COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS SNM,
          CAST(COUNTRY COLLATE Chinese_PRC_CI_AS AS NVARCHAR(50)) AS COUNTRY,
          TEL1,
          E_MAIL,
          CAST(ADR1 COLLATE Chinese_PRC_CI_AS AS NVARCHAR(MAX)) AS ADR1,
          CAST(CNT_MAN1 COLLATE Chinese_PRC_CI_AS AS NVARCHAR(100)) AS CNT_MAN1,
          SAL
        FROM CUST
        WHERE OBJ_ID = 1 AND CUS_NO IN (${placeholders})
      `;

      const result = await request.query<ErpCustomer>(customerQuery);
      const customers = result.recordset;

      this.logger.log(`[客户选择性同步] 查询到 ${customers.length} 个客户`);

      // 获取业务员映射
      const salespersons = await this.prisma.salesperson.findMany({
        select: { id: true, accountId: true },
      });
      const salespersonMap = new Map(salespersons.map(s => [s.accountId, s.id]));

      // 同步每个客户
      for (const customer of customers) {
        const existingCustomer = await this.prisma.erpCustomer.findUnique({
          where: { cusNo: customer.CUS_NO },
        });

        const salespersonId = customer.SAL ? salespersonMap.get(customer.SAL) : null;

        const customerData = {
          name: customer.NAME || '',
          shortName: customer.SNM || null,
          country: customer.COUNTRY || null,
          phone: customer.TEL1 || null,
          email: customer.E_MAIL || null,
          address: customer.ADR1 || null,
          contactPerson: customer.CNT_MAN1 || null,
          salespersonNo: customer.SAL || null,
          salespersonId: salespersonId || null,
          erpSyncAt: new Date(),
        };

        if (existingCustomer) {
          await this.prisma.erpCustomer.update({
            where: { id: existingCustomer.id },
            data: customerData,
          });
          updated++;
        } else {
          await this.prisma.erpCustomer.create({
            data: {
              cusNo: customer.CUS_NO,
              ...customerData,
            },
          });
          created++;
        }
      }

      const duration = Date.now() - startTime;
      this.logger.log(
        `[客户选择性同步] 完成! 新增${created}/更新${updated}, 耗时${duration}ms`,
      );

      await this.recordSyncTime();

      return {
        success: true,
        created,
        updated,
        total: customers.length,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[客户选择性同步] 失败: ${errorMessage}`);

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
}

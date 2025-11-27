import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma.service';
import { getErpDatabaseConfig, getErpSyncConfig } from '../config/erp-database.config';

export interface ProductSyncResult {
  success: boolean;
  groupsCreated: number;
  groupsUpdated: number;
  skusCreated: number;
  skusUpdated: number;
  duration: number; // 毫秒
  error?: string;
}

interface ErpProduct {
  PRD_NO: string;      // 产品编号 (如 C02.01.0180)
  NAME: string;        // 品名 (如 MB001-涤锦经编抹布10PCS)
  SPC: string | null;  // 货品规格
  MARK_NO: string | null; // 特征组代号 (如 2-021)
  RECORD_DD: Date;     // 记录日期
}

interface ErpMark {
  MARK_NO: string;     // 特征组代号
  MARK_NAME: string;   // 特征组名称 (如 MB001)
  REM: string | null;  // 备注
}

interface ErpPrdMark {
  MARK_NO: string;     // 特征组代号
  PRD_MARK: string;    // 具体特征值
  MARK_NAME: string;   // 特征名称
}

@Injectable()
export class ErpProductSyncService {
  private readonly logger = new Logger(ErpProductSyncService.name);
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
        // 支持中文字符编码
        tdsVersion: '7_4',
      },
      // 设置请求超时
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
   * 从品名中提取产品组前缀
   * 例如: "MB001-涤锦经编抹布10PCS" => "MB001"
   */
  private extractPrefix(name: string): string {
    // 匹配 字母+数字 的前缀模式
    const match = name.match(/^([A-Z]+\d+)/i);
    return match ? match[1].toUpperCase() : name.split('-')[0].toUpperCase();
  }

  /**
   * 从品名中提取分类代码
   * 例如: "MB001" => "MB"
   */
  private extractCategoryCode(prefix: string): string {
    const match = prefix.match(/^([A-Z]+)/i);
    return match ? match[1].toUpperCase() : prefix;
  }

  /**
   * 获取同步基准时间（首次同步时设置为当前时间，之后不再改变）
   * 确保不会同步基准时间之前的历史旧数据
   */
  async getSyncBaselineTime(): Promise<Date> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: 'erp_product_sync_baseline' },
    });

    if (config?.configValue) {
      return new Date(config.configValue);
    }

    // 首次同步，设置当前时间为基准点
    const now = new Date();
    await this.prisma.systemConfig.create({
      data: {
        configKey: 'erp_product_sync_baseline',
        configValue: now.toISOString(),
        configType: 'text',
        description: 'ERP 产品同步基准时间点（不同步此时间之前的历史数据）',
      },
    });
    this.logger.log(`[产品同步] 设置同步基准时间: ${now.toISOString()}`);
    return now;
  }

  /**
   * 同步产品数据（始终只同步基准时间之后的数据）
   * @param incremental 是否增量同步（只同步上次同步之后的）
   * @param days 增量同步的天数范围（仅在增量模式下使用）
   *
   * 重要：为了避免同步历史旧数据，所有同步都会使用基准时间过滤
   * - 首次同步：设置当前时间为基准，不同步任何历史数据
   * - 后续同步：只同步基准时间之后新增/修改的产品
   */
  async syncProducts(incremental = false, days = 1): Promise<ProductSyncResult> {
    const startTime = Date.now();
    const syncConfig = getErpSyncConfig();

    if (!syncConfig.enabled) {
      return {
        success: false,
        groupsCreated: 0,
        groupsUpdated: 0,
        skusCreated: 0,
        skusUpdated: 0,
        duration: Date.now() - startTime,
        error: 'ERP 同步未启用',
      };
    }

    let groupsCreated = 0;
    let groupsUpdated = 0;
    let skusCreated = 0;
    let skusUpdated = 0;

    try {
      const pool = await this.getPool();

      // 获取同步基准时间（确保不同步历史旧数据）
      const baselineTime = await this.getSyncBaselineTime();
      const lastSyncTime = await this.getLastSyncTime();

      // 确定查询的起始时间
      let sinceDate: Date;
      if (incremental && lastSyncTime) {
        // 增量同步：从上次同步时间开始
        sinceDate = lastSyncTime;
        this.logger.log(`[产品同步] 增量同步，从 ${sinceDate.toISOString()} 开始`);
      } else {
        // 全量同步或首次同步：从基准时间开始（不同步历史数据）
        sinceDate = baselineTime;
        this.logger.log(`[产品同步] 全量同步，从基准时间 ${sinceDate.toISOString()} 开始（不同步历史数据）`);
      }

      // 1. 查询 ERP 产品数据 - 必须有 MARK_NO 且在基准时间之后
      // 使用 CAST 转换 varchar 到 nvarchar 解决中文编码问题
      const sinceDateStr = sinceDate.toISOString().split('T')[0];
      const productQuery = `
        SELECT PRD_NO,
               CAST(NAME AS NVARCHAR(200)) AS NAME,
               CAST(SPC AS NVARCHAR(MAX)) AS SPC,
               MARK_NO,
               RECORD_DD
        FROM PRDT
        WHERE MARK_NO IS NOT NULL AND MARK_NO <> ''
          AND RECORD_DD >= '${sinceDateStr}'
      `;

      const productsResult = await pool.request().query<ErpProduct>(productQuery);
      const products = productsResult.recordset;
      this.logger.log(`[产品同步] 查询到 ${products.length} 个产品`);

      if (products.length === 0) {
        return {
          success: true,
          groupsCreated: 0,
          groupsUpdated: 0,
          skusCreated: 0,
          skusUpdated: 0,
          duration: Date.now() - startTime,
        };
      }

      // 2. 获取所有相关的特征组
      const markNos = [...new Set(products.map(p => p.MARK_NO).filter(Boolean))];
      const marksResult = await pool.request().query<ErpMark>(`
        SELECT MARK_NO,
               CAST(MARK_NAME AS NVARCHAR(100)) AS MARK_NAME,
               CAST(REM AS NVARCHAR(200)) AS REM
        FROM MARKS
        WHERE MARK_NO IN ('${markNos.join("','")}')
      `);
      const marksMap = new Map<string, ErpMark>(marksResult.recordset.map(m => [m.MARK_NO, m]));

      // 3. 获取所有相关的特征值（附加属性）
      const prdMarksResult = await pool.request().query<ErpPrdMark>(`
        SELECT MARK_NO,
               CAST(PRD_MARK AS NVARCHAR(255)) AS PRD_MARK,
               CAST(MARK_NAME AS NVARCHAR(100)) AS MARK_NAME
        FROM PRD_MARKS
        WHERE MARK_NO IN ('${markNos.join("','")}')
      `);

      // 按 MARK_NO 分组特征值
      const prdMarksMap = new Map<string, ErpPrdMark[]>();
      for (const pm of prdMarksResult.recordset) {
        if (!prdMarksMap.has(pm.MARK_NO)) {
          prdMarksMap.set(pm.MARK_NO, []);
        }
        prdMarksMap.get(pm.MARK_NO)!.push(pm);
      }

      // 4. 按品名前缀分组产品
      const groupedProducts = new Map<string, ErpProduct[]>();
      for (const product of products) {
        const prefix = this.extractPrefix(product.NAME);
        if (!groupedProducts.has(prefix)) {
          groupedProducts.set(prefix, []);
        }
        groupedProducts.get(prefix)!.push(product);
      }

      this.logger.log(`[产品同步] 分为 ${groupedProducts.size} 个产品组`);

      // 5. 同步每个产品组
      for (const [prefix, groupProducts] of groupedProducts) {
        const firstProduct = groupProducts[0];
        const markNo = firstProduct.MARK_NO;
        const mark = markNo ? marksMap.get(markNo) : null;
        const prdMarks = markNo ? prdMarksMap.get(markNo) || [] : [];

        // 构建附加属性
        const optionalAttributes = prdMarks.map(pm => ({
          nameZh: pm.PRD_MARK,
          nameEn: pm.MARK_NAME || pm.PRD_MARK,
        }));

        // 提取分类代码
        const categoryCode = this.extractCategoryCode(prefix);

        // 查找或创建分类
        let category = await this.prisma.category.findUnique({
          where: { code: categoryCode },
        });

        if (!category) {
          category = await this.prisma.category.create({
            data: {
              code: categoryCode,
              nameZh: categoryCode,
              nameEn: categoryCode,
              isAutoCreated: true,
            },
          });
          this.logger.log(`[产品同步] 自动创建分类: ${categoryCode}`);
        }

        // 查找或创建产品组
        let productGroup = await this.prisma.productGroup.findUnique({
          where: { prefix },
        });

        if (productGroup) {
          // 更新产品组
          await this.prisma.productGroup.update({
            where: { id: productGroup.id },
            data: {
              categoryId: category.id,
              categoryCode: category.code,
              optionalAttributes: optionalAttributes.length > 0 ? optionalAttributes : undefined,
            },
          });
          groupsUpdated++;
        } else {
          // 创建产品组
          productGroup = await this.prisma.productGroup.create({
            data: {
              prefix,
              groupNameZh: mark?.MARK_NAME || prefix,
              groupNameEn: mark?.MARK_NAME || prefix,
              categoryId: category.id,
              categoryCode: category.code,
              optionalAttributes: optionalAttributes.length > 0 ? optionalAttributes : undefined,
              descriptionZh: mark?.REM || null,
            },
          });
          groupsCreated++;
        }

        // 6. 同步 SKU
        for (const product of groupProducts) {
          const existingSku = await this.prisma.productSku.findUnique({
            where: { productCode: product.PRD_NO },
          });

          if (existingSku) {
            // 更新 SKU
            await this.prisma.productSku.update({
              where: { id: existingSku.id },
              data: {
                productName: product.NAME,
                specification: product.SPC || null,
                groupId: productGroup.id,
              },
            });
            skusUpdated++;
          } else {
            // 创建 SKU（默认启用）
            await this.prisma.productSku.create({
              data: {
                productCode: product.PRD_NO,
                productName: product.NAME,
                specification: product.SPC || null,
                groupId: productGroup.id,
                importDate: product.RECORD_DD,
                isActive: true,
              },
            });
            skusCreated++;
          }
        }
      }

      // 7. 更新产品组的计算字段
      await this.updateGroupCalculatedFields();

      const duration = Date.now() - startTime;
      this.logger.log(
        `[产品同步] 完成! 产品组: 新增${groupsCreated}/更新${groupsUpdated}, SKU: 新增${skusCreated}/更新${skusUpdated}, 耗时${duration}ms`,
      );

      return {
        success: true,
        groupsCreated,
        groupsUpdated,
        skusCreated,
        skusUpdated,
        duration,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`[产品同步] 失败: ${errorMessage}`);

      return {
        success: false,
        groupsCreated,
        groupsUpdated,
        skusCreated,
        skusUpdated,
        duration: Date.now() - startTime,
        error: errorMessage,
      };
    }
  }

  /**
   * 更新产品组的计算字段（最低价、最高价、规格数量、主图）
   */
  private async updateGroupCalculatedFields(): Promise<void> {
    const groups = await this.prisma.productGroup.findMany({
      include: {
        skus: {
          select: {
            price: true,
            images: true,
          },
        },
      },
    });

    for (const group of groups) {
      const prices = group.skus
        .map(s => s.price?.toNumber())
        .filter((p): p is number => p !== null && p !== undefined);

      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
      const specCount = group.skus.length;

      // 获取主图（第一个有图片的SKU的第一张图）
      let mainImage: string | null = null;
      for (const sku of group.skus) {
        if (sku.images && Array.isArray(sku.images) && sku.images.length > 0) {
          const firstImage = sku.images[0] as { url?: string };
          if (firstImage.url) {
            mainImage = firstImage.url;
            break;
          }
        }
      }

      await this.prisma.productGroup.update({
        where: { id: group.id },
        data: {
          minPrice,
          maxPrice,
          specCount,
          mainImage,
        },
      });
    }
  }

  /**
   * 获取上次同步时间
   */
  async getLastSyncTime(): Promise<Date | null> {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey: 'erp_product_last_sync' },
    });
    return config?.configValue ? new Date(config.configValue) : null;
  }

  /**
   * 记录同步时间
   */
  async recordSyncTime(): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { configKey: 'erp_product_last_sync' },
      update: { configValue: new Date().toISOString() },
      create: {
        configKey: 'erp_product_last_sync',
        configValue: new Date().toISOString(),
        configType: 'text',
        description: 'ERP 产品同步最后执行时间',
      },
    });
  }

  /**
   * 执行同步并记录时间
   */
  async syncAndRecord(incremental = false, days = 1): Promise<ProductSyncResult> {
    const result = await this.syncProducts(incremental, days);
    if (result.success) {
      await this.recordSyncTime();
    }
    return result;
  }
}

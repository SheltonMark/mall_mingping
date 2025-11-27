import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma.service';
import {
  getErpDatabaseConfig,
  getErpSyncConfig,
} from '../config/erp-database.config';
import { ErpEntitySyncService } from './erp-entity-sync.service';

export interface SyncResult {
  success: boolean;
  erpOrderNo?: string;
  webOrderId: string;
  error?: string;
  autoSyncedCustomer?: boolean;
  autoSyncedSalesperson?: boolean;
}

/**
 * 从附加属性中提取中文名称
 * 附加属性可能是 JSON 字符串 {"nameEn":"...","nameZh":"..."} 或纯文本
 */
function extractChineseAttribute(additionalAttributes: string | null): string {
  if (!additionalAttributes) return '';

  try {
    const parsed = JSON.parse(additionalAttributes);
    // 优先返回中文，如果没有则返回英文，都没有则返回空
    return parsed.nameZh || parsed.nameEn || '';
  } catch {
    // 如果不是 JSON，直接返回原值
    return additionalAttributes;
  }
}

/**
 * 按字节长度截取字符串（用于 GBK 编码的 varchar 字段）
 * 中文字符占 2 字节，英文字符占 1 字节
 */
function truncateByBytes(str: string, maxBytes: number): string {
  if (!str) return '';

  let bytes = 0;
  let result = '';

  for (const char of str) {
    // 中文字符占 2 字节，其他占 1 字节
    const charBytes = char.charCodeAt(0) > 127 ? 2 : 1;
    if (bytes + charBytes > maxBytes) break;
    bytes += charBytes;
    result += char;
  }

  return result;
}

@Injectable()
export class ErpOrderSyncService {
  private readonly logger = new Logger(ErpOrderSyncService.name);
  private pool: sql.ConnectionPool | null = null;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ErpEntitySyncService))
    private readonly erpEntitySyncService: ErpEntitySyncService,
  ) {}

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
      options: config.options,
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
   * 生成 ERP 订单编号
   * 格式：SO + 年(4位) + 月(2位) + 流水号(不补零)
   * 示例：SO202511052 (2025年11月第52单)
   */
  private async generateOrderNumber(pool: sql.ConnectionPool): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;

    const result = await pool.request().query(`
      SELECT MAX(CAST(SUBSTRING(OS_NO, 9, 10) AS INT)) as maxSeq
      FROM MF_POS
      WHERE OS_ID = 'SO' AND OS_NO LIKE '${prefix}%'
    `);

    const nextSeq = (result.recordset[0]?.maxSeq || 0) + 1;
    return `${prefix}${nextSeq}`;
  }

  /**
   * 获取 ERP 客户编号
   */
  private async getErpCustomerNo(customerId: string): Promise<string | null> {
    const mapping = await this.prisma.erpCustomerMapping.findUnique({
      where: { websiteCustomerId: customerId },
    });
    return mapping?.erpCustomerNo || null;
  }

  /**
   * 获取 ERP 业务员编号
   */
  private async getErpSalespersonNo(
    salespersonId: string,
  ): Promise<string | null> {
    const mapping = await this.prisma.erpSalespersonMapping.findUnique({
      where: { websiteSalespersonId: salespersonId },
    });
    return mapping?.erpSalespersonNo || null;
  }

  /**
   * 将网站订单同步到 ERP
   */
  async syncOrderToErp(orderId: string): Promise<SyncResult> {
    const syncConfig = getErpSyncConfig();

    // 检查是否启用同步
    if (!syncConfig.enabled) {
      this.logger.warn('ERP 同步未启用，跳过同步');
      return {
        success: false,
        webOrderId: orderId,
        error: 'ERP 同步未启用',
      };
    }

    // 1. 从网站数据库读取订单
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            productSku: {
              include: {
                group: true,
              },
            },
          },
        },
        customer: true,
        salesperson: true,
        customParams: true,
      },
    });

    if (!order) {
      return {
        success: false,
        webOrderId: orderId,
        error: `订单 ${orderId} 不存在`,
      };
    }

    // 2. 自动同步客户和业务员到 ERP（方案B）
    let autoSyncedCustomer = false;
    let autoSyncedSalesperson = false;

    const entitySyncResult = await this.erpEntitySyncService.ensureOrderEntitiesSynced(orderId);
    if (!entitySyncResult.success) {
      return {
        success: false,
        webOrderId: orderId,
        error: `实体同步失败: ${entitySyncResult.error}`,
      };
    }

    autoSyncedCustomer = !entitySyncResult.customerResult?.alreadyExists;
    autoSyncedSalesperson = !entitySyncResult.salespersonResult?.alreadyExists;

    if (autoSyncedCustomer) {
      this.logger.log(`[ERP Sync] 自动同步客户: ${order.customer.name} -> ${entitySyncResult.customerResult?.erpNo}`);
    }
    if (autoSyncedSalesperson) {
      this.logger.log(`[ERP Sync] 自动同步业务员: ${order.salesperson.chineseName} -> ${entitySyncResult.salespersonResult?.erpNo}`);
    }

    // 3. 获取 ERP 客户和业务员编号（现在肯定存在了）
    const erpCustomerNo = entitySyncResult.customerResult!.erpNo;
    const erpSalespersonNo = entitySyncResult.salespersonResult!.erpNo;

    let pool: sql.ConnectionPool;
    let transaction: sql.Transaction;

    try {
      // 3. 获取数据库连接并开启事务
      pool = await this.getPool();
      transaction = new sql.Transaction(pool);
      await transaction.begin();

      this.logger.log(`[ERP Sync] 开始同步订单: ${orderId}`);

      // 4. 生成 ERP 订单编号
      const erpOrderNo = await this.generateOrderNumber(pool);
      this.logger.log(`[ERP Sync] 生成订单号: ${erpOrderNo}`);

      // 5. 构建自定义参数 JSON
      const customParamsJson = order.customParams.reduce(
        (acc, param) => {
          acc[param.paramKey] = param.paramValue;
          return acc;
        },
        {} as Record<string, string | null>,
      );

      // 6. 写入主表 MF_POS
      // 使用sql.NVarChar类型，SQL Server会自动转换到varchar字段
      const mfPosRequest = new sql.Request(transaction);
      await mfPosRequest
        .input('OS_NO', sql.NVarChar(20), erpOrderNo)
        .input('OS_DD', sql.DateTime, order.orderDate)
        .input('CUS_NO', sql.NVarChar(12), erpCustomerNo)
        .input('SAL_NO', sql.NVarChar(12), erpSalespersonNo)
        .input(
          'AMTN_INT',
          sql.Numeric(28, 8),
          order.totalAmount?.toNumber() || 0,
        )
        .input('USR', sql.NVarChar(8), erpSalespersonNo)
        .input(
          'EST_DD',
          sql.DateTime,
          order.items[0]?.expectedDeliveryDate || null,
        )
        .input('REM', sql.NVarChar(sql.MAX), JSON.stringify(customParamsJson)).query(`
          INSERT INTO MF_POS (
            OS_ID, OS_NO, OS_DD, CUS_NO, SAL_NO,
            AMTN_INT, USR, RECORD_DD, CLS_ID,
            EST_DD, SEND_MTH, SEND_WH, PAY_MTH, REM
          ) VALUES (
            'SO', @OS_NO, @OS_DD, @CUS_NO, @SAL_NO,
            @AMTN_INT, @USR, GETDATE(), 'F',
            @EST_DD, '1', '${syncConfig.defaultWarehouse}', '1', @REM
          )
        `);

      this.logger.log(`[ERP Sync] MF_POS 写入成功`);

      // 7. 写入明细表 TF_POS 和扩展表 TF_POS_Z
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const itemNumber = item.itemNumber || i + 1;

        // 计算金额
        const price = item.price.toNumber();
        const quantity = item.quantity;
        const amtn = price * quantity; // 未税金额
        const tax = amtn * syncConfig.taxRate; // 税额
        const amt = amtn + tax; // 含税金额

        // 提取中文附加属性
        const chineseAttribute = extractChineseAttribute(item.additionalAttributes);

        // 7.1 写入 TF_POS 主表
        // 使用sql.NVarChar类型，SQL Server会自动转换到varchar字段
        // 用truncateByBytes确保中文字符串不超过字段的字节限制
        const tfPosRequest = new sql.Request(transaction);
        await tfPosRequest
          .input('OS_NO', sql.NVarChar(20), erpOrderNo)
          .input('ITM', sql.SmallInt, itemNumber)
          .input('PRD_NO', sql.NVarChar(50), truncateByBytes(item.productSku.productCode || '', 50))
          .input(
            'PRD_NAME',
            sql.NVarChar(100),
            truncateByBytes(item.productSku.productName || '', 100),
          )
          .input(
            'PRD_MARK',
            sql.NVarChar(255),
            truncateByBytes(chineseAttribute, 255),
          )
          .input('QTY', sql.Numeric(28, 8), quantity)
          .input('UP', sql.Numeric(28, 8), price)
          .input('AMT', sql.Numeric(28, 8), amt)
          .input('AMTN', sql.Numeric(28, 8), amtn)
          .input('TAX', sql.Numeric(28, 8), tax)
          .input('SPC', sql.NVarChar(2000), truncateByBytes(String(item.productSpec || ''), 2000))
          .input(
            'ATTR',
            sql.NVarChar(30),
            truncateByBytes(chineseAttribute, 30),
          )
          .input('PAK_UNIT', sql.NVarChar(24), truncateByBytes(item.packagingUnit || '', 24))
          .input(
            'PAK_EXC',
            sql.Numeric(28, 8),
            item.packagingConversion?.toNumber() || 0,
          )
          .input(
            'PAK_NW',
            sql.Numeric(28, 8),
            item.netWeight?.toNumber() || 0,
          )
          .input(
            'PAK_GW',
            sql.Numeric(28, 8),
            item.grossWeight?.toNumber() || 0,
          )
          .input('PAK_WEIGHT_UNIT', sql.NVarChar(8), truncateByBytes(item.weightUnit || '', 8))
          .input(
            'PAK_MEAST',
            sql.Numeric(28, 8),
            item.volume?.toNumber() || 0,
          )
          .input('EST_DD', sql.DateTime, item.expectedDeliveryDate || null)
          .input('REM', sql.NVarChar(1000), truncateByBytes(item.supplierNote || '', 1000))
          .input('BZ_KND', sql.NVarChar(20), truncateByBytes(item.packagingType || '', 20))
          .input('OS_DD', sql.DateTime, order.orderDate).query(`
            INSERT INTO TF_POS (
              OS_ID, OS_NO, ITM, PRD_NO, PRD_NAME, PRD_MARK,
              QTY, UP, AMT, AMTN, TAX,
              SPC, ATTR, PAK_UNIT, PAK_EXC,
              PAK_NW, PAK_GW, PAK_WEIGHT_UNIT,
              PAK_MEAST, PAK_MEAST_UNIT,
              EST_DD, REM, BZ_KND, OS_DD,
              WH, UNIT, TAX_RTO
            ) VALUES (
              'SO', @OS_NO, @ITM, @PRD_NO, @PRD_NAME, @PRD_MARK,
              @QTY, @UP, @AMT, @AMTN, @TAX,
              @SPC, @ATTR, @PAK_UNIT, @PAK_EXC,
              @PAK_NW, @PAK_GW, @PAK_WEIGHT_UNIT,
              @PAK_MEAST, 'm³',
              @EST_DD, @REM, @BZ_KND, @OS_DD,
              '${syncConfig.defaultWarehouse}', '1', ${syncConfig.taxRate * 100}
            )
          `);

        // 7.2 写入 TF_POS_Z 扩展表（7个包装字段）
        const tfPosZRequest = new sql.Request(transaction);
        await tfPosZRequest
          .input('OS_NO', sql.NVarChar(20), erpOrderNo)
          .input('ITM', sql.SmallInt, itemNumber)
          .input('PQTY1', sql.Int, item.packingQuantity || null)
          .input('PQTY2', sql.Int, item.cartonQuantity || null)
          .input('BZFS', sql.NVarChar(255), truncateByBytes(item.packagingMethod || '', 255))
          .input('DKBM', sql.NVarChar(50), truncateByBytes(item.paperCardCode || '', 50))
          .input('WXBM', sql.NVarChar(50), truncateByBytes(item.washLabelCode || '', 50))
          .input('SXBBM', sql.NVarChar(255), truncateByBytes(item.outerCartonCode || '', 255))
          .input('XG', sql.NVarChar(50), truncateByBytes(item.cartonSpecification || '', 50)).query(`
            INSERT INTO TF_POS_Z (
              OS_ID, OS_NO, ITM,
              PQTY1, PQTY2, BZFS,
              DKBM, WXBM, SXBBM, XG
            ) VALUES (
              'SO', @OS_NO, @ITM,
              @PQTY1, @PQTY2, @BZFS,
              @DKBM, @WXBM, @SXBBM, @XG
            )
          `);

        this.logger.log(`[ERP Sync] 明细 ${itemNumber} 写入成功`);
      }

      // 8. 提交事务
      await transaction.commit();
      this.logger.log(`[ERP Sync] 订单同步完成: ${erpOrderNo}`);

      // 9. 更新网站订单的 ERP 同步状态
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          erpOrderNo,
          erpSyncStatus: 'synced',
          erpSyncAt: new Date(),
          erpSyncError: null,
        },
      });

      return {
        success: true,
        erpOrderNo,
        webOrderId: orderId,
        autoSyncedCustomer,
        autoSyncedSalesperson,
      };
    } catch (error) {
      // 回滚事务
      if (transaction!) {
        try {
          await transaction!.rollback();
        } catch (rollbackError) {
          this.logger.error(
            `[ERP Sync] 事务回滚失败: ${rollbackError.message}`,
          );
        }
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`[ERP Sync] 同步失败: ${errorMessage}`);

      // 更新同步失败状态
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          erpSyncStatus: 'failed',
          erpSyncError: errorMessage,
        },
      });

      return {
        success: false,
        webOrderId: orderId,
        error: errorMessage,
      };
    }
  }

  /**
   * 批量同步订单到 ERP
   */
  async syncOrdersToErp(orderIds: string[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const orderId of orderIds) {
      const result = await this.syncOrderToErp(orderId);
      results.push(result);
    }

    return results;
  }

  /**
   * 获取同步失败的订单列表
   */
  async getFailedSyncOrders() {
    return this.prisma.order.findMany({
      where: { erpSyncStatus: 'failed' },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        salesperson: {
          select: { id: true, chineseName: true, accountId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取待同步的订单列表
   */
  async getPendingSyncOrders() {
    return this.prisma.order.findMany({
      where: {
        OR: [{ erpSyncStatus: null }, { erpSyncStatus: 'pending' }],
      },
      include: {
        customer: {
          select: { id: true, name: true },
        },
        salesperson: {
          select: { id: true, chineseName: true, accountId: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============ 映射管理方法 ============

  /**
   * 创建客户映射
   */
  async createCustomerMapping(
    websiteCustomerId: string,
    erpCustomerNo: string,
  ) {
    return this.prisma.erpCustomerMapping.create({
      data: {
        websiteCustomerId,
        erpCustomerNo,
      },
    });
  }

  /**
   * 创建业务员映射
   */
  async createSalespersonMapping(
    websiteSalespersonId: string,
    erpSalespersonNo: string,
  ) {
    return this.prisma.erpSalespersonMapping.create({
      data: {
        websiteSalespersonId,
        erpSalespersonNo,
      },
    });
  }

  /**
   * 获取所有客户映射
   */
  async getAllCustomerMappings() {
    return this.prisma.erpCustomerMapping.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 获取所有业务员映射
   */
  async getAllSalespersonMappings() {
    return this.prisma.erpSalespersonMapping.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 删除客户映射
   */
  async deleteCustomerMapping(id: string) {
    return this.prisma.erpCustomerMapping.delete({
      where: { id },
    });
  }

  /**
   * 删除业务员映射
   */
  async deleteSalespersonMapping(id: string) {
    return this.prisma.erpSalespersonMapping.delete({
      where: { id },
    });
  }

  /**
   * 更新客户映射
   */
  async updateCustomerMapping(id: string, erpCustomerNo: string) {
    return this.prisma.erpCustomerMapping.update({
      where: { id },
      data: { erpCustomerNo },
    });
  }

  /**
   * 更新业务员映射
   */
  async updateSalespersonMapping(id: string, erpSalespersonNo: string) {
    return this.prisma.erpSalespersonMapping.update({
      where: { id },
      data: { erpSalespersonNo },
    });
  }
}

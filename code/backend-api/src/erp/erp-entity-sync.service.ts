import { Injectable, Logger } from '@nestjs/common';
import * as sql from 'mssql';
import { PrismaService } from '../prisma.service';
import { getErpDatabaseConfig } from '../config/erp-database.config';

/**
 * ERP 实体同步服务
 * 用于将网站的客户和业务员同步到 ERP 数据库
 *
 * 测试数据使用 TEST_ 前缀，便于后续清理
 */
@Injectable()
export class ErpEntitySyncService {
  private readonly logger = new Logger(ErpEntitySyncService.name);
  private pool: sql.ConnectionPool | null = null;

  // 测试数据前缀，方便后续清理
  private readonly TEST_PREFIX = 'TEST_';

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
      options: config.options,
    }).connect();

    this.logger.log('ERP 数据库连接成功');
    return this.pool;
  }

  /**
   * 生成 ERP 客户编号
   * 格式：TEST_C + 流水号(4位)
   * 示例：TEST_C001
   */
  private async generateCustomerNo(pool: sql.ConnectionPool): Promise<string> {
    const prefix = `${this.TEST_PREFIX}C`;

    const result = await pool.request().query(`
      SELECT MAX(CAST(SUBSTRING(CUS_NO, ${prefix.length + 1}, 4) AS INT)) as maxSeq
      FROM CUST
      WHERE CUS_NO LIKE '${prefix}%'
    `);

    const nextSeq = (result.recordset[0]?.maxSeq || 0) + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * 生成 ERP 业务员编号
   * 格式：TEST_S + 流水号(4位)
   * 示例：TEST_S001
   */
  private async generateSalespersonNo(pool: sql.ConnectionPool): Promise<string> {
    const prefix = `${this.TEST_PREFIX}S`;

    const result = await pool.request().query(`
      SELECT MAX(CAST(SUBSTRING(SAL_NO, ${prefix.length + 1}, 4) AS INT)) as maxSeq
      FROM SALM
      WHERE SAL_NO LIKE '${prefix}%'
    `);

    const nextSeq = (result.recordset[0]?.maxSeq || 0) + 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  /**
   * 同步客户到 ERP 数据库
   * 如果客户已存在映射则跳过，否则创建新记录并建立映射
   */
  async syncCustomerToErp(customerId: string): Promise<{
    success: boolean;
    erpCustomerNo?: string;
    error?: string;
    alreadyExists?: boolean;
  }> {
    try {
      // 1. 检查是否已有映射
      const existingMapping = await this.prisma.erpCustomerMapping.findUnique({
        where: { websiteCustomerId: customerId },
      });

      if (existingMapping) {
        this.logger.log(`客户 ${customerId} 已存在映射: ${existingMapping.erpCustomerNo}`);
        return {
          success: true,
          erpCustomerNo: existingMapping.erpCustomerNo,
          alreadyExists: true,
        };
      }

      // 2. 获取客户信息
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          salesperson: true,
        },
      });

      if (!customer) {
        return {
          success: false,
          error: `客户 ${customerId} 不存在`,
        };
      }

      // 3. 获取数据库连接
      const pool = await this.getPool();

      // 4. 生成 ERP 客户编号
      const erpCustomerNo = await this.generateCustomerNo(pool);

      // 5. 获取业务员的 ERP 编号（如果有的话）
      let erpSalespersonNo: string | null = null;
      const salespersonMapping = await this.prisma.erpSalespersonMapping.findUnique({
        where: { websiteSalespersonId: customer.salespersonId },
      });
      if (salespersonMapping) {
        erpSalespersonNo = salespersonMapping.erpSalespersonNo;
      }

      // 6. 插入 ERP CUST 表
      const request = new sql.Request(pool);
      await request
        .input('CUS_NO', sql.VarChar(12), erpCustomerNo)
        .input('NAME', sql.VarChar(110), customer.name?.substring(0, 110) || '')
        .input('OBJ_ID', sql.VarChar(1), '1') // 1=客户
        .input('TEL1', sql.VarChar(30), customer.phone?.substring(0, 30) || '')
        .input('E_MAIL', sql.VarChar(255), customer.email?.substring(0, 255) || '')
        .input('COUNTRY', sql.VarChar(20), customer.country?.substring(0, 20) || '')
        .input('CNT_MAN1', sql.VarChar(30), customer.contactPerson?.substring(0, 30) || '')
        .input('SAL', sql.VarChar(12), erpSalespersonNo || '')
        .input('REM', sql.Text, customer.remarks || `网站同步 - ${new Date().toISOString()}`)
        .query(`
          INSERT INTO CUST (
            CUS_NO, NAME, OBJ_ID, TEL1, E_MAIL,
            COUNTRY, CNT_MAN1, SAL, REM,
            CREATE_DD, RECORD_DD
          ) VALUES (
            @CUS_NO, @NAME, @OBJ_ID, @TEL1, @E_MAIL,
            @COUNTRY, @CNT_MAN1, @SAL, @REM,
            GETDATE(), GETDATE()
          )
        `);

      this.logger.log(`客户同步成功: ${customer.name} -> ${erpCustomerNo}`);

      // 7. 创建映射关系
      await this.prisma.erpCustomerMapping.create({
        data: {
          websiteCustomerId: customerId,
          erpCustomerNo: erpCustomerNo,
        },
      });

      return {
        success: true,
        erpCustomerNo,
        alreadyExists: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`客户同步失败: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 同步业务员到 ERP 数据库
   * 如果业务员已存在映射则跳过，否则创建新记录并建立映射
   */
  async syncSalespersonToErp(salespersonId: string): Promise<{
    success: boolean;
    erpSalespersonNo?: string;
    error?: string;
    alreadyExists?: boolean;
  }> {
    try {
      // 1. 检查是否已有映射
      const existingMapping = await this.prisma.erpSalespersonMapping.findUnique({
        where: { websiteSalespersonId: salespersonId },
      });

      if (existingMapping) {
        this.logger.log(`业务员 ${salespersonId} 已存在映射: ${existingMapping.erpSalespersonNo}`);
        return {
          success: true,
          erpSalespersonNo: existingMapping.erpSalespersonNo,
          alreadyExists: true,
        };
      }

      // 2. 获取业务员信息
      const salesperson = await this.prisma.salesperson.findUnique({
        where: { id: salespersonId },
      });

      if (!salesperson) {
        return {
          success: false,
          error: `业务员 ${salespersonId} 不存在`,
        };
      }

      // 3. 获取数据库连接
      const pool = await this.getPool();

      // 4. 生成 ERP 业务员编号
      const erpSalespersonNo = await this.generateSalespersonNo(pool);

      // 5. 插入 ERP SALM 表
      const request = new sql.Request(pool);
      await request
        .input('SAL_NO', sql.VarChar(12), erpSalespersonNo)
        .input('NAME', sql.VarChar(100), salesperson.chineseName?.substring(0, 100) || '')
        .query(`
          INSERT INTO SALM (
            SAL_NO, NAME
          ) VALUES (
            @SAL_NO, @NAME
          )
        `);

      this.logger.log(`业务员同步成功: ${salesperson.chineseName} -> ${erpSalespersonNo}`);

      // 6. 创建映射关系
      await this.prisma.erpSalespersonMapping.create({
        data: {
          websiteSalespersonId: salespersonId,
          erpSalespersonNo: erpSalespersonNo,
        },
      });

      return {
        success: true,
        erpSalespersonNo,
        alreadyExists: false,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`业务员同步失败: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 确保客户和业务员都已同步到 ERP
   * 这个方法在订单同步前调用，确保映射存在
   */
  async ensureOrderEntitiesSynced(orderId: string): Promise<{
    success: boolean;
    customerResult?: { erpNo: string; alreadyExists: boolean };
    salespersonResult?: { erpNo: string; alreadyExists: boolean };
    error?: string;
  }> {
    try {
      // 获取订单信息
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        select: {
          customerId: true,
          salespersonId: true,
        },
      });

      if (!order) {
        return {
          success: false,
          error: `订单 ${orderId} 不存在`,
        };
      }

      // 先同步业务员（因为客户可能需要关联业务员）
      const salespersonResult = await this.syncSalespersonToErp(order.salespersonId);
      if (!salespersonResult.success) {
        return {
          success: false,
          error: `业务员同步失败: ${salespersonResult.error}`,
        };
      }

      // 再同步客户
      const customerResult = await this.syncCustomerToErp(order.customerId);
      if (!customerResult.success) {
        return {
          success: false,
          error: `客户同步失败: ${customerResult.error}`,
        };
      }

      return {
        success: true,
        customerResult: {
          erpNo: customerResult.erpCustomerNo!,
          alreadyExists: customerResult.alreadyExists || false,
        },
        salespersonResult: {
          erpNo: salespersonResult.erpSalespersonNo!,
          alreadyExists: salespersonResult.alreadyExists || false,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 清理测试数据
   * 删除所有带 TEST_ 前缀的客户和业务员数据
   */
  async cleanupTestData(): Promise<{
    success: boolean;
    deletedCustomers: number;
    deletedSalespersons: number;
    deletedCustomerMappings: number;
    deletedSalespersonMappings: number;
    error?: string;
  }> {
    try {
      const pool = await this.getPool();

      // 1. 删除 ERP 中的测试客户
      const custResult = await pool.request().query(`
        DELETE FROM CUST WHERE CUS_NO LIKE '${this.TEST_PREFIX}%'
      `);

      // 2. 删除 ERP 中的测试业务员
      const salmResult = await pool.request().query(`
        DELETE FROM SALM WHERE SAL_NO LIKE '${this.TEST_PREFIX}%'
      `);

      // 3. 删除网站数据库中对应的映射
      // 获取所有 TEST_ 开头的映射
      const testCustomerMappings = await this.prisma.erpCustomerMapping.findMany({
        where: {
          erpCustomerNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      const testSalespersonMappings = await this.prisma.erpSalespersonMapping.findMany({
        where: {
          erpSalespersonNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      // 删除映射
      await this.prisma.erpCustomerMapping.deleteMany({
        where: {
          erpCustomerNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      await this.prisma.erpSalespersonMapping.deleteMany({
        where: {
          erpSalespersonNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      this.logger.log(`测试数据清理完成: 客户 ${custResult.rowsAffected[0]}, 业务员 ${salmResult.rowsAffected[0]}`);

      return {
        success: true,
        deletedCustomers: custResult.rowsAffected[0] || 0,
        deletedSalespersons: salmResult.rowsAffected[0] || 0,
        deletedCustomerMappings: testCustomerMappings.length,
        deletedSalespersonMappings: testSalespersonMappings.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`测试数据清理失败: ${errorMessage}`);
      return {
        success: false,
        deletedCustomers: 0,
        deletedSalespersons: 0,
        deletedCustomerMappings: 0,
        deletedSalespersonMappings: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取所有测试数据的统计信息
   */
  async getTestDataStats(): Promise<{
    erpCustomers: number;
    erpSalespersons: number;
    customerMappings: number;
    salespersonMappings: number;
  }> {
    try {
      const pool = await this.getPool();

      const custResult = await pool.request().query(`
        SELECT COUNT(*) as count FROM CUST WHERE CUS_NO LIKE '${this.TEST_PREFIX}%'
      `);

      const salmResult = await pool.request().query(`
        SELECT COUNT(*) as count FROM SALM WHERE SAL_NO LIKE '${this.TEST_PREFIX}%'
      `);

      const customerMappingCount = await this.prisma.erpCustomerMapping.count({
        where: {
          erpCustomerNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      const salespersonMappingCount = await this.prisma.erpSalespersonMapping.count({
        where: {
          erpSalespersonNo: {
            startsWith: this.TEST_PREFIX,
          },
        },
      });

      return {
        erpCustomers: custResult.recordset[0]?.count || 0,
        erpSalespersons: salmResult.recordset[0]?.count || 0,
        customerMappings: customerMappingCount,
        salespersonMappings: salespersonMappingCount,
      };
    } catch (error) {
      this.logger.error(`获取测试数据统计失败: ${error}`);
      return {
        erpCustomers: 0,
        erpSalespersons: 0,
        customerMappings: 0,
        salespersonMappings: 0,
      };
    }
  }
}

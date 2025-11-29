import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsObject } from 'class-validator';
import { ErpOrderSyncService } from './erp-order-sync.service';
import { ErpProductSyncService } from './erp-product-sync.service';
import { ErpEntitySyncService } from './erp-entity-sync.service';
import { ErpCustomerSyncService } from './erp-customer-sync.service';
import { ErpSalespersonSyncService } from './erp-salesperson-sync.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// DTO 定义
class CreateMappingDto {
  @IsString()
  websiteId: string;

  @IsString()
  erpNo: string;
}

class UpdateMappingDto {
  @IsString()
  erpNo: string;
}

class BatchSyncDto {
  @IsArray()
  @IsString({ each: true })
  orderIds: string[];
}

class ProductSyncDto {
  @IsOptional()
  @IsBoolean()
  incremental?: boolean; // 是否增量同步，默认 true

  @IsOptional()
  @IsNumber()
  days?: number;         // 增量同步天数，默认 1
}

class ProductSyncSelectedDto {
  @IsArray()
  @IsString({ each: true })
  selectedGroups: string[]; // 选中的产品组前缀列表

  @IsObject()
  selectedSkus: Record<string, string[]>; // 每个产品组下选中的SKU编码列表
}

class CustomerSyncSelectedDto {
  @IsArray()
  @IsString({ each: true })
  selectedCusNos: string[]; // 选中的客户编号列表
}

class SalespersonSyncSelectedDto {
  @IsArray()
  @IsString({ each: true })
  selectedSalNos: string[]; // 选中的业务员编号列表
}

@Controller('erp')
@UseGuards(JwtAuthGuard)
export class ErpController {
  constructor(
    private readonly erpOrderSyncService: ErpOrderSyncService,
    private readonly erpProductSyncService: ErpProductSyncService,
    private readonly erpEntitySyncService: ErpEntitySyncService,
    private readonly erpCustomerSyncService: ErpCustomerSyncService,
    private readonly erpSalespersonSyncService: ErpSalespersonSyncService,
  ) {}

  // ============ 订单同步接口 ============

  /**
   * 同步单个订单到 ERP
   */
  @Post('orders/:orderId/sync')
  async syncOrder(@Param('orderId') orderId: string) {
    return this.erpOrderSyncService.syncOrderToErp(orderId);
  }

  /**
   * 重试同步失败的订单
   */
  @Post('orders/:orderId/retry')
  async retrySyncOrder(@Param('orderId') orderId: string) {
    return this.erpOrderSyncService.syncOrderToErp(orderId);
  }

  /**
   * 批量同步订单到 ERP
   */
  @Post('orders/batch-sync')
  async batchSyncOrders(@Body() dto: BatchSyncDto) {
    return this.erpOrderSyncService.syncOrdersToErp(dto.orderIds);
  }

  /**
   * 获取同步失败的订单列表
   */
  @Get('orders/failed')
  async getFailedOrders() {
    return this.erpOrderSyncService.getFailedSyncOrders();
  }

  /**
   * 获取待同步的订单列表
   */
  @Get('orders/pending')
  async getPendingOrders() {
    return this.erpOrderSyncService.getPendingSyncOrders();
  }

  // ============ 客户映射管理接口 ============

  /**
   * 获取所有客户映射
   */
  @Get('mappings/customers')
  async getCustomerMappings() {
    return this.erpOrderSyncService.getAllCustomerMappings();
  }

  /**
   * 创建客户映射
   */
  @Post('mappings/customers')
  async createCustomerMapping(@Body() dto: CreateMappingDto) {
    return this.erpOrderSyncService.createCustomerMapping(
      dto.websiteId,
      dto.erpNo,
    );
  }

  /**
   * 更新客户映射
   */
  @Put('mappings/customers/:id')
  async updateCustomerMapping(
    @Param('id') id: string,
    @Body() dto: UpdateMappingDto,
  ) {
    return this.erpOrderSyncService.updateCustomerMapping(id, dto.erpNo);
  }

  /**
   * 删除客户映射
   */
  @Delete('mappings/customers/:id')
  async deleteCustomerMapping(@Param('id') id: string) {
    return this.erpOrderSyncService.deleteCustomerMapping(id);
  }

  // ============ 业务员映射管理接口 ============

  /**
   * 获取所有业务员映射
   */
  @Get('mappings/salespersons')
  async getSalespersonMappings() {
    return this.erpOrderSyncService.getAllSalespersonMappings();
  }

  /**
   * 创建业务员映射
   */
  @Post('mappings/salespersons')
  async createSalespersonMapping(@Body() dto: CreateMappingDto) {
    return this.erpOrderSyncService.createSalespersonMapping(
      dto.websiteId,
      dto.erpNo,
    );
  }

  /**
   * 更新业务员映射
   */
  @Put('mappings/salespersons/:id')
  async updateSalespersonMapping(
    @Param('id') id: string,
    @Body() dto: UpdateMappingDto,
  ) {
    return this.erpOrderSyncService.updateSalespersonMapping(id, dto.erpNo);
  }

  /**
   * 删除业务员映射
   */
  @Delete('mappings/salespersons/:id')
  async deleteSalespersonMapping(@Param('id') id: string) {
    return this.erpOrderSyncService.deleteSalespersonMapping(id);
  }

  // ============ 产品同步接口 ============

  /**
   * 手动触发产品同步
   * POST /erp/products/sync
   * Body: { incremental?: boolean, days?: number }
   */
  @Post('products/sync')
  async syncProducts(@Body() dto: ProductSyncDto) {
    const incremental = dto.incremental !== false; // 默认增量同步
    const days = dto.days || 1;
    return this.erpProductSyncService.syncAndRecord(incremental, days);
  }

  /**
   * 全量同步产品
   * POST /erp/products/sync-full
   */
  @Post('products/sync-full')
  async syncProductsFull() {
    return this.erpProductSyncService.syncAndRecord(false);
  }

  /**
   * 获取上次同步时间和基准时间
   * GET /erp/products/last-sync
   */
  @Get('products/last-sync')
  async getLastSyncTime() {
    const lastSync = await this.erpProductSyncService.getLastSyncTime();
    const baseline = await this.erpProductSyncService.getSyncBaselineTime();

    return {
      lastSyncTime: lastSync?.toISOString() || null,
      lastSyncTimeFormatted: lastSync
        ? lastSync.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        : '从未同步',
      baselineTime: baseline.toISOString(),
      baselineTimeFormatted: baseline.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    };
  }

  /**
   * 预览待同步的产品（不实际同步）
   * GET /erp/products/preview
   * 返回待同步的产品组和SKU列表，供用户选择
   */
  @Get('products/preview')
  async previewProducts() {
    return this.erpProductSyncService.previewProducts();
  }

  /**
   * 选择性同步产品
   * POST /erp/products/sync-selected
   * Body: { selectedGroups: string[], selectedSkus: Record<string, string[]> }
   */
  @Post('products/sync-selected')
  async syncSelectedProducts(@Body() dto: ProductSyncSelectedDto) {
    return this.erpProductSyncService.syncSelectedProducts(
      dto.selectedGroups,
      dto.selectedSkus,
    );
  }

  // ============ 测试数据管理接口 ============

  /**
   * 获取测试数据统计（旧版TEST_前缀）
   * GET /erp/test-data/stats
   * 返回 ERP 中带 TEST_ 前缀的客户和业务员数量
   */
  @Get('test-data/stats')
  async getTestDataStats() {
    return this.erpEntitySyncService.getTestDataStats();
  }

  /**
   * 清理测试数据（旧版TEST_前缀）
   * DELETE /erp/test-data/cleanup
   * 删除 ERP 中所有带 TEST_ 前缀的客户和业务员
   */
  @Delete('test-data/cleanup')
  async cleanupTestData() {
    return this.erpEntitySyncService.cleanupTestData();
  }

  // ============ 网站同步数据管理接口 ============

  /**
   * 获取网站同步数据统计（W/W-s前缀）
   * GET /erp/web-sync-data/stats
   * 返回 ERP 中网站同步的客户和业务员数量
   */
  @Get('web-sync-data/stats')
  async getWebSyncDataStats() {
    return this.erpEntitySyncService.getWebSyncDataStats();
  }

  /**
   * 清理网站同步数据（W/W-s前缀）
   * DELETE /erp/web-sync-data/cleanup
   * 删除 ERP 中所有网站同步的客户和业务员
   */
  @Delete('web-sync-data/cleanup')
  async cleanupWebSyncData() {
    return this.erpEntitySyncService.cleanupWebSyncData();
  }

  // ============ 实体同步接口 ============

  /**
   * 手动同步客户到 ERP
   * POST /erp/entities/customers/:customerId/sync
   */
  @Post('entities/customers/:customerId/sync')
  async syncCustomer(@Param('customerId') customerId: string) {
    return this.erpEntitySyncService.syncCustomerToErp(customerId);
  }

  /**
   * 手动同步业务员到 ERP
   * POST /erp/entities/salespersons/:salespersonId/sync
   */
  @Post('entities/salespersons/:salespersonId/sync')
  async syncSalesperson(@Param('salespersonId') salespersonId: string) {
    return this.erpEntitySyncService.syncSalespersonToErp(salespersonId);
  }

  // ============ ERP 客户同步接口（从ERP读取到网站）============

  /**
   * 同步 ERP 客户到网站
   * POST /erp/erp-customers/sync
   */
  @Post('erp-customers/sync')
  async syncErpCustomers() {
    return this.erpCustomerSyncService.syncCustomers();
  }

  /**
   * 获取 ERP 客户上次同步时间
   * GET /erp/erp-customers/last-sync
   */
  @Get('erp-customers/last-sync')
  async getErpCustomerLastSyncTime() {
    const lastSync = await this.erpCustomerSyncService.getLastSyncTime();
    return {
      lastSyncTime: lastSync?.toISOString() || null,
      lastSyncTimeFormatted: lastSync
        ? lastSync.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        : '从未同步',
    };
  }

  /**
   * 获取所有 ERP 客户列表
   * GET /erp/erp-customers
   */
  @Get('erp-customers')
  async getErpCustomers(
    @Query('search') search?: string,
    @Query('salespersonId') salespersonId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.erpCustomerSyncService.findAll({
      search,
      salespersonId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  /**
   * 预览待同步的客户（不实际同步）
   * GET /erp/erp-customers/preview
   * 注意：此路由必须在 :id 路由之前声明
   */
  @Get('erp-customers/preview')
  async previewErpCustomers() {
    return this.erpCustomerSyncService.previewCustomers();
  }

  /**
   * 根据客户编号获取 ERP 客户
   * GET /erp/erp-customers/by-cus-no/:cusNo
   */
  @Get('erp-customers/by-cus-no/:cusNo')
  async getErpCustomerByCusNo(@Param('cusNo') cusNo: string) {
    return this.erpCustomerSyncService.findByCusNo(cusNo);
  }

  /**
   * 获取单个 ERP 客户
   * GET /erp/erp-customers/:id
   * 注意：此路由必须在具体路径路由之后声明
   */
  @Get('erp-customers/:id')
  async getErpCustomer(@Param('id') id: string) {
    return this.erpCustomerSyncService.findOne(id);
  }

  /**
   * 选择性同步客户
   * POST /erp/erp-customers/sync-selected
   */
  @Post('erp-customers/sync-selected')
  async syncSelectedErpCustomers(@Body() dto: CustomerSyncSelectedDto) {
    return this.erpCustomerSyncService.syncSelectedCustomers(dto.selectedCusNos);
  }

  // ============ ERP 业务员同步接口（从ERP读取到网站）============

  /**
   * 同步 ERP 业务员到网站
   * POST /erp/erp-salespersons/sync
   */
  @Post('erp-salespersons/sync')
  async syncErpSalespersons() {
    return this.erpSalespersonSyncService.syncSalespersons();
  }

  /**
   * 获取 ERP 业务员上次同步时间
   * GET /erp/erp-salespersons/last-sync
   */
  @Get('erp-salespersons/last-sync')
  async getErpSalespersonLastSyncTime() {
    const lastSync = await this.erpSalespersonSyncService.getLastSyncTime();
    return {
      lastSyncTime: lastSync?.toISOString() || null,
      lastSyncTimeFormatted: lastSync
        ? lastSync.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
        : '从未同步',
    };
  }

  /**
   * 获取所有业务员列表（带统计）
   * GET /erp/erp-salespersons
   */
  @Get('erp-salespersons')
  async getErpSalespersons(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.erpSalespersonSyncService.findAll({
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  /**
   * 预览待同步的业务员（不实际同步）
   * GET /erp/erp-salespersons/preview
   */
  @Get('erp-salespersons/preview')
  async previewErpSalespersons() {
    return this.erpSalespersonSyncService.previewSalespersons();
  }

  /**
   * 选择性同步业务员
   * POST /erp/erp-salespersons/sync-selected
   */
  @Post('erp-salespersons/sync-selected')
  async syncSelectedErpSalespersons(@Body() dto: SalespersonSyncSelectedDto) {
    return this.erpSalespersonSyncService.syncSelectedSalespersons(dto.selectedSalNos);
  }
}

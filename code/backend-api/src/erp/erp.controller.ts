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
import { ErpOrderSyncService } from './erp-order-sync.service';
import { ErpProductSyncService } from './erp-product-sync.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

// DTO 定义
class CreateMappingDto {
  websiteId: string;
  erpNo: string;
}

class UpdateMappingDto {
  erpNo: string;
}

class BatchSyncDto {
  orderIds: string[];
}

class ProductSyncDto {
  incremental?: boolean; // 是否增量同步，默认 true
  days?: number;         // 增量同步天数，默认 1
}

@Controller('erp')
@UseGuards(JwtAuthGuard)
export class ErpController {
  constructor(
    private readonly erpOrderSyncService: ErpOrderSyncService,
    private readonly erpProductSyncService: ErpProductSyncService,
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
}

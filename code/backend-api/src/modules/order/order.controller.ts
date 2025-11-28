import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  CreateOrderParamConfigDto,
  UpdateOrderParamConfigDto,
} from './dto/order.dto';
import { InternalAuthGuard } from '../../common/guards/internal-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ============ 静态路由（必须放在动态路由前面） ============

  // 公开接口：创建订单（前台订单页面使用）
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  // 管理接口：需要认证
  @Get()
  @UseGuards(InternalAuthGuard)
  findAll(
    @Query('search') search?: string,
    @Query('customerId') customerId?: string,
    @Query('salespersonId') salespersonId?: string,
    @Query('orderType') orderType?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.findAll({
      search,
      customerId,
      salespersonId,
      orderType,
      status,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // Order Param Config endpoints - 静态路由
  @Post('param-configs')
  @UseGuards(InternalAuthGuard)
  createParamConfig(@Body() dto: CreateOrderParamConfigDto) {
    return this.orderService.createParamConfig(dto);
  }

  @Get('param-configs')
  @UseGuards(InternalAuthGuard)
  findAllParamConfigs(@Query('activeOnly') activeOnly?: string) {
    return this.orderService.findAllParamConfigs(activeOnly === 'true');
  }

  @Get('param-configs/:id')
  @UseGuards(InternalAuthGuard)
  findOneParamConfig(@Param('id') id: string) {
    return this.orderService.findOneParamConfig(id);
  }

  @Patch('param-configs/:id')
  @UseGuards(InternalAuthGuard)
  updateParamConfig(
    @Param('id') id: string,
    @Body() dto: UpdateOrderParamConfigDto,
  ) {
    return this.orderService.updateParamConfig(id, dto);
  }

  @Delete('param-configs/:id')
  @UseGuards(InternalAuthGuard)
  removeParamConfig(@Param('id') id: string) {
    return this.orderService.removeParamConfig(id);
  }

  // 批量导出
  @Post('export-batch')
  @UseGuards(InternalAuthGuard)
  async exportBatch(@Body('orderIds') orderIds: string[], @Res() res: Response) {
    return this.orderService.exportOrdersToExcel(orderIds, res);
  }

  // 批量审核通过
  @Post('batch/approve')
  @UseGuards(InternalAuthGuard)
  batchApprove(@Body('ids') ids: string[]) {
    return this.orderService.batchApprove(ids);
  }

  // 批量同步到 ERP
  @Post('batch/sync-erp')
  @UseGuards(InternalAuthGuard)
  batchSyncToErp(@Body('ids') ids: string[]) {
    return this.orderService.batchSyncToErp(ids);
  }

  // ============ 动态路由（:id 参数） ============

  // 管理接口：需要认证
  @Get(':id')
  @UseGuards(InternalAuthGuard)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // 管理接口：需要认证
  @Patch(':id')
  @UseGuards(InternalAuthGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  // 管理接口：需要认证
  @Delete(':id')
  @UseGuards(InternalAuthGuard)
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // 导出单个订单
  @Get(':id/export')
  @UseGuards(InternalAuthGuard)
  async exportOrder(@Param('id') id: string, @Res() res: Response) {
    return this.orderService.exportOrderToExcel(id, res);
  }

  // 审核通过订单
  @Post(':id/approve')
  @UseGuards(InternalAuthGuard)
  approveOrder(@Param('id') id: string) {
    return this.orderService.approveOrder(id);
  }

  // 驳回订单
  @Post(':id/reject')
  @UseGuards(InternalAuthGuard)
  rejectOrder(@Param('id') id: string, @Body('rejectReason') rejectReason: string) {
    return this.orderService.rejectOrder(id, rejectReason);
  }

  // 同步订单到 ERP
  @Post(':id/sync-erp')
  @UseGuards(InternalAuthGuard)
  syncToErp(@Param('id') id: string) {
    return this.orderService.syncToErp(id);
  }

  // 重新提交审核（被驳回的订单）
  @Post(':id/resubmit')
  @UseGuards(InternalAuthGuard)
  resubmitOrder(@Param('id') id: string) {
    return this.orderService.resubmitOrder(id);
  }
}

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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // 公开接口：创建订单（前台订单页面使用）
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  // 管理接口：需要认证
  @Get()
  @UseGuards(JwtAuthGuard)
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

  // 管理接口：需要认证
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  // 管理接口：需要认证
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  // 管理接口：需要认证
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // Order Param Config endpoints - 管理接口：需要认证
  @Post('param-configs')
  @UseGuards(JwtAuthGuard)
  createParamConfig(@Body() dto: CreateOrderParamConfigDto) {
    return this.orderService.createParamConfig(dto);
  }

  @Get('param-configs')
  @UseGuards(JwtAuthGuard)
  findAllParamConfigs(@Query('activeOnly') activeOnly?: string) {
    return this.orderService.findAllParamConfigs(activeOnly === 'true');
  }

  @Get('param-configs/:id')
  @UseGuards(JwtAuthGuard)
  findOneParamConfig(@Param('id') id: string) {
    return this.orderService.findOneParamConfig(id);
  }

  @Patch('param-configs/:id')
  @UseGuards(JwtAuthGuard)
  updateParamConfig(
    @Param('id') id: string,
    @Body() dto: UpdateOrderParamConfigDto,
  ) {
    return this.orderService.updateParamConfig(id, dto);
  }

  @Delete('param-configs/:id')
  @UseGuards(JwtAuthGuard)
  removeParamConfig(@Param('id') id: string) {
    return this.orderService.removeParamConfig(id);
  }

  // Export endpoints - 管理接口：需要认证
  @Get(':id/export')
  @UseGuards(JwtAuthGuard)
  async exportOrder(@Param('id') id: string, @Res() res: Response) {
    return this.orderService.exportOrderToExcel(id, res);
  }

  @Post('export-batch')
  @UseGuards(JwtAuthGuard)
  async exportBatch(@Body('orderIds') orderIds: string[], @Res() res: Response) {
    return this.orderService.exportOrdersToExcel(orderIds, res);
  }
}

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
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }

  // Order Param Config endpoints
  @Post('param-configs')
  createParamConfig(@Body() dto: CreateOrderParamConfigDto) {
    return this.orderService.createParamConfig(dto);
  }

  @Get('param-configs')
  findAllParamConfigs(@Query('activeOnly') activeOnly?: string) {
    return this.orderService.findAllParamConfigs(activeOnly === 'true');
  }

  @Get('param-configs/:id')
  findOneParamConfig(@Param('id') id: string) {
    return this.orderService.findOneParamConfig(id);
  }

  @Patch('param-configs/:id')
  updateParamConfig(
    @Param('id') id: string,
    @Body() dto: UpdateOrderParamConfigDto,
  ) {
    return this.orderService.updateParamConfig(id, dto);
  }

  @Delete('param-configs/:id')
  removeParamConfig(@Param('id') id: string) {
    return this.orderService.removeParamConfig(id);
  }

  // Export endpoints
  @Get(':id/export')
  async exportOrder(@Param('id') id: string, @Res() res: Response) {
    return this.orderService.exportOrderToExcel(id, res);
  }

  @Post('export-batch')
  async exportBatch(@Body('orderIds') orderIds: string[], @Res() res: Response) {
    return this.orderService.exportOrdersToExcel(orderIds, res);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderFormService } from './order-form.service';
import { CreateOrderFormDto } from './dto/order-form.dto';
import { JwtAuthGuard } from '../customer-auth/jwt-customer.guard';

@Controller('order-forms')
export class OrderFormController {
  constructor(private readonly orderFormService: OrderFormService) {}

  /**
   * Submit order form (inquiry)
   * POST /order-forms
   * Requires customer authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() createDto: CreateOrderFormDto) {
    return this.orderFormService.create(req.user.id, createDto);
  }

  /**
   * Get all order forms for current customer
   * GET /order-forms
   * Requires customer authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    return this.orderFormService.findAllByCustomer(req.user.id);
  }

  /**
   * Get order form statistics for current customer
   * GET /order-forms/stats
   * Requires customer authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req: any) {
    return this.orderFormService.getStats(req.user.id);
  }

  /**
   * Get single order form by ID
   * GET /order-forms/:id
   * Requires customer authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.orderFormService.findOne(id, req.user.id);
  }
}

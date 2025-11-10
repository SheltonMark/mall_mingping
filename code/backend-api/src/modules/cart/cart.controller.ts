import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common'
import { CartService } from './cart.service'
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto'
import { JwtAuthGuard } from '../customer-auth/jwt-customer.guard'

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCartItems(req.user.id)
  }

  @Post()
  async addItem(@Request() req, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto)
  }

  @Put(':id')
  async updateItem(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(req.user.id, id, dto)
  }

  @Delete(':id')
  async removeItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.id, id)
  }

  @Delete()
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id)
  }

  @Post('sync')
  async syncCart(@Request() req, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(req.user.id, dto)
  }
}

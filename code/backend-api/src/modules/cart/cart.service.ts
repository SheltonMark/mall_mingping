import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Get user's cart items
  async getCartItems(customerId: string) {
    return this.prisma.cartItem.findMany({
      where: { customerId },
      include: {
        sku: {
          select: {
            images: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  // Add item to cart
  async addItem(customerId: string, dto: AddToCartDto) {
    // Parse colorScheme if it's a string
    let colorSchemeToUse = dto.colorScheme || {}
    if (typeof colorSchemeToUse === 'string') {
      try {
        colorSchemeToUse = JSON.parse(colorSchemeToUse)
      } catch (e) {
        // If parse fails, use empty object
        colorSchemeToUse = {}
      }
    }

    // Check if item with same SKU and color scheme already exists
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        customerId,
        skuId: dto.skuId,
        colorScheme: {
          equals: colorSchemeToUse
        },
      },
    })

    if (existingItem) {
      // Update quantity
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          price: dto.price, // Update price in case it changed
        },
      })
    }

    // Create new cart item
    return this.prisma.cartItem.create({
      data: {
        customerId,
        skuId: dto.skuId,
        productCode: dto.productCode,
        productName: dto.productName,
        colorScheme: colorSchemeToUse,
        quantity: dto.quantity,
        price: dto.price,
      },
    })
  }

  // Update cart item quantity
  async updateItem(customerId: string, itemId: string, dto: UpdateCartItemDto) {
    // Verify the item belongs to the customer
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, customerId },
    })

    if (!item) {
      throw new Error('Cart item not found')
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: dto.quantity },
    })
  }

  // Remove item from cart
  async removeItem(customerId: string, itemId: string) {
    // Verify the item belongs to the customer
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, customerId },
    })

    if (!item) {
      throw new Error('Cart item not found')
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    })
  }

  // Clear all cart items for a customer
  async clearCart(customerId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { customerId },
    })
  }

  // Sync cart from localStorage (when user logs in)
  async syncCart(customerId: string, dto: SyncCartDto) {
    // Clear existing cart
    await this.clearCart(customerId)

    // Add all items from localStorage
    if (dto.items && dto.items.length > 0) {
      const cartItems = dto.items.map((item) => ({
        customerId,
        skuId: item.skuId,
        productCode: item.productCode,
        productName: item.productName,
        colorScheme: item.colorScheme,
        quantity: item.quantity,
        price: item.price,
      }))

      await this.prisma.cartItem.createMany({
        data: cartItems,
      })
    }

    // Return the updated cart
    return this.getCartItems(customerId)
  }
}

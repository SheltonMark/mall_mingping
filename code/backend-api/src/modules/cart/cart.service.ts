import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto'

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  // Get user's cart items
  async getCartItems(salespersonId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { salespersonId },
      orderBy: { createdAt: 'desc' },
    })

    // Manually fetch SKU data for each cart item (since there's no direct relation in schema)
    const cartItemsWithSku = await Promise.all(
      cartItems.map(async (item) => {
        const sku = await this.prisma.productSku.findUnique({
          where: { id: item.skuId },
          select: {
            productName: true,
            productNameEn: true,
            specification: true,
            specificationEn: true,
            images: true,
            productSpec: true,
            additionalAttributes: true,
          },
        })
        return {
          ...item,
          sku,
        }
      })
    )

    return cartItemsWithSku
  }

  // Add item to cart
  async addItem(salespersonId: string, dto: AddToCartDto) {
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
        salespersonId,
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
        salespersonId,
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
  async updateItem(salespersonId: string, itemId: string, dto: UpdateCartItemDto) {
    // Verify the item belongs to the customer
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, salespersonId },
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
  async removeItem(salespersonId: string, itemId: string) {
    // Verify the item belongs to the customer
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, salespersonId },
    })

    if (!item) {
      throw new Error('Cart item not found')
    }

    return this.prisma.cartItem.delete({
      where: { id: itemId },
    })
  }

  // Clear all cart items for a customer
  async clearCart(salespersonId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { salespersonId },
    })
  }

  // Sync cart from localStorage (when user logs in)
  async syncCart(salespersonId: string, dto: SyncCartDto) {
    // Clear existing cart
    await this.clearCart(salespersonId)

    // Add all items from localStorage
    if (dto.items && dto.items.length > 0) {
      const cartItems = dto.items.map((item) => ({
        salespersonId,
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
    return this.getCartItems(salespersonId)
  }
}

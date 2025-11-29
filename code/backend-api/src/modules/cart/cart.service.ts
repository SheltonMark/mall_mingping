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
      // Update quantity and all extended fields
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + dto.quantity,
          price: dto.price, // Update price in case it changed
          // Update extended fields
          productCategory: dto.productCategory ?? existingItem.productCategory,
          customerProductCode: dto.customerProductCode ?? existingItem.customerProductCode,
          untaxedLocalCurrency: dto.untaxedLocalCurrency ?? existingItem.untaxedLocalCurrency,
          expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : existingItem.expectedDeliveryDate,
          packingQuantity: dto.packingQuantity ?? existingItem.packingQuantity,
          cartonQuantity: dto.cartonQuantity ?? existingItem.cartonQuantity,
          packagingMethod: dto.packagingMethod ?? existingItem.packagingMethod,
          paperCardCode: dto.paperCardCode ?? existingItem.paperCardCode,
          washLabelCode: dto.washLabelCode ?? existingItem.washLabelCode,
          outerCartonCode: dto.outerCartonCode ?? existingItem.outerCartonCode,
          cartonSpecification: dto.cartonSpecification ?? existingItem.cartonSpecification,
          volume: dto.volume ?? existingItem.volume,
          supplierNote: dto.supplierNote ?? existingItem.supplierNote,
          summary: dto.summary ?? existingItem.summary,
        },
      })
    }

    // Create new cart item with all fields
    return this.prisma.cartItem.create({
      data: {
        salespersonId,
        skuId: dto.skuId,
        productCode: dto.productCode,
        productName: dto.productName,
        colorScheme: colorSchemeToUse,
        quantity: dto.quantity,
        price: dto.price,
        // Extended fields
        productCategory: dto.productCategory,
        customerProductCode: dto.customerProductCode,
        untaxedLocalCurrency: dto.untaxedLocalCurrency,
        expectedDeliveryDate: dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null,
        packingQuantity: dto.packingQuantity,
        cartonQuantity: dto.cartonQuantity,
        packagingMethod: dto.packagingMethod,
        paperCardCode: dto.paperCardCode,
        washLabelCode: dto.washLabelCode,
        outerCartonCode: dto.outerCartonCode,
        cartonSpecification: dto.cartonSpecification,
        volume: dto.volume,
        supplierNote: dto.supplierNote,
        summary: dto.summary,
      },
    })
  }

  // Update cart item
  async updateItem(salespersonId: string, itemId: string, dto: UpdateCartItemDto) {
    // Verify the item belongs to the customer
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, salespersonId },
    })

    if (!item) {
      throw new Error('Cart item not found')
    }

    // Build update data object
    const updateData: any = {}

    // Basic fields
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity
    if (dto.price !== undefined) updateData.price = dto.price

    // Extended fields - 使用 undefined 检查，允许设置为 null 或空字符串
    if (dto.productCategory !== undefined) updateData.productCategory = dto.productCategory
    if (dto.customerProductCode !== undefined) updateData.customerProductCode = dto.customerProductCode
    if (dto.untaxedLocalCurrency !== undefined) updateData.untaxedLocalCurrency = dto.untaxedLocalCurrency
    if (dto.expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = dto.expectedDeliveryDate ? new Date(dto.expectedDeliveryDate) : null
    }
    if (dto.packingQuantity !== undefined) updateData.packingQuantity = dto.packingQuantity
    if (dto.cartonQuantity !== undefined) updateData.cartonQuantity = dto.cartonQuantity
    if (dto.packagingMethod !== undefined) updateData.packagingMethod = dto.packagingMethod
    if (dto.paperCardCode !== undefined) updateData.paperCardCode = dto.paperCardCode
    if (dto.washLabelCode !== undefined) updateData.washLabelCode = dto.washLabelCode
    if (dto.outerCartonCode !== undefined) updateData.outerCartonCode = dto.outerCartonCode
    if (dto.cartonSpecification !== undefined) updateData.cartonSpecification = dto.cartonSpecification
    if (dto.volume !== undefined) updateData.volume = dto.volume
    if (dto.supplierNote !== undefined) updateData.supplierNote = dto.supplierNote
    if (dto.summary !== undefined) updateData.summary = dto.summary

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: updateData,
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

    // Add all items from localStorage with extended fields
    if (dto.items && dto.items.length > 0) {
      const cartItems = dto.items.map((item) => ({
        salespersonId,
        skuId: item.skuId,
        productCode: item.productCode,
        productName: item.productName,
        colorScheme: item.colorScheme,
        quantity: item.quantity,
        price: item.price,
        // Extended fields
        productCategory: item.productCategory,
        customerProductCode: item.customerProductCode,
        untaxedLocalCurrency: item.untaxedLocalCurrency,
        expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : null,
        packingQuantity: item.packingQuantity,
        cartonQuantity: item.cartonQuantity,
        packagingMethod: item.packagingMethod,
        paperCardCode: item.paperCardCode,
        washLabelCode: item.washLabelCode,
        outerCartonCode: item.outerCartonCode,
        cartonSpecification: item.cartonSpecification,
        volume: item.volume,
        supplierNote: item.supplierNote,
        summary: item.summary,
      }))

      await this.prisma.cartItem.createMany({
        data: cartItems,
      })
    }

    // Return the updated cart
    return this.getCartItems(salespersonId)
  }
}

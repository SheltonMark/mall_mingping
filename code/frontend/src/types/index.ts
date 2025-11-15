// 完整的类型定义
export interface ProductColor {
  id: string
  name: string
  hex: string
  image?: string
}

export interface ProductSKU {
  id: string
  sku: string
  groupId: string
  name: string
  mainImage: string
  detailImages: string[]
  price: number
  colorCombination: Record<string, any>
  status: 'active' | 'inactive'
}

export interface ProductGroup {
  id: string
  groupName: string
  translationKey?: string
  categoryId: string
  description: string
  descriptionKey?: string
  baseComponents: string[]
  availableColors: Record<string, ProductColor[]>
  skus: ProductSKU[]
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface CartItem {
  skuId: string
  sku: string
  groupName: string  // 双语格式: "中文/English"
  colorCombination: Record<string, any>
  quantity: number
  price: number
  mainImage: string
}

export interface Category {
  id: string
  name: string
  translationKey?: string
  sortOrder: number
}

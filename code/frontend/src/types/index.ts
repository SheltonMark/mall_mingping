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
  colorCombination: Record<string, { name: string; hex: string }>
  status: 'active' | 'inactive'
}

export interface ProductGroup {
  id: string
  groupName: string
  categoryId: string
  description: string
  baseComponents: string[]
  availableColors: Record<string, ProductColor[]>
  skus: ProductSKU[]
  sortOrder: number
  status: 'active' | 'inactive'
}

export interface CartItem {
  skuId: string
  sku: string
  groupName: string
  colorCombination: Record<string, { name: string; hex: string }>
  quantity: number
  price: number
  mainImage: string
}

export interface Category {
  id: string
  name: string
  sortOrder: number
}

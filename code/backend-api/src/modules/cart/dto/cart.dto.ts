import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsIn } from 'class-validator'
import { Type } from 'class-transformer'

export class AddToCartDto {
  @IsString()
  @IsNotEmpty()
  skuId: string

  @IsString()
  @IsNotEmpty()
  productCode: string

  @IsString()
  @IsNotEmpty()
  productName: string

  @IsOptional()
  colorScheme?: any

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number

  // 订单明细扩展字段
  @IsOptional()
  @IsString()
  @IsIn(['new', 'old', 'sample'])
  productCategory?: string  // 产品类别

  @IsOptional()
  @IsString()
  customerProductCode?: string  // 客户料号

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  untaxedLocalCurrency?: number  // 未税本位币

  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string  // 预交日

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  packingQuantity?: number  // 装箱数

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cartonQuantity?: number  // 箱数

  @IsOptional()
  @IsString()
  packagingMethod?: string  // 包装方式

  @IsOptional()
  @IsString()
  paperCardCode?: string  // 纸卡编码

  @IsOptional()
  @IsString()
  washLabelCode?: string  // 水洗标编码

  @IsOptional()
  @IsString()
  outerCartonCode?: string  // 外箱编码

  @IsOptional()
  @IsString()
  cartonSpecification?: string  // 箱规

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  volume?: number  // 体积

  @IsOptional()
  @IsString()
  supplierNote?: string  // 厂商备注

  @IsOptional()
  @IsString()
  summary?: string  // 摘要
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number

  // 订单明细扩展字段
  @IsOptional()
  @IsString()
  @IsIn(['new', 'old', 'sample'])
  productCategory?: string  // 产品类别

  @IsOptional()
  @IsString()
  customerProductCode?: string  // 客户料号

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  untaxedLocalCurrency?: number  // 未税本位币

  @IsOptional()
  @IsString()
  expectedDeliveryDate?: string  // 预交日

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  packingQuantity?: number  // 装箱数

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cartonQuantity?: number  // 箱数

  @IsOptional()
  @IsString()
  packagingMethod?: string  // 包装方式

  @IsOptional()
  @IsString()
  paperCardCode?: string  // 纸卡编码

  @IsOptional()
  @IsString()
  washLabelCode?: string  // 水洗标编码

  @IsOptional()
  @IsString()
  outerCartonCode?: string  // 外箱编码

  @IsOptional()
  @IsString()
  cartonSpecification?: string  // 箱规

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  volume?: number  // 体积

  @IsOptional()
  @IsString()
  supplierNote?: string  // 厂商备注

  @IsOptional()
  @IsString()
  summary?: string  // 摘要
}

export class SyncCartDto {
  @IsNotEmpty()
  items: AddToCartDto[]
}

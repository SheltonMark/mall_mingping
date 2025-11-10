import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator'
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
}

export class UpdateCartItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number
}

export class SyncCartDto {
  @IsNotEmpty()
  items: AddToCartDto[]
}

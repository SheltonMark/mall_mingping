import {
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  IsNumber,
  ValidateNested,
  IsObject,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

enum OrderType {
  FORMAL = 'FORMAL',
  INTENTION = 'INTENTION',
}

enum CustomerType {
  NEW = 'NEW',
  OLD = 'OLD',
}

class OrderItemDto {
  @IsUUID()
  productSkuId: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  itemNumber?: number;

  @IsString()
  @IsOptional()
  customerProductCode?: string;

  @IsString()
  @IsOptional()
  productImage?: string;

  @IsString()
  @IsOptional()
  productSpec?: string;

  @IsString()
  @IsOptional()
  additionalAttributes?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  packagingConversion?: number;

  @IsString()
  @IsOptional()
  packagingUnit?: string;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @IsOptional()
  netWeight?: number;

  @IsNumber()
  @IsOptional()
  grossWeight?: number;

  @IsString()
  @IsOptional()
  packagingType?: string;

  @IsString()
  @IsOptional()
  packagingSize?: string;

  @IsString()
  @IsOptional()
  supplierNote?: string;

  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @IsOptional()
  untaxedLocalCurrency?: number;

  @IsNumber()
  @IsOptional()
  packingQuantity?: number;

  @IsNumber()
  @IsOptional()
  cartonQuantity?: number;

  @IsString()
  @IsOptional()
  packagingMethod?: string;

  @IsString()
  @IsOptional()
  paperCardCode?: string;

  @IsString()
  @IsOptional()
  washLabelCode?: string;

  @IsString()
  @IsOptional()
  outerCartonCode?: string;

  @IsString()
  @IsOptional()
  cartonSpecification?: string;

  @IsNumber()
  @IsOptional()
  volume?: number;

  @IsString()
  @IsOptional()
  summary?: string;
}

class CustomParamDto {
  @IsString()
  paramKey: string;

  @IsString()
  @IsOptional()
  paramValue?: string;
}

export class CreateOrderDto {
  @IsString()
  orderNumber: string;

  @IsUUID()
  customerId: string;

  @IsUUID()
  salespersonId: string;

  @IsEnum(CustomerType)
  customerType: CustomerType;

  @IsEnum(OrderType)
  orderType: OrderType;

  @IsDateString()
  orderDate: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomParamDto)
  @IsOptional()
  customParams?: CustomParamDto[];

  // 客户信息（新增）
  @IsString()
  @IsNotEmpty()
  customerCompany: string;  // 公司名称

  @IsString()
  @IsNotEmpty()
  customerContact: string;  // 联系人

  @IsString()
  @IsNotEmpty()
  customerPhone: string;    // 联系电话

  @IsOptional()
  @IsString()
  customerEmail?: string;   // 联系邮箱（可选）

  @IsOptional()
  @IsString()
  remarks?: string;         // 订单备注
}

export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsUUID()
  @IsOptional()
  customerId?: string;

  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;

  @IsEnum(OrderType)
  @IsOptional()
  orderType?: OrderType;

  @IsDateString()
  @IsOptional()
  orderDate?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @IsOptional()
  items?: OrderItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomParamDto)
  @IsOptional()
  customParams?: CustomParamDto[];
}

// Order Param Config DTOs
export class CreateOrderParamConfigDto {
  @IsString()
  fieldName: string;

  @IsString()
  fieldNameZh: string;

  @IsEnum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA'])
  fieldType: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA';

  @IsOptional()
  isRequired?: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsObject()
  @IsOptional()
  options?: any;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateOrderParamConfigDto {
  @IsString()
  @IsOptional()
  fieldNameZh?: string;

  @IsEnum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA'])
  @IsOptional()
  fieldType?: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA';

  @IsOptional()
  isRequired?: boolean;

  @IsString()
  @IsOptional()
  defaultValue?: string;

  @IsObject()
  @IsOptional()
  options?: any;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;

  @IsOptional()
  isActive?: boolean;
}

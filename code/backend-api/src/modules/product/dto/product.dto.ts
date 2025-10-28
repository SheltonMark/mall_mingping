import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  IsObject,
  IsEnum,
  IsArray,
  Min,
  MinLength,
} from 'class-validator';

// Category DTOs
export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  nameZh: string;

  @IsString()
  @MinLength(1)
  nameEn: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  nameZh?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  nameEn?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Material DTOs
export class CreateMaterialDto {
  @IsString()
  @MinLength(1)
  nameZh: string;

  @IsString()
  @MinLength(1)
  nameEn: string;
}

export class UpdateMaterialDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  nameZh?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  nameEn?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Product Group DTOs
export class CreateProductGroupDto {
  @IsString()
  @MinLength(1)
  groupNameZh: string;

  @IsString()
  @MinLength(1)
  groupNameEn: string;

  @IsString()
  @IsOptional()
  descriptionZh?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  materialId?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateProductGroupDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  groupNameZh?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  groupNameEn?: string;

  @IsString()
  @IsOptional()
  descriptionZh?: string;

  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsUUID()
  @IsOptional()
  materialId?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

// Product SKU DTOs
export class CreateProductSkuDto {
  @IsUUID()
  groupId: string;

  @IsString()
  @MinLength(1)
  productCode: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsObject()
  @IsOptional()
  colorCombination?: any;

  @IsString()
  @IsOptional()
  mainImage?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

export class UpdateProductSkuDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  productCode?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsObject()
  @IsOptional()
  colorCombination?: any;

  @IsString()
  @IsOptional()
  mainImage?: string;

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

// Batch import DTO
export class BatchImportSkuDto {
  @IsArray()
  skus: CreateProductSkuDto[];
}

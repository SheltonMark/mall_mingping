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

// 产品可见性枚举
enum ProductVisibility {
  ALL = 'ALL',
  STANDARD = 'STANDARD',
  VIP = 'VIP',
  SVIP = 'SVIP',
}

// Category DTOs (2025-10-31 updated)
export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  code: string; // NEW: 分类代码 (如: MP, TB, T)

  @IsString()
  @MinLength(1)
  nameZh: string;

  @IsString()
  @MinLength(1)
  nameEn: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isAutoCreated?: boolean;
}

export class UpdateCategoryDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  code?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  nameZh?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  nameEn?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @IsBoolean()
  @IsOptional()
  isAutoCreated?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// Product Group DTOs (2025-10-31 updated)
export class CreateProductGroupDto {
  @IsString()
  @MinLength(1)
  prefix: string; // NEW: 品号前缀 (如: MP007, TB001)

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

  @IsString()
  @IsOptional()
  categoryCode?: string; // NEW: 冗余存储分类代码

  @IsObject()
  @IsOptional()
  sharedVideo?: any; // NEW: SKU组共用视频

  @IsString()
  @IsOptional()
  videoMode?: string; // NEW: shared/individual

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number; // CHANGED: displayOrder → sortOrder

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibilityTier?: ProductVisibility; // NEW: 产品可见性
}

export class UpdateProductGroupDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  prefix?: string;

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

  @IsString()
  @IsOptional()
  categoryCode?: string;

  @IsObject()
  @IsOptional()
  sharedVideo?: any;

  @IsString()
  @IsOptional()
  videoMode?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  sortOrder?: number; // CHANGED: displayOrder → sortOrder

  @IsEnum(ProductVisibility)
  @IsOptional()
  visibilityTier?: ProductVisibility; // NEW: 产品可见性
}

// Product SKU DTOs (2025-10-31 updated)
export class CreateProductSkuDto {
  @IsUUID()
  groupId: string;

  @IsString()
  @MinLength(1)
  productCode: string; // 品号/SKU编码

  @IsString()
  @MinLength(1)
  productName: string; // NEW: 品名 (required)

  @IsString()
  @IsOptional()
  title?: string; // NEW: 主标题 (规格选择器显示)

  @IsString()
  @IsOptional()
  subtitle?: string; // NEW: 副标题 (规格选择器第二行显示)

  @IsString()
  @IsOptional()
  brand?: string; // NEW: 商标

  @IsString()
  @IsOptional()
  specification?: string; // NEW: 货品规格原始文本

  @IsOptional()
  productSpec?: any; // NEW: 解析后的部件规格 (JSON数组) - 不用@IsObject因为它是数组

  @IsOptional()
  additionalAttributes?: any; // NEW: 解析后的颜色属性 (JSON数组) - 不用@IsObject因为它是数组

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number; // CHANGED: Now optional (configured in backend)

  @IsArray()
  @IsOptional()
  images?: any; // NEW: 图片集 (字符串数组)

  @IsObject()
  @IsOptional()
  video?: any; // NEW: 独立视频 (对象 {url, type})

  @IsBoolean()
  @IsOptional()
  useSharedVideo?: boolean; // NEW: 是否使用SKU组共用视频

  @IsArray()
  @IsOptional()
  optionalAttributes?: string[]; // NEW: 附加属性选项 (字符串数组)

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE'; // Default: INACTIVE
}

export class UpdateProductSkuDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  productCode?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  productName?: string;

  @IsString()
  @IsOptional()
  title?: string; // NEW: 主标题

  @IsString()
  @IsOptional()
  subtitle?: string; // NEW: 副标题

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  specification?: string;

  @IsOptional()
  productSpec?: any; // 可以是数组或对象，不使用@IsObject限制

  @IsOptional()
  additionalAttributes?: any; // 可以是数组或对象，不使用@IsObject限制

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsArray()
  @IsOptional()
  images?: any; // NEW: 图片集 (字符串数组)

  @IsObject()
  @IsOptional()
  video?: any; // NEW: 独立视频 (对象 {url, type})

  @IsBoolean()
  @IsOptional()
  useSharedVideo?: boolean;

  @IsArray()
  @IsOptional()
  optionalAttributes?: string[]; // NEW: 附加属性选项 (字符串数组)

  @IsEnum(['ACTIVE', 'INACTIVE'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE';
}

// Batch import DTO
export class BatchImportSkuDto {
  @IsArray()
  skus: CreateProductSkuDto[];
}

export declare class CreateCategoryDto {
    code: string;
    nameZh: string;
    nameEn: string;
    icon?: string;
    sortOrder?: number;
    isAutoCreated?: boolean;
}
export declare class UpdateCategoryDto {
    code?: string;
    nameZh?: string;
    nameEn?: string;
    icon?: string;
    sortOrder?: number;
    isAutoCreated?: boolean;
    isActive?: boolean;
}
export declare class CreateProductGroupDto {
    prefix: string;
    groupNameZh: string;
    groupNameEn: string;
    descriptionZh?: string;
    descriptionEn?: string;
    categoryId?: string;
    categoryCode?: string;
    sharedVideo?: any;
    videoMode?: string;
    isPublished?: boolean;
    sortOrder?: number;
}
export declare class UpdateProductGroupDto {
    prefix?: string;
    groupNameZh?: string;
    groupNameEn?: string;
    descriptionZh?: string;
    descriptionEn?: string;
    categoryId?: string;
    categoryCode?: string;
    sharedVideo?: any;
    videoMode?: string;
    isPublished?: boolean;
    sortOrder?: number;
}
export declare class CreateProductSkuDto {
    groupId: string;
    productCode: string;
    productName: string;
    title?: string;
    subtitle?: string;
    brand?: string;
    specification?: string;
    productSpec?: any;
    additionalAttributes?: any;
    price?: number;
    images?: any;
    video?: any;
    useSharedVideo?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
}
export declare class UpdateProductSkuDto {
    productCode?: string;
    productName?: string;
    title?: string;
    subtitle?: string;
    brand?: string;
    specification?: string;
    productSpec?: any;
    additionalAttributes?: any;
    price?: number;
    images?: any;
    video?: any;
    useSharedVideo?: boolean;
    status?: 'ACTIVE' | 'INACTIVE';
}
export declare class BatchImportSkuDto {
    skus: CreateProductSkuDto[];
}

export declare class CreateCategoryDto {
    nameZh: string;
    nameEn: string;
    parentId?: string;
    sortOrder?: number;
}
export declare class UpdateCategoryDto {
    nameZh?: string;
    nameEn?: string;
    parentId?: string;
    sortOrder?: number;
    isActive?: boolean;
}
export declare class CreateMaterialDto {
    nameZh: string;
    nameEn: string;
}
export declare class UpdateMaterialDto {
    nameZh?: string;
    nameEn?: string;
    isActive?: boolean;
}
export declare class CreateProductGroupDto {
    groupNameZh: string;
    groupNameEn: string;
    descriptionZh?: string;
    descriptionEn?: string;
    categoryId?: string;
    materialId?: string;
    isPublished?: boolean;
    displayOrder?: number;
}
export declare class UpdateProductGroupDto {
    groupNameZh?: string;
    groupNameEn?: string;
    descriptionZh?: string;
    descriptionEn?: string;
    categoryId?: string;
    materialId?: string;
    isPublished?: boolean;
    displayOrder?: number;
}
export declare class CreateProductSkuDto {
    groupId: string;
    productCode: string;
    price: number;
    stock?: number;
    colorCombination?: any;
    mainImage?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}
export declare class UpdateProductSkuDto {
    productCode?: string;
    price?: number;
    stock?: number;
    colorCombination?: any;
    mainImage?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}
export declare class BatchImportSkuDto {
    skus: CreateProductSkuDto[];
}

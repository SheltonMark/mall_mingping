import type { Response } from 'express';
import { ProductService } from './product.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateMaterialDto, UpdateMaterialDto, CreateProductGroupDto, UpdateProductGroupDto, CreateProductSkuDto, UpdateProductSkuDto, BatchImportSkuDto } from './dto/product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
        parentId: string | null;
        sortOrder: number;
    }>;
    findAllCategories(activeOnly?: string): Promise<({
        _count: {
            productGroups: number;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
        parentId: string | null;
        sortOrder: number;
    })[]>;
    findOneCategory(id: string): Promise<{
        productGroups: ({
            _count: {
                skus: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        })[];
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
        parentId: string | null;
        sortOrder: number;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
        parentId: string | null;
        sortOrder: number;
    }>;
    removeCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
        parentId: string | null;
        sortOrder: number;
    }>;
    createMaterial(dto: CreateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
    }>;
    findAllMaterials(activeOnly?: string): Promise<({
        _count: {
            productGroups: number;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
    })[]>;
    findOneMaterial(id: string): Promise<{
        productGroups: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        }[];
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
    }>;
    updateMaterial(id: string, dto: UpdateMaterialDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
    }>;
    removeMaterial(id: string): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        nameZh: string;
        nameEn: string;
    }>;
    createProductGroup(dto: CreateProductGroupDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
            parentId: string | null;
            sortOrder: number;
        } | null;
        material: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        groupNameZh: string;
        groupNameEn: string;
        descriptionZh: string | null;
        descriptionEn: string | null;
        categoryId: string | null;
        materialId: string | null;
        isPublished: boolean;
    }>;
    findAllProductGroups(search?: string, categoryId?: string, materialId?: string, isPublished?: string, page?: string, limit?: string): Promise<{
        data: ({
            category: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
                parentId: string | null;
                sortOrder: number;
            } | null;
            material: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
            } | null;
            _count: {
                skus: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneProductGroup(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
            parentId: string | null;
            sortOrder: number;
        } | null;
        material: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
        } | null;
        skus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            groupId: string;
            productCode: string;
            stock: number;
            colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
            mainImage: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        groupNameZh: string;
        groupNameEn: string;
        descriptionZh: string | null;
        descriptionEn: string | null;
        categoryId: string | null;
        materialId: string | null;
        isPublished: boolean;
    }>;
    updateProductGroup(id: string, dto: UpdateProductGroupDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
            parentId: string | null;
            sortOrder: number;
        } | null;
        material: {
            id: string;
            createdAt: Date;
            isActive: boolean;
            nameZh: string;
            nameEn: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        groupNameZh: string;
        groupNameEn: string;
        descriptionZh: string | null;
        descriptionEn: string | null;
        categoryId: string | null;
        materialId: string | null;
        isPublished: boolean;
    }>;
    removeProductGroup(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayOrder: number;
        groupNameZh: string;
        groupNameEn: string;
        descriptionZh: string | null;
        descriptionEn: string | null;
        categoryId: string | null;
        materialId: string | null;
        isPublished: boolean;
    }>;
    createProductSku(dto: CreateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
                parentId: string | null;
                sortOrder: number;
            } | null;
            material: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        price: import("@prisma/client/runtime/library").Decimal;
        groupId: string;
        productCode: string;
        stock: number;
        colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
        mainImage: string | null;
    }>;
    findAllProductSkus(search?: string, groupId?: string, status?: string, page?: string, limit?: string): Promise<{
        data: ({
            group: {
                category: {
                    id: string;
                    createdAt: Date;
                    isActive: boolean;
                    nameZh: string;
                    nameEn: string;
                    parentId: string | null;
                    sortOrder: number;
                } | null;
                material: {
                    id: string;
                    createdAt: Date;
                    isActive: boolean;
                    nameZh: string;
                    nameEn: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                displayOrder: number;
                groupNameZh: string;
                groupNameEn: string;
                descriptionZh: string | null;
                descriptionEn: string | null;
                categoryId: string | null;
                materialId: string | null;
                isPublished: boolean;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            price: import("@prisma/client/runtime/library").Decimal;
            groupId: string;
            productCode: string;
            stock: number;
            colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
            mainImage: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOneProductSku(id: string): Promise<{
        group: {
            category: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
                parentId: string | null;
                sortOrder: number;
            } | null;
            material: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        price: import("@prisma/client/runtime/library").Decimal;
        groupId: string;
        productCode: string;
        stock: number;
        colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
        mainImage: string | null;
    }>;
    updateProductSku(id: string, dto: UpdateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
                parentId: string | null;
                sortOrder: number;
            } | null;
            material: {
                id: string;
                createdAt: Date;
                isActive: boolean;
                nameZh: string;
                nameEn: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayOrder: number;
            groupNameZh: string;
            groupNameEn: string;
            descriptionZh: string | null;
            descriptionEn: string | null;
            categoryId: string | null;
            materialId: string | null;
            isPublished: boolean;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        price: import("@prisma/client/runtime/library").Decimal;
        groupId: string;
        productCode: string;
        stock: number;
        colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
        mainImage: string | null;
    }>;
    removeProductSku(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        price: import("@prisma/client/runtime/library").Decimal;
        groupId: string;
        productCode: string;
        stock: number;
        colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
        mainImage: string | null;
    }>;
    batchImportSkus(dto: BatchImportSkuDto): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
    importFromExcel(file: Express.Multer.File): Promise<{
        success: number;
        failed: number;
        errors: any[];
    } | {
        success: boolean;
        errors: string[];
    }>;
    downloadTemplate(res: Response): Promise<void>;
    exportSkusToExcel(groupId: string, res: Response): Promise<void>;
}

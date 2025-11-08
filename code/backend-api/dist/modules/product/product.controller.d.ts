import type { Response } from 'express';
import { ProductService } from './product.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateProductGroupDto, UpdateProductGroupDto, CreateProductSkuDto, UpdateProductSkuDto, BatchImportSkuDto } from './dto/product.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    findAllCategories(activeOnly?: string): Promise<({
        _count: {
            productGroups: number;
        };
    } & {
        id: string;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        sortOrder: number;
        isAutoCreated: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOneCategory(id: string): Promise<{
        productGroups: ({
            _count: {
                skus: number;
            };
        } & {
            id: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            prefix: string;
            groupNameZh: string;
            groupNameEn: string;
            categoryId: string | null;
            categoryCode: string | null;
            descriptionZh: string | null;
            descriptionEn: string | null;
            sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
            videoMode: string;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            specCount: number;
            mainImage: string | null;
            isPublished: boolean;
            status: string;
        })[];
    } & {
        id: string;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        sortOrder: number;
        isAutoCreated: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        sortOrder: number;
        isAutoCreated: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        sortOrder: number;
        isAutoCreated: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    removeCategory(id: string): Promise<{
        id: string;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        sortOrder: number;
        isAutoCreated: boolean;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllProductGroups(search?: string, categoryId?: string, isPublished?: string, publishedOnly?: string, page?: string, limit?: string): Promise<{
        data: ({
            category: {
                id: string;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                sortOrder: number;
                isAutoCreated: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
            skus: {
                id: string;
                productCode: string;
                productName: string;
                title: string | null;
                subtitle: string | null;
                brand: string | null;
                specification: string | null;
                productSpec: import("@prisma/client/runtime/library").JsonValue;
                additionalAttributes: import("@prisma/client/runtime/library").JsonValue;
                price: import("@prisma/client/runtime/library").Decimal | null;
                images: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            prefix: string;
            groupNameZh: string;
            groupNameEn: string;
            categoryId: string | null;
            categoryCode: string | null;
            descriptionZh: string | null;
            descriptionEn: string | null;
            sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
            videoMode: string;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            specCount: number;
            mainImage: string | null;
            isPublished: boolean;
            status: string;
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
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            sortOrder: number;
            isAutoCreated: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        skus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            groupId: string;
            productCode: string;
            productName: string;
            title: string | null;
            subtitle: string | null;
            brand: string | null;
            specification: string | null;
            productSpec: import("@prisma/client/runtime/library").JsonValue | null;
            additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            video: import("@prisma/client/runtime/library").JsonValue | null;
            useSharedVideo: boolean;
            importDate: Date | null;
        }[];
    } & {
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        prefix: string;
        groupNameZh: string;
        groupNameEn: string;
        categoryId: string | null;
        categoryCode: string | null;
        descriptionZh: string | null;
        descriptionEn: string | null;
        sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
        videoMode: string;
        minPrice: import("@prisma/client/runtime/library").Decimal | null;
        maxPrice: import("@prisma/client/runtime/library").Decimal | null;
        specCount: number;
        mainImage: string | null;
        isPublished: boolean;
        status: string;
    }>;
    createProductGroup(dto: CreateProductGroupDto): Promise<{
        category: {
            id: string;
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            sortOrder: number;
            isAutoCreated: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        prefix: string;
        groupNameZh: string;
        groupNameEn: string;
        categoryId: string | null;
        categoryCode: string | null;
        descriptionZh: string | null;
        descriptionEn: string | null;
        sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
        videoMode: string;
        minPrice: import("@prisma/client/runtime/library").Decimal | null;
        maxPrice: import("@prisma/client/runtime/library").Decimal | null;
        specCount: number;
        mainImage: string | null;
        isPublished: boolean;
        status: string;
    }>;
    updateProductGroup(id: string, dto: UpdateProductGroupDto): Promise<{
        category: {
            id: string;
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            sortOrder: number;
            isAutoCreated: boolean;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        } | null;
    } & {
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        prefix: string;
        groupNameZh: string;
        groupNameEn: string;
        categoryId: string | null;
        categoryCode: string | null;
        descriptionZh: string | null;
        descriptionEn: string | null;
        sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
        videoMode: string;
        minPrice: import("@prisma/client/runtime/library").Decimal | null;
        maxPrice: import("@prisma/client/runtime/library").Decimal | null;
        specCount: number;
        mainImage: string | null;
        isPublished: boolean;
        status: string;
    }>;
    removeProductGroup(id: string): Promise<{
        id: string;
        sortOrder: number;
        createdAt: Date;
        updatedAt: Date;
        prefix: string;
        groupNameZh: string;
        groupNameEn: string;
        categoryId: string | null;
        categoryCode: string | null;
        descriptionZh: string | null;
        descriptionEn: string | null;
        sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
        videoMode: string;
        minPrice: import("@prisma/client/runtime/library").Decimal | null;
        maxPrice: import("@prisma/client/runtime/library").Decimal | null;
        specCount: number;
        mainImage: string | null;
        isPublished: boolean;
        status: string;
    }>;
    findAllProductSkus(search?: string, groupId?: string, status?: string, page?: string, limit?: string): Promise<{
        data: ({
            group: {
                category: {
                    id: string;
                    code: string;
                    nameZh: string;
                    nameEn: string;
                    icon: string | null;
                    sortOrder: number;
                    isAutoCreated: boolean;
                    isActive: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                } | null;
            } & {
                id: string;
                sortOrder: number;
                createdAt: Date;
                updatedAt: Date;
                prefix: string;
                groupNameZh: string;
                groupNameEn: string;
                categoryId: string | null;
                categoryCode: string | null;
                descriptionZh: string | null;
                descriptionEn: string | null;
                sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
                videoMode: string;
                minPrice: import("@prisma/client/runtime/library").Decimal | null;
                maxPrice: import("@prisma/client/runtime/library").Decimal | null;
                specCount: number;
                mainImage: string | null;
                isPublished: boolean;
                status: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            groupId: string;
            productCode: string;
            productName: string;
            title: string | null;
            subtitle: string | null;
            brand: string | null;
            specification: string | null;
            productSpec: import("@prisma/client/runtime/library").JsonValue | null;
            additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            video: import("@prisma/client/runtime/library").JsonValue | null;
            useSharedVideo: boolean;
            importDate: Date | null;
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
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                sortOrder: number;
                isAutoCreated: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            prefix: string;
            groupNameZh: string;
            groupNameEn: string;
            categoryId: string | null;
            categoryCode: string | null;
            descriptionZh: string | null;
            descriptionEn: string | null;
            sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
            videoMode: string;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            specCount: number;
            mainImage: string | null;
            isPublished: boolean;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    createProductSku(dto: CreateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                sortOrder: number;
                isAutoCreated: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            prefix: string;
            groupNameZh: string;
            groupNameEn: string;
            categoryId: string | null;
            categoryCode: string | null;
            descriptionZh: string | null;
            descriptionEn: string | null;
            sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
            videoMode: string;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            specCount: number;
            mainImage: string | null;
            isPublished: boolean;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    updateProductSku(id: string, dto: UpdateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                sortOrder: number;
                isAutoCreated: boolean;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            } | null;
        } & {
            id: string;
            sortOrder: number;
            createdAt: Date;
            updatedAt: Date;
            prefix: string;
            groupNameZh: string;
            groupNameEn: string;
            categoryId: string | null;
            categoryCode: string | null;
            descriptionZh: string | null;
            descriptionEn: string | null;
            sharedVideo: import("@prisma/client/runtime/library").JsonValue | null;
            videoMode: string;
            minPrice: import("@prisma/client/runtime/library").Decimal | null;
            maxPrice: import("@prisma/client/runtime/library").Decimal | null;
            specCount: number;
            mainImage: string | null;
            isPublished: boolean;
            status: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    removeProductSku(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
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
        autoCreated: {
            categories: string[];
            productGroups: string[];
        };
    } | {
        success: boolean;
        errors: {
            error: string;
        }[];
    }>;
    downloadTemplate(res: Response): Promise<void>;
    exportSkusToExcel(groupId: string, res: Response): Promise<void>;
}

import { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { FileUploadService } from '../../common/services/file-upload.service';
import { CreateCategoryDto, UpdateCategoryDto, CreateProductGroupDto, UpdateProductGroupDto, CreateProductSkuDto, UpdateProductSkuDto } from './dto/product.dto';
export declare class ProductService {
    private prisma;
    private excelService;
    private fileUploadService;
    constructor(prisma: PrismaService, excelService: ExcelService, fileUploadService: FileUploadService);
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        isAutoCreated: boolean;
    }>;
    findAllCategories(activeOnly?: boolean): Promise<({
        _count: {
            productGroups: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        isAutoCreated: boolean;
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
            status: string;
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
            sortOrder: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        isAutoCreated: boolean;
    }>;
    updateCategory(id: string, dto: UpdateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        isAutoCreated: boolean;
    }>;
    removeCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        isActive: boolean;
        sortOrder: number;
        code: string;
        nameZh: string;
        nameEn: string;
        icon: string | null;
        isAutoCreated: boolean;
    }>;
    createProductGroup(dto: CreateProductGroupDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sortOrder: number;
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            isAutoCreated: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
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
        sortOrder: number;
    }>;
    findAllProductGroups(query?: {
        search?: string;
        categoryId?: string;
        isPublished?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sortOrder: number;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                isAutoCreated: boolean;
            } | null;
            skus: {
                id: string;
                productSpec: import("@prisma/client/runtime/library").JsonValue;
                additionalAttributes: import("@prisma/client/runtime/library").JsonValue;
                price: import("@prisma/client/runtime/library").Decimal | null;
                productCode: string;
                productName: string;
                title: string | null;
                subtitle: string | null;
                brand: string | null;
                specification: string | null;
                images: import("@prisma/client/runtime/library").JsonValue;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
            sortOrder: number;
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
            updatedAt: Date;
            isActive: boolean;
            sortOrder: number;
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            isAutoCreated: boolean;
        } | null;
        skus: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            productSpec: import("@prisma/client/runtime/library").JsonValue | null;
            additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            groupId: string;
            productCode: string;
            productName: string;
            title: string | null;
            subtitle: string | null;
            brand: string | null;
            specification: string | null;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            video: import("@prisma/client/runtime/library").JsonValue | null;
            useSharedVideo: boolean;
            importDate: Date | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
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
        sortOrder: number;
    }>;
    updateProductGroup(id: string, dto: UpdateProductGroupDto): Promise<{
        category: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            isActive: boolean;
            sortOrder: number;
            code: string;
            nameZh: string;
            nameEn: string;
            icon: string | null;
            isAutoCreated: boolean;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
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
        sortOrder: number;
    }>;
    removeProductGroup(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
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
        sortOrder: number;
    }>;
    createProductSku(dto: CreateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sortOrder: number;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                isAutoCreated: boolean;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
            sortOrder: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    findAllProductSkus(query?: {
        search?: string;
        groupId?: string;
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            group: {
                category: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    isActive: boolean;
                    sortOrder: number;
                    code: string;
                    nameZh: string;
                    nameEn: string;
                    icon: string | null;
                    isAutoCreated: boolean;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
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
                sortOrder: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.SkuStatus;
            productSpec: import("@prisma/client/runtime/library").JsonValue | null;
            additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
            price: import("@prisma/client/runtime/library").Decimal | null;
            groupId: string;
            productCode: string;
            productName: string;
            title: string | null;
            subtitle: string | null;
            brand: string | null;
            specification: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sortOrder: number;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                isAutoCreated: boolean;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
            sortOrder: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    updateProductSku(id: string, dto: UpdateProductSkuDto): Promise<{
        group: {
            category: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                isActive: boolean;
                sortOrder: number;
                code: string;
                nameZh: string;
                nameEn: string;
                icon: string | null;
                isAutoCreated: boolean;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
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
            sortOrder: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.SkuStatus;
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
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
        productSpec: import("@prisma/client/runtime/library").JsonValue | null;
        additionalAttributes: import("@prisma/client/runtime/library").JsonValue | null;
        price: import("@prisma/client/runtime/library").Decimal | null;
        groupId: string;
        productCode: string;
        productName: string;
        title: string | null;
        subtitle: string | null;
        brand: string | null;
        specification: string | null;
        images: import("@prisma/client/runtime/library").JsonValue | null;
        video: import("@prisma/client/runtime/library").JsonValue | null;
        useSharedVideo: boolean;
        importDate: Date | null;
    }>;
    batchImportSkus(skus: CreateProductSkuDto[]): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }>;
    private extractPrefix;
    private extractCategoryCode;
    private ensureCategory;
    private ensureProductGroup;
    importSkusFromExcel(file: Express.Multer.File): Promise<{
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
    generateExcelTemplate(res: Response): Promise<void>;
    exportSkusToExcel(groupId: string, res: Response): Promise<void>;
}

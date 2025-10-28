import { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { CreateOrderDto, UpdateOrderDto, CreateOrderParamConfigDto, UpdateOrderParamConfigDto } from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';
export declare class OrderService {
    private prisma;
    private excelService;
    constructor(prisma: PrismaService, excelService: ExcelService);
    create(createOrderDto: CreateOrderDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        };
        customer: {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            salespersonId: string | null;
            contactPerson: string | null;
            address: string | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
        };
        customParams: {
            id: string;
            createdAt: Date;
            paramKey: string;
            paramValue: string | null;
            orderId: string;
        }[];
        items: ({
            productSku: {
                group: {
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
                price: Decimal;
                groupId: string;
                productCode: string;
                stock: number;
                colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
                mainImage: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productSkuId: string;
            quantity: number;
            price: Decimal;
            subtotal: Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string;
        totalAmount: Decimal | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        orderNumber: string;
        customerId: string;
        orderType: import("@prisma/client").$Enums.OrderType;
        orderDate: Date;
        status: string;
    }>;
    findAll(query?: {
        search?: string;
        customerId?: string;
        salespersonId?: string;
        orderType?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            salesperson: {
                id: string;
                accountId: string;
                chineseName: string;
                englishName: string;
            };
            customer: {
                id: string;
                name: string;
                contactPerson: string | null;
            };
            _count: {
                items: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salespersonId: string;
            totalAmount: Decimal | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
            orderNumber: string;
            customerId: string;
            orderType: import("@prisma/client").$Enums.OrderType;
            orderDate: Date;
            status: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        salesperson: {
            email: string | null;
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
            phone: string | null;
        };
        customer: {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            salespersonId: string | null;
            contactPerson: string | null;
            address: string | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
        };
        customParams: {
            id: string;
            createdAt: Date;
            paramKey: string;
            paramValue: string | null;
            orderId: string;
        }[];
        items: ({
            productSku: {
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
                price: Decimal;
                groupId: string;
                productCode: string;
                stock: number;
                colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
                mainImage: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productSkuId: string;
            quantity: number;
            price: Decimal;
            subtotal: Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string;
        totalAmount: Decimal | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        orderNumber: string;
        customerId: string;
        orderType: import("@prisma/client").$Enums.OrderType;
        orderDate: Date;
        status: string;
    }>;
    update(id: string, updateOrderDto: UpdateOrderDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        };
        customer: {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            phone: string | null;
            salespersonId: string | null;
            contactPerson: string | null;
            address: string | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
        };
        customParams: {
            id: string;
            createdAt: Date;
            paramKey: string;
            paramValue: string | null;
            orderId: string;
        }[];
        items: ({
            productSku: {
                group: {
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
                price: Decimal;
                groupId: string;
                productCode: string;
                stock: number;
                colorCombination: import("@prisma/client/runtime/library").JsonValue | null;
                mainImage: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            productSkuId: string;
            quantity: number;
            price: Decimal;
            subtotal: Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string;
        totalAmount: Decimal | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        orderNumber: string;
        customerId: string;
        orderType: import("@prisma/client").$Enums.OrderType;
        orderDate: Date;
        status: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string;
        totalAmount: Decimal | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        orderNumber: string;
        customerId: string;
        orderType: import("@prisma/client").$Enums.OrderType;
        orderDate: Date;
        status: string;
    }>;
    createParamConfig(dto: CreateOrderParamConfigDto): Promise<{
        id: string;
        createdAt: Date;
        fieldName: string;
        fieldNameZh: string;
        fieldType: import("@prisma/client").$Enums.ParamFieldType;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
    }>;
    findAllParamConfigs(activeOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        fieldName: string;
        fieldNameZh: string;
        fieldType: import("@prisma/client").$Enums.ParamFieldType;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
    }[]>;
    findOneParamConfig(id: string): Promise<{
        id: string;
        createdAt: Date;
        fieldName: string;
        fieldNameZh: string;
        fieldType: import("@prisma/client").$Enums.ParamFieldType;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
    }>;
    updateParamConfig(id: string, dto: UpdateOrderParamConfigDto): Promise<{
        id: string;
        createdAt: Date;
        fieldName: string;
        fieldNameZh: string;
        fieldType: import("@prisma/client").$Enums.ParamFieldType;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
    }>;
    removeParamConfig(id: string): Promise<{
        id: string;
        createdAt: Date;
        fieldName: string;
        fieldNameZh: string;
        fieldType: import("@prisma/client").$Enums.ParamFieldType;
        isRequired: boolean;
        defaultValue: string | null;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
    }>;
    exportOrderToExcel(orderId: string, res: Response): Promise<void>;
    exportOrdersToExcel(orderIds: string[], res: Response): Promise<void>;
}

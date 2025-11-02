import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomerService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createCustomerDto: CreateCustomerDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        } | null;
    } & {
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
    }>;
    findAll(query?: {
        search?: string;
        salespersonId?: string;
        customerType?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            salesperson: {
                id: string;
                accountId: string;
                chineseName: string;
                englishName: string;
            } | null;
            _count: {
                orders: number;
            };
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        stats: {
            totalOrders: number;
            totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        };
        salesperson: {
            email: string | null;
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
            phone: string | null;
        } | null;
        orders: ({
            salesperson: {
                chineseName: string;
                englishName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salespersonId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
            orderNumber: string;
            customerId: string;
            orderType: import("@prisma/client").$Enums.OrderType;
            orderDate: Date;
            status: string;
            companyName: string | null;
        })[];
        _count: {
            orders: number;
        };
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
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        } | null;
    } & {
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    assignSalesperson(customerId: string, salespersonId: string): Promise<{
        salesperson: {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            accountId: string;
            chineseName: string;
            englishName: string;
            phone: string | null;
            hireDate: Date;
            avatar: string | null;
        } | null;
    } & {
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
    }>;
}

import { PrismaService } from '../../prisma.service';
import { CreateSalespersonDto, UpdateSalespersonDto } from './dto/salesperson.dto';
export declare class SalespersonService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createSalespersonDto: CreateSalespersonDto): Promise<{
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
    }>;
    findAll(query?: {
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                customers: number;
                orders: number;
            };
        } & {
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
            totalSales: number | import("@prisma/client/runtime/library").Decimal;
        };
        customers: {
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
        }[];
        orders: ({
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
        })[];
        _count: {
            customers: number;
            orders: number;
        };
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
    }>;
    update(id: string, updateSalespersonDto: UpdateSalespersonDto): Promise<{
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
    }>;
    remove(id: string): Promise<{
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
    }>;
}

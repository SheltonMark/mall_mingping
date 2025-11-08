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
        phone: string | null;
        accountId: string;
        chineseName: string;
        englishName: string;
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
                orders: number;
                customers: number;
            };
        } & {
            email: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            accountId: string;
            chineseName: string;
            englishName: string;
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
        orders: ({
            customer: {
                password: string | null;
                email: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                contactPerson: string | null;
                phone: string | null;
                address: string | null;
                country: string | null;
                salespersonId: string | null;
                customerType: import("@prisma/client").$Enums.CustomerType;
                status: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            salespersonId: string;
            customerType: import("@prisma/client").$Enums.CustomerType;
            status: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            customerId: string;
            orderNumber: string;
            orderType: import("@prisma/client").$Enums.OrderType;
            orderDate: Date;
            companyName: string | null;
        })[];
        _count: {
            orders: number;
            customers: number;
        };
        customers: {
            password: string | null;
            email: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            address: string | null;
            country: string | null;
            salespersonId: string | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
            status: string;
        }[];
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        accountId: string;
        chineseName: string;
        englishName: string;
        hireDate: Date;
        avatar: string | null;
    }>;
    update(id: string, updateSalespersonDto: UpdateSalespersonDto): Promise<{
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        accountId: string;
        chineseName: string;
        englishName: string;
        hireDate: Date;
        avatar: string | null;
    }>;
    remove(id: string): Promise<{
        email: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string | null;
        accountId: string;
        chineseName: string;
        englishName: string;
        hireDate: Date;
        avatar: string | null;
    }>;
}

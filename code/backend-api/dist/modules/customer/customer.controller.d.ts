import { CustomerService } from './customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomerController {
    private readonly customerService;
    constructor(customerService: CustomerService);
    create(createCustomerDto: CreateCustomerDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        } | null;
    } & {
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
    }>;
    findAll(search?: string, salespersonId?: string, customerType?: string, page?: string, limit?: string): Promise<{
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
            phone: string | null;
            accountId: string;
            chineseName: string;
            englishName: string;
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
        };
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
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        } | null;
    } & {
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
    }>;
    remove(id: string): Promise<{
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
    }>;
    assignSalesperson(id: string, salespersonId: string): Promise<{
        salesperson: {
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
        } | null;
    } & {
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
    }>;
}

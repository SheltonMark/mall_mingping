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
        id: string;
        email: string;
        password: string | null;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
        country: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string | null;
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
            id: string;
            email: string;
            password: string | null;
            name: string;
            contactPerson: string | null;
            phone: string | null;
            address: string | null;
            country: string | null;
            customerType: import("@prisma/client").$Enums.CustomerType;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            salespersonId: string | null;
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
            id: string;
            email: string | null;
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
            customerType: import("@prisma/client").$Enums.CustomerType;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            salespersonId: string;
            customerId: string;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            orderNumber: string;
            orderType: import("@prisma/client").$Enums.OrderType;
            orderDate: Date;
            companyName: string | null;
        })[];
        _count: {
            orders: number;
        };
        id: string;
        email: string;
        password: string | null;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
        country: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string | null;
    }>;
    update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<{
        salesperson: {
            id: string;
            accountId: string;
            chineseName: string;
            englishName: string;
        } | null;
    } & {
        id: string;
        email: string;
        password: string | null;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
        country: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        password: string | null;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
        country: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string | null;
    }>;
    assignSalesperson(id: string, salespersonId: string): Promise<{
        salesperson: {
            id: string;
            email: string | null;
            phone: string | null;
            createdAt: Date;
            updatedAt: Date;
            accountId: string;
            chineseName: string;
            englishName: string;
            hireDate: Date;
            avatar: string | null;
        } | null;
    } & {
        id: string;
        email: string;
        password: string | null;
        name: string;
        contactPerson: string | null;
        phone: string | null;
        address: string | null;
        country: string | null;
        customerType: import("@prisma/client").$Enums.CustomerType;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        salespersonId: string | null;
    }>;
}

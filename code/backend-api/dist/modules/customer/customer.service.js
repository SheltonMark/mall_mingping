"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let CustomerService = class CustomerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createCustomerDto) {
        const { salespersonId, ...rest } = createCustomerDto;
        if (salespersonId) {
            const salesperson = await this.prisma.salesperson.findUnique({
                where: { id: salespersonId },
            });
            if (!salesperson) {
                throw new common_1.BadRequestException('Salesperson not found');
            }
        }
        return this.prisma.customer.create({
            data: {
                ...rest,
                salespersonId,
            },
            include: {
                salesperson: {
                    select: {
                        id: true,
                        accountId: true,
                        chineseName: true,
                        englishName: true,
                    },
                },
            },
        });
    }
    async findAll(query) {
        const { search, salespersonId, customerType, page = 1, limit = 10, } = query || {};
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { contactPerson: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } },
            ];
        }
        if (salespersonId) {
            where.salespersonId = salespersonId;
        }
        if (customerType) {
            where.customerType = customerType;
        }
        const [customers, total] = await Promise.all([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                include: {
                    salesperson: {
                        select: {
                            id: true,
                            accountId: true,
                            chineseName: true,
                            englishName: true,
                        },
                    },
                    _count: {
                        select: {
                            orders: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.customer.count({ where }),
        ]);
        return {
            data: customers,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                salesperson: {
                    select: {
                        id: true,
                        accountId: true,
                        chineseName: true,
                        englishName: true,
                        email: true,
                        phone: true,
                    },
                },
                orders: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        salesperson: {
                            select: {
                                chineseName: true,
                                englishName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        const orderStats = await this.prisma.order.aggregate({
            where: {
                customerId: id,
                status: { not: 'cancelled' },
            },
            _sum: {
                totalAmount: true,
            },
        });
        return {
            ...customer,
            stats: {
                totalOrders: customer._count.orders,
                totalAmount: orderStats._sum.totalAmount || 0,
            },
        };
    }
    async update(id, updateCustomerDto) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (updateCustomerDto.salespersonId) {
            const salesperson = await this.prisma.salesperson.findUnique({
                where: { id: updateCustomerDto.salespersonId },
            });
            if (!salesperson) {
                throw new common_1.BadRequestException('Salesperson not found');
            }
        }
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
            include: {
                salesperson: {
                    select: {
                        id: true,
                        accountId: true,
                        chineseName: true,
                        englishName: true,
                    },
                },
            },
        });
    }
    async remove(id) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        orders: true,
                    },
                },
            },
        });
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (customer._count.orders > 0) {
            throw new common_1.BadRequestException('Cannot delete customer with existing orders');
        }
        return this.prisma.customer.delete({
            where: { id },
        });
    }
    async assignSalesperson(customerId, salespersonId) {
        const [customer, salesperson] = await Promise.all([
            this.prisma.customer.findUnique({ where: { id: customerId } }),
            this.prisma.salesperson.findUnique({ where: { id: salespersonId } }),
        ]);
        if (!customer) {
            throw new common_1.NotFoundException('Customer not found');
        }
        if (!salesperson) {
            throw new common_1.NotFoundException('Salesperson not found');
        }
        return this.prisma.customer.update({
            where: { id: customerId },
            data: { salespersonId },
            include: {
                salesperson: true,
            },
        });
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CustomerService);
//# sourceMappingURL=customer.service.js.map
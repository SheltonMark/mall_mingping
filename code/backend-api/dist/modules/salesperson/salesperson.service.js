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
exports.SalespersonService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let SalespersonService = class SalespersonService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createSalespersonDto) {
        const { accountId, email, ...rest } = createSalespersonDto;
        const existing = await this.prisma.salesperson.findUnique({
            where: { accountId },
        });
        if (existing) {
            throw new common_1.ConflictException('Account ID already exists');
        }
        if (email) {
            const existingEmail = await this.prisma.salesperson.findUnique({
                where: { email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        return this.prisma.salesperson.create({
            data: {
                accountId,
                email,
                ...rest,
            },
        });
    }
    async findAll(query) {
        const { search, page = 1, limit = 10 } = query || {};
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { chineseName: { contains: search } },
                    { englishName: { contains: search } },
                    { accountId: { contains: search } },
                    { email: { contains: search } },
                ],
            }
            : {};
        const [salespersons, total] = await Promise.all([
            this.prisma.salesperson.findMany({
                where,
                skip,
                take: limit,
                include: {
                    _count: {
                        select: {
                            customers: true,
                            orders: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.salesperson.count({ where }),
        ]);
        return {
            data: salespersons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const salesperson = await this.prisma.salesperson.findUnique({
            where: { id },
            include: {
                customers: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
                orders: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        customer: true,
                    },
                },
                _count: {
                    select: {
                        customers: true,
                        orders: true,
                    },
                },
            },
        });
        if (!salesperson) {
            throw new common_1.NotFoundException('Salesperson not found');
        }
        const salesStats = await this.prisma.order.aggregate({
            where: {
                salespersonId: id,
                status: { not: 'cancelled' },
            },
            _sum: {
                totalAmount: true,
            },
        });
        return {
            ...salesperson,
            stats: {
                totalSales: salesStats._sum.totalAmount || 0,
            },
        };
    }
    async update(id, updateSalespersonDto) {
        const salesperson = await this.prisma.salesperson.findUnique({
            where: { id },
        });
        if (!salesperson) {
            throw new common_1.NotFoundException('Salesperson not found');
        }
        if (updateSalespersonDto.email) {
            const existingEmail = await this.prisma.salesperson.findFirst({
                where: {
                    email: updateSalespersonDto.email,
                    id: { not: id },
                },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        return this.prisma.salesperson.update({
            where: { id },
            data: updateSalespersonDto,
        });
    }
    async remove(id) {
        const salesperson = await this.prisma.salesperson.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        customers: true,
                        orders: true,
                    },
                },
            },
        });
        if (!salesperson) {
            throw new common_1.NotFoundException('Salesperson not found');
        }
        if (salesperson._count.customers > 0 ||
            salesperson._count.orders > 0) {
            throw new common_1.ConflictException('Cannot delete salesperson with existing customers or orders');
        }
        return this.prisma.salesperson.delete({
            where: { id },
        });
    }
};
exports.SalespersonService = SalespersonService;
exports.SalespersonService = SalespersonService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SalespersonService);
//# sourceMappingURL=salesperson.service.js.map
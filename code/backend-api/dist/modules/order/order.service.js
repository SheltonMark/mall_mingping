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
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const excel_service_1 = require("../../common/services/excel.service");
const library_1 = require("@prisma/client/runtime/library");
let OrderService = class OrderService {
    prisma;
    excelService;
    constructor(prisma, excelService) {
        this.prisma = prisma;
        this.excelService = excelService;
    }
    async create(createOrderDto) {
        const { items, customParams, customerId, salespersonId, orderNumber, ...orderData } = createOrderDto;
        const existingOrder = await this.prisma.order.findUnique({
            where: { orderNumber },
        });
        if (existingOrder) {
            throw new common_1.ConflictException('Order number already exists');
        }
        const [customer, salesperson] = await Promise.all([
            this.prisma.customer.findUnique({ where: { id: customerId } }),
            this.prisma.salesperson.findUnique({ where: { id: salespersonId } }),
        ]);
        if (!customer) {
            throw new common_1.BadRequestException('Customer not found');
        }
        if (!salesperson) {
            throw new common_1.BadRequestException('Salesperson not found');
        }
        const skuIds = items.map((item) => item.productSkuId);
        const skus = await this.prisma.productSku.findMany({
            where: { id: { in: skuIds } },
        });
        if (skus.length !== skuIds.length) {
            throw new common_1.BadRequestException('One or more product SKUs not found');
        }
        let totalAmount = new library_1.Decimal(0);
        const orderItems = items.map((item) => {
            const subtotal = new library_1.Decimal(item.price).mul(item.quantity);
            totalAmount = totalAmount.add(subtotal);
            return {
                productSkuId: item.productSkuId,
                quantity: item.quantity,
                price: new library_1.Decimal(item.price),
                subtotal,
            };
        });
        return this.prisma.order.create({
            data: {
                orderNumber,
                customerId,
                salespersonId,
                ...orderData,
                totalAmount,
                items: {
                    create: orderItems,
                },
                customParams: customParams
                    ? {
                        create: customParams.map((param) => ({
                            paramKey: param.paramKey,
                            paramValue: param.paramValue,
                        })),
                    }
                    : undefined,
            },
            include: {
                customer: true,
                salesperson: {
                    select: {
                        id: true,
                        accountId: true,
                        chineseName: true,
                        englishName: true,
                    },
                },
                items: {
                    include: {
                        productSku: {
                            include: {
                                group: true,
                            },
                        },
                    },
                },
                customParams: true,
            },
        });
    }
    async findAll(query) {
        const { search, customerId, salespersonId, orderType, status, startDate, endDate, page = 1, limit = 10, } = query || {};
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { orderNumber: { contains: search } },
                { customer: { name: { contains: search } } },
            ];
        }
        if (customerId) {
            where.customerId = customerId;
        }
        if (salespersonId) {
            where.salespersonId = salespersonId;
        }
        if (orderType) {
            where.orderType = orderType;
        }
        if (status) {
            where.status = status;
        }
        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) {
                where.orderDate.gte = new Date(startDate);
            }
            if (endDate) {
                where.orderDate.lte = new Date(endDate);
            }
        }
        const [orders, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip,
                take: limit,
                include: {
                    customer: {
                        select: {
                            id: true,
                            name: true,
                            contactPerson: true,
                        },
                    },
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
                            items: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.order.count({ where }),
        ]);
        return {
            data: orders,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                customer: true,
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
                items: {
                    include: {
                        productSku: {
                            include: {
                                group: {
                                    include: {
                                        category: true,
                                        material: true,
                                    },
                                },
                            },
                        },
                    },
                },
                customParams: true,
            },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async update(id, updateOrderDto) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: { items: true, customParams: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const { items, customParams, ...orderData } = updateOrderDto;
        let totalAmount;
        if (items && items.length > 0) {
            totalAmount = new library_1.Decimal(0);
            items.forEach((item) => {
                const subtotal = new library_1.Decimal(item.price).mul(item.quantity);
                totalAmount = totalAmount.add(subtotal);
            });
        }
        return this.prisma.order.update({
            where: { id },
            data: {
                ...orderData,
                totalAmount,
                ...(items && {
                    items: {
                        deleteMany: {},
                        create: items.map((item) => ({
                            productSkuId: item.productSkuId,
                            quantity: item.quantity,
                            price: new library_1.Decimal(item.price),
                            subtotal: new library_1.Decimal(item.price).mul(item.quantity),
                        })),
                    },
                }),
                ...(customParams && {
                    customParams: {
                        deleteMany: {},
                        create: customParams.map((param) => ({
                            paramKey: param.paramKey,
                            paramValue: param.paramValue,
                        })),
                    },
                }),
            },
            include: {
                customer: true,
                salesperson: {
                    select: {
                        id: true,
                        accountId: true,
                        chineseName: true,
                        englishName: true,
                    },
                },
                items: {
                    include: {
                        productSku: {
                            include: {
                                group: true,
                            },
                        },
                    },
                },
                customParams: true,
            },
        });
    }
    async remove(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return this.prisma.order.delete({
            where: { id },
        });
    }
    async createParamConfig(dto) {
        const existing = await this.prisma.orderParamConfig.findUnique({
            where: { fieldName: dto.fieldName },
        });
        if (existing) {
            throw new common_1.ConflictException('Field name already exists');
        }
        return this.prisma.orderParamConfig.create({
            data: dto,
        });
    }
    async findAllParamConfigs(activeOnly = false) {
        return this.prisma.orderParamConfig.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            orderBy: { displayOrder: 'asc' },
        });
    }
    async findOneParamConfig(id) {
        const config = await this.prisma.orderParamConfig.findUnique({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Param config not found');
        }
        return config;
    }
    async updateParamConfig(id, dto) {
        const config = await this.prisma.orderParamConfig.findUnique({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Param config not found');
        }
        return this.prisma.orderParamConfig.update({
            where: { id },
            data: dto,
        });
    }
    async removeParamConfig(id) {
        const config = await this.prisma.orderParamConfig.findUnique({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Param config not found');
        }
        return this.prisma.orderParamConfig.delete({
            where: { id },
        });
    }
    async exportOrderToExcel(orderId, res) {
        const order = await this.findOne(orderId);
        const orderData = {
            orderNumber: order.orderNumber,
            orderDate: order.orderDate.toISOString().split('T')[0],
            orderType: order.orderType,
            customerType: order.customerType,
            status: order.status,
            customer: order.customer.name,
            contactPerson: order.customer.contactPerson || '-',
            salesperson: `${order.salesperson.chineseName} (${order.salesperson.englishName})`,
            totalAmount: order.totalAmount?.toNumber() || 0,
        };
        const itemsData = order.items.map((item, index) => ({
            序号: index + 1,
            品号: item.productSku.productCode,
            商品组: item.productSku.group.groupNameZh,
            数量: item.quantity,
            单价: item.price.toNumber(),
            小计: item.subtotal.toNumber(),
        }));
        const paramsData = order.customParams.map((param) => ({
            参数名: param.paramKey,
            参数值: param.paramValue || '-',
        }));
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const infoSheet = workbook.addWorksheet('订单信息');
        infoSheet.addRow(['订单号', orderData.orderNumber]);
        infoSheet.addRow(['订单日期', orderData.orderDate]);
        infoSheet.addRow(['订单类型', orderData.orderType]);
        infoSheet.addRow(['客户类型', orderData.customerType]);
        infoSheet.addRow(['状态', orderData.status]);
        infoSheet.addRow(['客户名称', orderData.customer]);
        infoSheet.addRow(['联系人', orderData.contactPerson]);
        infoSheet.addRow(['业务员', orderData.salesperson]);
        infoSheet.addRow(['订单总额', orderData.totalAmount]);
        infoSheet.getColumn(1).width = 20;
        infoSheet.getColumn(2).width = 40;
        const itemsSheet = workbook.addWorksheet('订单明细');
        itemsSheet.columns = [
            { header: '序号', key: '序号', width: 10 },
            { header: '品号', key: '品号', width: 20 },
            { header: '商品组', key: '商品组', width: 25 },
            { header: '数量', key: '数量', width: 15 },
            { header: '单价', key: '单价', width: 15 },
            { header: '小计', key: '小计', width: 15 },
        ];
        itemsSheet.getRow(1).font = { bold: true };
        itemsSheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' },
        };
        itemsData.forEach((item) => itemsSheet.addRow(item));
        if (paramsData.length > 0) {
            const paramsSheet = workbook.addWorksheet('自定义参数');
            paramsSheet.columns = [
                { header: '参数名', key: '参数名', width: 30 },
                { header: '参数值', key: '参数值', width: 40 },
            ];
            paramsSheet.getRow(1).font = { bold: true };
            paramsSheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };
            paramsData.forEach((param) => paramsSheet.addRow(param));
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Order_${order.orderNumber}.xlsx"`);
        await workbook.xlsx.write(res);
        res.end();
    }
    async exportOrdersToExcel(orderIds, res) {
        if (!orderIds || orderIds.length === 0) {
            throw new common_1.BadRequestException('No order IDs provided');
        }
        const orders = await this.prisma.order.findMany({
            where: { id: { in: orderIds } },
            include: {
                customer: true,
                salesperson: {
                    select: {
                        chineseName: true,
                        englishName: true,
                    },
                },
                items: {
                    include: {
                        productSku: {
                            include: {
                                group: true,
                            },
                        },
                    },
                },
            },
        });
        if (orders.length === 0) {
            throw new common_1.NotFoundException('No orders found');
        }
        const data = orders.map((order) => ({
            订单号: order.orderNumber,
            订单日期: order.orderDate.toISOString().split('T')[0],
            订单类型: order.orderType,
            客户类型: order.customerType,
            状态: order.status,
            客户: order.customer.name,
            联系人: order.customer.contactPerson || '-',
            业务员: `${order.salesperson.chineseName} (${order.salesperson.englishName})`,
            订单总额: order.totalAmount?.toNumber() || 0,
            明细数量: order.items.length,
        }));
        const columns = [
            { header: '订单号', key: '订单号', width: 20 },
            { header: '订单日期', key: '订单日期', width: 15 },
            { header: '订单类型', key: '订单类型', width: 15 },
            { header: '客户类型', key: '客户类型', width: 15 },
            { header: '状态', key: '状态', width: 15 },
            { header: '客户', key: '客户', width: 25 },
            { header: '联系人', key: '联系人', width: 20 },
            { header: '业务员', key: '业务员', width: 25 },
            { header: '订单总额', key: '订单总额', width: 15 },
            { header: '明细数量', key: '明细数量', width: 15 },
        ];
        await this.excelService.streamExcelToResponse(res, data, columns, `Orders_Batch_${Date.now()}.xlsx`, '订单列表');
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        excel_service_1.ExcelService])
], OrderService);
//# sourceMappingURL=order.service.js.map
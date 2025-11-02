import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  CreateOrderParamConfigDto,
  UpdateOrderParamConfigDto,
} from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private excelService: ExcelService,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const {
      items,
      customParams,
      customerId,
      salespersonId,
      orderNumber,
      companyName,
      ...orderData
    } = createOrderDto;

    // Check if order number already exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { orderNumber },
    });
    if (existingOrder) {
      throw new ConflictException('Order number already exists');
    }

    // Verify customer and salesperson exist
    const [customer, salesperson] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: customerId } }),
      this.prisma.salesperson.findUnique({ where: { id: salespersonId } }),
    ]);

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }
    if (!salesperson) {
      throw new BadRequestException('Salesperson not found');
    }

    // Verify all product SKUs exist
    const skuIds = items.map((item) => item.productSkuId);
    const skus = await this.prisma.productSku.findMany({
      where: { id: { in: skuIds } },
    });

    if (skus.length !== skuIds.length) {
      throw new BadRequestException('One or more product SKUs not found');
    }

    // Calculate total amount
    let totalAmount = new Decimal(0);
    const orderItems = items.map((item, index) => {
      const subtotal = new Decimal(item.price).mul(item.quantity);
      totalAmount = totalAmount.add(subtotal);
      return {
        productSkuId: item.productSkuId,
        itemNumber: item.itemNumber || index + 1,
        customerProductCode: item.customerProductCode,
        productImage: item.productImage,
        productSpec: item.productSpec,
        additionalAttributes: item.additionalAttributes,
        quantity: item.quantity,
        packagingConversion: item.packagingConversion ? new Decimal(item.packagingConversion) : undefined,
        packagingUnit: item.packagingUnit,
        weightUnit: item.weightUnit,
        netWeight: item.netWeight ? new Decimal(item.netWeight) : undefined,
        grossWeight: item.grossWeight ? new Decimal(item.grossWeight) : undefined,
        packagingType: item.packagingType,
        packagingSize: item.packagingSize,
        supplierNote: item.supplierNote,
        expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : undefined,
        price: new Decimal(item.price),
        untaxedLocalCurrency: item.untaxedLocalCurrency ? new Decimal(item.untaxedLocalCurrency) : undefined,
        packingQuantity: item.packingQuantity,
        cartonQuantity: item.cartonQuantity,
        packagingMethod: item.packagingMethod,
        paperCardCode: item.paperCardCode,
        washLabelCode: item.washLabelCode,
        outerCartonCode: item.outerCartonCode,
        cartonSpecification: item.cartonSpecification,
        volume: item.volume ? new Decimal(item.volume) : undefined,
        summary: item.summary,
        subtotal,
      };
    });

    // Create order with items and custom params
    return this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        salespersonId,
        companyName,
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

  async findAll(query?: {
    search?: string;
    customerId?: string;
    salespersonId?: string;
    orderType?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      customerId,
      salespersonId,
      orderType,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

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

  async findOne(id: string) {
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
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customParams: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const { items, customParams, ...orderData } = updateOrderDto;

    // If items are updated, recalculate total
    let totalAmount: Decimal | undefined;
    const orderItems = items && items.length > 0 ? items.map((item, index) => {
      const subtotal = new Decimal(item.price).mul(item.quantity);
      if (!totalAmount) totalAmount = new Decimal(0);
      totalAmount = totalAmount.add(subtotal);

      return {
        productSkuId: item.productSkuId,
        itemNumber: item.itemNumber || index + 1,
        customerProductCode: item.customerProductCode,
        productImage: item.productImage,
        productSpec: item.productSpec,
        additionalAttributes: item.additionalAttributes,
        quantity: item.quantity,
        packagingConversion: item.packagingConversion ? new Decimal(item.packagingConversion) : undefined,
        packagingUnit: item.packagingUnit,
        weightUnit: item.weightUnit,
        netWeight: item.netWeight ? new Decimal(item.netWeight) : undefined,
        grossWeight: item.grossWeight ? new Decimal(item.grossWeight) : undefined,
        packagingType: item.packagingType,
        packagingSize: item.packagingSize,
        supplierNote: item.supplierNote,
        expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate) : undefined,
        price: new Decimal(item.price),
        untaxedLocalCurrency: item.untaxedLocalCurrency ? new Decimal(item.untaxedLocalCurrency) : undefined,
        packingQuantity: item.packingQuantity,
        cartonQuantity: item.cartonQuantity,
        packagingMethod: item.packagingMethod,
        paperCardCode: item.paperCardCode,
        washLabelCode: item.washLabelCode,
        outerCartonCode: item.outerCartonCode,
        cartonSpecification: item.cartonSpecification,
        volume: item.volume ? new Decimal(item.volume) : undefined,
        summary: item.summary,
        subtotal,
      };
    }) : undefined;

    // Update order
    return this.prisma.order.update({
      where: { id },
      data: {
        ...orderData,
        totalAmount,
        // Delete old items and create new ones if items are provided
        ...(orderItems && {
          items: {
            deleteMany: {},
            create: orderItems,
          },
        }),
        // Delete old custom params and create new ones if provided
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

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.delete({
      where: { id },
    });
  }

  // Order Param Config methods
  async createParamConfig(dto: CreateOrderParamConfigDto) {
    const existing = await this.prisma.orderParamConfig.findUnique({
      where: { fieldName: dto.fieldName },
    });

    if (existing) {
      throw new ConflictException('Field name already exists');
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

  async findOneParamConfig(id: string) {
    const config = await this.prisma.orderParamConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Param config not found');
    }

    return config;
  }

  async updateParamConfig(id: string, dto: UpdateOrderParamConfigDto) {
    const config = await this.prisma.orderParamConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Param config not found');
    }

    return this.prisma.orderParamConfig.update({
      where: { id },
      data: dto,
    });
  }

  async removeParamConfig(id: string) {
    const config = await this.prisma.orderParamConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Param config not found');
    }

    return this.prisma.orderParamConfig.delete({
      where: { id },
    });
  }

  // ============ Excel Export Methods ============
  async exportOrderToExcel(orderId: string, res: Response) {
    const order = await this.findOne(orderId);
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Company name and title (rows 1-2)
    const companyName = order.companyName || '东阳市铭品日用品有限公司';
    worksheet.mergeCells('C1:F1');
    worksheet.getCell('C1').value = companyName;
    worksheet.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('C1').font = { size: 14, bold: true };

    worksheet.mergeCells('C2:F2');
    worksheet.getCell('C2').value = '销售订单';
    worksheet.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('C2').font = { size: 12, bold: true };

    // Category labels (row 5)
    worksheet.getCell('A5').value = '系统自带';
    worksheet.getCell('R5').value = '销售填写';
    worksheet.getCell('A5').font = { bold: true };
    worksheet.getCell('R5').font = { bold: true };

    // Headers (row 6) - 28 columns matching template
    const headers = [
      '项', '品号', '客户料号', '[货品图片]', '品名', '货品规格', '附加属性',
      '数量', '包装换算', '包装单位', '重量单位', '包装净重', '包装毛重',
      '包装类型', '包装大小', '厂商备注', '预交日', '单价', '未税本位币',
      '装箱数', '*箱数*', '包装方式', '纸卡编码', '水洗标编码', '外箱编码',
      '箱规', '体积', '摘要'
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(6, index + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Set column widths
    const columnWidths = [6, 18, 15, 12, 25, 30, 12, 8, 12, 12, 12, 12, 12, 12, 12, 15, 12, 8, 12, 8, 8, 12, 15, 15, 15, 15, 8, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Data rows (starting from row 7)
    order.items.forEach((item, index) => {
      const rowNumber = 7 + index;
      const row = worksheet.getRow(rowNumber);

      row.values = [
        item.itemNumber || index + 1,                           // A: 项
        item.productSku.productCode,                            // B: 品号
        item.customerProductCode || '',                         // C: 客户料号
        item.productImage || '',                                // D: [货品图片]
        item.productSku.group.groupNameZh,                      // E: 品名
        item.productSpec || '',                                 // F: 货品规格
        item.additionalAttributes || '',                        // G: 附加属性
        item.quantity,                                          // H: 数量
        item.packagingConversion?.toNumber() || '',             // I: 包装换算
        item.packagingUnit || '',                               // J: 包装单位
        item.weightUnit || '',                                  // K: 重量单位
        item.netWeight?.toNumber() || '',                       // L: 包装净重
        item.grossWeight?.toNumber() || '',                     // M: 包装毛重
        item.packagingType || '',                               // N: 包装类型
        item.packagingSize || '',                               // O: 包装大小
        item.supplierNote || '',                                // P: 厂商备注
        item.expectedDeliveryDate ? item.expectedDeliveryDate.toISOString().split('T')[0] : '',  // Q: 预交日
        item.price.toNumber(),                                  // R: 单价
        item.untaxedLocalCurrency?.toNumber() || '',            // S: 未税本位币
        item.packingQuantity || '',                             // T: 装箱数
        item.cartonQuantity || '',                              // U: *箱数*
        item.packagingMethod || '',                             // V: 包装方式
        item.paperCardCode || '',                               // W: 纸卡编码
        item.washLabelCode || '',                               // X: 水洗标编码
        item.outerCartonCode || '',                             // Y: 外箱编码
        item.cartonSpecification || '',                         // Z: 箱规
        item.volume?.toNumber() || '',                          // AA: 体积
        item.summary || '',                                     // AB: 摘要
      ];

      // Add borders to all cells
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Total row (after all items)
    const totalRow = 7 + order.items.length + 22; // Leave space for 20 empty rows like template
    worksheet.getCell(totalRow, 19).value = '自动合计总额'; // Column S
    worksheet.getCell(totalRow, 27).value = '自动合计总额'; // Column AA
    worksheet.getCell(totalRow, 19).font = { bold: true };
    worksheet.getCell(totalRow, 27).font = { bold: true };

    // Calculate totals
    const totalUntaxed = order.items.reduce((sum, item) =>
      sum + (item.untaxedLocalCurrency?.toNumber() || 0), 0);
    const totalVolume = order.items.reduce((sum, item) =>
      sum + (item.volume?.toNumber() || 0), 0);

    worksheet.getCell(totalRow + 1, 19).value = totalUntaxed;
    worksheet.getCell(totalRow + 1, 27).value = totalVolume;

    // Send response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SalesOrder_${order.orderNumber}_${Date.now()}.xlsx"`,
    );
    await workbook.xlsx.write(res);
    res.end();
  }

  async exportOrdersToExcel(orderIds: string[], res: Response) {
    if (!orderIds || orderIds.length === 0) {
      throw new BadRequestException('No order IDs provided');
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
      throw new NotFoundException('No orders found');
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

    await this.excelService.streamExcelToResponse(
      res,
      data,
      columns,
      `Orders_Batch_${Date.now()}.xlsx`,
      '订单列表',
    );
  }
}

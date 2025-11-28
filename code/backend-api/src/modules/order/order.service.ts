import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { ErpOrderSyncService } from '../../erp/erp-order-sync.service';
import {
  CreateOrderDto,
  UpdateOrderDto,
  CreateOrderParamConfigDto,
  UpdateOrderParamConfigDto,
} from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';

// 提取双语文本的中文部分
function extractChineseText(text: string | null | undefined): string {
  if (!text) return '';

  // 支持 | 和 / 两种分隔符
  if (text.includes('|')) {
    const [zh] = text.split('|').map(s => s.trim());
    return zh || text;
  }

  if (text.includes('/')) {
    const [zh] = text.split('/').map(s => s.trim());
    return zh || text;
  }

  // 否则直接返回原文本
  return text;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private excelService: ExcelService,
    private erpOrderSyncService: ErpOrderSyncService,
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
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId,
        salespersonId,
        companyName,
        ...orderData,
        totalAmount,
        erpSyncStatus: 'pending', // 初始化 ERP 同步状态
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

    // 异步同步到 ERP（不阻塞订单创建）
    this.syncOrderToErpAsync(order.id);

    return order;
  }

  /**
   * 异步同步订单到 ERP
   * 不阻塞订单创建，同步失败会记录到数据库
   */
  private async syncOrderToErpAsync(orderId: string): Promise<void> {
    try {
      const result = await this.erpOrderSyncService.syncOrderToErp(orderId);
      if (result.success) {
        this.logger.log(`订单 ${orderId} 同步到 ERP 成功: ${result.erpOrderNo}`);
      } else {
        this.logger.warn(`订单 ${orderId} 同步到 ERP 失败: ${result.error}`);
      }
    } catch (error) {
      this.logger.error(
        `订单 ${orderId} 同步到 ERP 异常: ${error instanceof Error ? error.message : error}`,
      );
    }
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
              
            },
          },
          items: {
            include: {
              productSku: true,
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
    const worksheet = workbook.addWorksheet('销售订单');

    // Row 1: Company name
    const companyName = order.companyName || '东阳市铭品日用品有限公司';
    worksheet.mergeCells('A1:AB1');
    worksheet.getCell('A1').value = companyName;
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getRow(1).height = 25;

    // Row 2: Title "销售订单"
    worksheet.mergeCells('A2:AB2');
    worksheet.getCell('A2').value = '销售订单';
    worksheet.getCell('A2').alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getRow(2).height = 22;

    // Row 3: Empty
    worksheet.getRow(3).height = 5;

    // Row 4-5: Customer and Salesperson Information
    worksheet.getCell('A4').value = '客户信息';
    worksheet.getCell('A4').font = { bold: true, size: 11 };
    worksheet.getCell('A5').value = `公司名称: ${order.customer.name}`;
    worksheet.getCell('H5').value = `联系人: ${order.customer.contactPerson || ''}`;
    worksheet.getCell('O5').value = `电话: ${order.customer.phone || ''}`;
    worksheet.getCell('U5').value = `地址: ${order.customer.address || ''}`;

    worksheet.getCell('A6').value = `业务员: ${order.salesperson.chineseName} (${order.salesperson.accountId})`;
    worksheet.getCell('H6').value = `订单号: ${order.orderNumber}`;
    worksheet.getCell('O6').value = `订单日期: ${order.orderDate.toISOString().split('T')[0]}`;

    // Row 7: Empty
    worksheet.getRow(7).height = 5;

    // Row 8: Category labels
    worksheet.getCell('A8').value = '系统自带';
    worksheet.getCell('R8').value = '销售填写';
    worksheet.getCell('A8').font = { bold: true };
    worksheet.getCell('R8').font = { bold: true };

    // Row 9: Headers - 28 columns matching template
    const headers = [
      '项', '品号', '客户料号', '[货品图片]', '品名', '货品规格', '附加属性',
      '数量', '包装换算', '包装单位', '重量单位', '包装净重', '包装毛重',
      '包装类型', '包装大小', '厂商备注', '预交日', '单价', '未税本位币',
      '装箱数', '*箱数*', '包装方式', '纸卡编码', '水洗标编码', '外箱编码',
      '箱规', '体积', '摘要'
    ];

    headers.forEach((header, index) => {
      const cell = worksheet.getCell(9, index + 1);
      cell.value = header;
      cell.font = { bold: true, size: 10 };
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
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Set column widths
    const columnWidths = [6, 18, 15, 12, 25, 30, 12, 8, 12, 12, 12, 12, 12, 12, 12, 15, 12, 8, 12, 8, 8, 12, 15, 15, 15, 15, 8, 15];
    columnWidths.forEach((width, index) => {
      worksheet.getColumn(index + 1).width = width;
    });

    // Data rows (starting from row 10)
    order.items.forEach((item, index) => {
      const rowNumber = 10 + index;
      const row = worksheet.getRow(rowNumber);

      row.values = [
        item.itemNumber || index + 1,                           // A: 项
        item.productSku.productCode,                            // B: 品号
        item.customerProductCode || '',                         // C: 客户料号
        item.productImage || '',                                // D: [货品图片]
        item.productSku.group.groupNameZh,                      // E: 品名
        item.productSpec || '',                                 // F: 货品规格
        (() => {
          try {
            if (!item.additionalAttributes) return '';
            if (typeof item.additionalAttributes === 'string') {
              const parsed = JSON.parse(item.additionalAttributes);
              return parsed.nameZh || parsed.nameEn || '';
            } else if (typeof item.additionalAttributes === 'object' && 'nameZh' in item.additionalAttributes) {
              return (item.additionalAttributes as any).nameZh || '';
            }
            return '';
          } catch (e) {
            return '';
          }
        })(),                        // G: 附加属性
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
        cell.alignment = { vertical: 'middle' };
      });
    });

    // Total row (after all items + 20 empty rows)
    const totalRow = 10 + order.items.length + 20;
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
      业务员: `${order.salesperson.chineseName}`,
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

  // ============ 订单审核相关方法 ============

  /**
   * 审核通过订单
   */
  async approveOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('只能审核待审核状态的订单');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'approved',
        rejectReason: null,
      },
    });
  }

  /**
   * 驳回订单
   */
  async rejectOrder(id: string, rejectReason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'pending') {
      throw new BadRequestException('只能驳回待审核状态的订单');
    }

    if (!rejectReason || rejectReason.trim() === '') {
      throw new BadRequestException('驳回原因不能为空');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectReason: rejectReason.trim(),
      },
    });
  }

  /**
   * 同步订单到 ERP（只能同步已审核的订单）
   */
  async syncToErp(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'approved' && order.status !== 'sync_failed') {
      throw new BadRequestException('只能同步已审核或同步失败的订单');
    }

    try {
      const result = await this.erpOrderSyncService.syncOrderToErp(id);

      if (result.success) {
        await this.prisma.order.update({
          where: { id },
          data: {
            status: 'synced',
            erpOrderNo: result.erpOrderNo,
            erpSyncAt: new Date(),
            erpSyncError: null,
          },
        });

        return {
          success: true,
          erpOrderNo: result.erpOrderNo,
          message: '同步成功',
        };
      } else {
        await this.prisma.order.update({
          where: { id },
          data: {
            status: 'sync_failed',
            erpSyncError: result.error,
          },
        });

        return {
          success: false,
          error: result.error,
          message: '同步失败',
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      await this.prisma.order.update({
        where: { id },
        data: {
          status: 'sync_failed',
          erpSyncError: errorMessage,
        },
      });

      throw new BadRequestException(`同步失败: ${errorMessage}`);
    }
  }

  /**
   * 批量审核通过
   */
  async batchApprove(ids: string[]) {
    const results = [];
    for (const id of ids) {
      try {
        await this.approveOrder(id);
        results.push({ id, success: true });
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return results;
  }

  /**
   * 批量同步到 ERP
   */
  async batchSyncToErp(ids: string[]) {
    const results = [];
    for (const id of ids) {
      try {
        const result = await this.syncToErp(id);
        results.push({ id, ...result });
      } catch (error) {
        results.push({ id, success: false, error: error instanceof Error ? error.message : String(error) });
      }
    }
    return results;
  }

  /**
   * 重新提交审核（被驳回的订单）
   */
  async resubmitOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('订单不存在');
    }

    if (order.status !== 'rejected') {
      throw new BadRequestException('只有被驳回的订单才能重新提交审核');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'pending',
        rejectReason: null, // 清除驳回原因
      },
    });
  }
}

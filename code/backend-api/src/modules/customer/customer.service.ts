import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { salespersonId, name, contactPerson, email, phone, address, customerType, password, tier } = createCustomerDto;

    // Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      throw new BadRequestException('Email already registered');
    }

    // Verify salesperson exists if provided
    if (salespersonId) {
      const salesperson = await this.prisma.salesperson.findUnique({
        where: { id: salespersonId },
      });
      if (!salesperson) {
        throw new BadRequestException('Salesperson not found');
      }
    }

    // Hash password if provided
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.customer.create({
      data: {
        name,
        email,
        ...(hashedPassword && { password: hashedPassword }),
        ...(contactPerson && { contactPerson }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(salespersonId && { salespersonId }),
        ...(customerType && { customerType }),
        ...(tier && { tier }),
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

  async findAll(query?: {
    search?: string;
    salespersonId?: string;
    customerType?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      salespersonId,
      customerType,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    // Salesperson filter
    if (salespersonId) {
      where.salespersonId = salespersonId;
    }

    // Customer type filter
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

  async findOne(id: string) {
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
      throw new NotFoundException('Customer not found');
    }

    // Calculate total order amount
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

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify salesperson exists if updating
    if (updateCustomerDto.salespersonId) {
      const salesperson = await this.prisma.salesperson.findUnique({
        where: { id: updateCustomerDto.salespersonId },
      });
      if (!salesperson) {
        throw new BadRequestException('Salesperson not found');
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

  async remove(id: string) {
    // Check if customer exists and get counts
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            orderForms: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if customer has orders or order forms
    if (customer._count.orders > 0 || customer._count.orderForms > 0) {
      throw new BadRequestException(
        `无法删除该客户：该客户有 ${customer._count.orders} 个订单和 ${customer._count.orderForms} 个订单表单。请先删除相关数据。`,
      );
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }

  // Assign or reassign salesperson
  async assignSalesperson(customerId: string, salespersonId: string) {
    const [customer, salesperson] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: customerId } }),
      this.prisma.salesperson.findUnique({ where: { id: salespersonId } }),
    ]);

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    return this.prisma.customer.update({
      where: { id: customerId },
      data: { salespersonId },
      include: {
        salesperson: true,
      },
    });
  }
}

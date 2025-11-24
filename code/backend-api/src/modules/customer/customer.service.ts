import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const { name, contactPerson, email, phone, address, customerType, salespersonId } = createCustomerDto;

    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existingCustomer) {
      throw new BadRequestException('邮箱已被使用');
    }

    return this.prisma.customer.create({
      data: {
        name,
        email,
        salespersonId,
        ...(contactPerson && { contactPerson }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(customerType && { customerType }),
      },
      include: {
        salesperson: {
          select: {
            id: true,
            accountId: true,
            chineseName: true,
          },
        },
      },
    });
  }

  async findAll(query?: {
    search?: string;
    customerType?: string;
    salespersonId?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      customerType,
      salespersonId,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (salespersonId) {
      where.salespersonId = salespersonId;
    }

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          salesperson: {
            select: {
              id: true,
              accountId: true,
              chineseName: true,
            },
          },
          _count: {
            select: {
              orders: true,
            },
          },
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
          },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('客户不存在');
    }

    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });
      if (existingCustomer) {
        throw new BadRequestException('邮箱已被使用');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string) {
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
      throw new NotFoundException('客户不存在');
    }

    if (customer._count.orders > 0) {
      throw new BadRequestException('无法删除有订单记录的客户');
    }

    return this.prisma.customer.delete({
      where: { id },
    });
  }
}

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateSalespersonDto,
  UpdateSalespersonDto,
} from './dto/salesperson.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SalespersonService {
  constructor(private prisma: PrismaService) {}

  async create(createSalespersonDto: CreateSalespersonDto) {
    const { accountId, chineseName, password } = createSalespersonDto;

    const existing = await this.prisma.salesperson.findUnique({
      where: { accountId },
    });

    if (existing) {
      throw new ConflictException('工号已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return this.prisma.salesperson.create({
      data: {
        accountId,
        chineseName,
        password: hashedPassword,
      },
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(query?: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { chineseName: { contains: search } },
            { accountId: { contains: search } },
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
              cartItems: true,
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
      data: salespersons.map((sp) => ({
        id: sp.id,
        accountId: sp.accountId,
        chineseName: sp.chineseName,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
        _count: sp._count,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
      include: {
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
            cartItems: true,
          },
        },
      },
    });

    if (!salesperson) {
      throw new NotFoundException('业务员不存在');
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
      id: salesperson.id,
      accountId: salesperson.accountId,
      chineseName: salesperson.chineseName,
      createdAt: salesperson.createdAt,
      updatedAt: salesperson.updatedAt,
      orders: salesperson.orders,
      _count: salesperson._count,
      stats: {
        totalSales: salesStats._sum.totalAmount || 0,
      },
    };
  }

  async update(id: string, updateSalespersonDto: UpdateSalespersonDto) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
    });

    if (!salesperson) {
      throw new NotFoundException('业务员不存在');
    }

    const dataToUpdate: any = {};

    if (updateSalespersonDto.chineseName) {
      dataToUpdate.chineseName = updateSalespersonDto.chineseName;
    }

    if (updateSalespersonDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateSalespersonDto.password, 10);
    }

    return this.prisma.salesperson.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            customers: true,
            orders: true,
            cartItems: true,
          },
        },
      },
    });

    if (!salesperson) {
      throw new NotFoundException('业务员不存在');
    }

    if (
      salesperson._count.customers > 0 ||
      salesperson._count.orders > 0 ||
      salesperson._count.cartItems > 0
    ) {
      throw new ConflictException(
        '无法删除有客户、订单或购物车记录的业务员',
      );
    }

    return this.prisma.salesperson.delete({
      where: { id },
    });
  }
}

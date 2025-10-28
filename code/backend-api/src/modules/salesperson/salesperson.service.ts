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

@Injectable()
export class SalespersonService {
  constructor(private prisma: PrismaService) {}

  async create(createSalespersonDto: CreateSalespersonDto) {
    const { accountId, email, ...rest } = createSalespersonDto;

    // Check if accountId already exists
    const existing = await this.prisma.salesperson.findUnique({
      where: { accountId },
    });

    if (existing) {
      throw new ConflictException('Account ID already exists');
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await this.prisma.salesperson.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
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

  async findAll(query?: { search?: string; page?: number; limit?: number }) {
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

  async findOne(id: string) {
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
      throw new NotFoundException('Salesperson not found');
    }

    // Calculate total sales amount
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

  async update(id: string, updateSalespersonDto: UpdateSalespersonDto) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id },
    });

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    // Check email uniqueness if updating
    if (updateSalespersonDto.email) {
      const existingEmail = await this.prisma.salesperson.findFirst({
        where: {
          email: updateSalespersonDto.email,
          id: { not: id },
        },
      });
      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    return this.prisma.salesperson.update({
      where: { id },
      data: updateSalespersonDto,
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
          },
        },
      },
    });

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    // Check if salesperson has customers or orders
    if (
      salesperson._count.customers > 0 ||
      salesperson._count.orders > 0
    ) {
      throw new ConflictException(
        'Cannot delete salesperson with existing customers or orders',
      );
    }

    return this.prisma.salesperson.delete({
      where: { id },
    });
  }
}

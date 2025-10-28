import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreatePartnershipDto,
  UpdatePartnershipDto,
} from './dto/partnership.dto';

@Injectable()
export class PartnershipService {
  constructor(private prisma: PrismaService) {}

  async create(createPartnershipDto: CreatePartnershipDto) {
    return this.prisma.partnershipApplication.create({
      data: createPartnershipDto,
    });
  }

  async findAll(query?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, search, page = 1, limit = 10 } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.partnershipApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.partnershipApplication.count({ where }),
    ]);

    return {
      data: applications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.partnershipApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Partnership application not found');
    }

    return application;
  }

  async update(id: string, updatePartnershipDto: UpdatePartnershipDto) {
    const application = await this.prisma.partnershipApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Partnership application not found');
    }

    return this.prisma.partnershipApplication.update({
      where: { id },
      data: updatePartnershipDto,
    });
  }

  async remove(id: string) {
    const application = await this.prisma.partnershipApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Partnership application not found');
    }

    return this.prisma.partnershipApplication.delete({
      where: { id },
    });
  }

  // Statistics
  async getStatistics() {
    const [total, pending, contacted, partnered, rejected] = await Promise.all([
      this.prisma.partnershipApplication.count(),
      this.prisma.partnershipApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.partnershipApplication.count({ where: { status: 'CONTACTED' } }),
      this.prisma.partnershipApplication.count({ where: { status: 'PARTNERED' } }),
      this.prisma.partnershipApplication.count({ where: { status: 'REJECTED' } }),
    ]);

    return {
      total,
      pending,
      contacted,
      partnered,
      rejected,
    };
  }
}

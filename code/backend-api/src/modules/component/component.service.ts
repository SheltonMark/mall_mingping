import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateComponentDto,
  UpdateComponentDto,
} from './dto/component.dto';

@Injectable()
export class ComponentService {
  constructor(private prisma: PrismaService) {}

  async create(createComponentDto: CreateComponentDto) {
    const { code, sortOrder, isActive, ...rest } = createComponentDto;

    // Check if code already exists
    const existing = await this.prisma.component.findUnique({
      where: { code },
    });

    if (existing) {
      throw new ConflictException('Component code already exists');
    }

    return this.prisma.component.create({
      data: {
        code,
        sortOrder: sortOrder ?? 0,  // 默认值为0
        isActive: isActive ?? true,  // 默认值为true
        ...rest,
      },
    });
  }

  async findAll(query?: { search?: string; page?: number; limit?: number; isActive?: boolean }) {
    const { search, page = 1, limit = 100, isActive } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { nameZh: { contains: search } },
        { nameEn: { contains: search } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [components, total] = await Promise.all([
      this.prisma.component.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.component.count({ where }),
    ]);

    return {
      data: components,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const component = await this.prisma.component.findUnique({
      where: { id },
    });

    if (!component) {
      throw new NotFoundException(`Component with ID ${id} not found`);
    }

    return component;
  }

  async findByCode(code: string) {
    const component = await this.prisma.component.findUnique({
      where: { code },
    });

    if (!component) {
      throw new NotFoundException(`Component with code ${code} not found`);
    }

    return component;
  }

  async update(id: string, updateComponentDto: UpdateComponentDto) {
    await this.findOne(id);

    // If updating code, check if new code already exists
    if (updateComponentDto.code) {
      const existing = await this.prisma.component.findUnique({
        where: { code: updateComponentDto.code },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Component code already exists');
      }
    }

    return this.prisma.component.update({
      where: { id },
      data: updateComponentDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.component.delete({
      where: { id },
    });
  }
}

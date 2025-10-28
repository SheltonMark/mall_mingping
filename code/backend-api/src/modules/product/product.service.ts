import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { FileUploadService } from '../../common/services/file-upload.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
  CreateProductSkuDto,
  UpdateProductSkuDto,
} from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private excelService: ExcelService,
    private fileUploadService: FileUploadService,
  ) {}

  // ============ Category Methods ============
  async createCategory(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: dto,
    });
  }

  async findAllCategories(activeOnly = false) {
    return this.prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: {
            productGroups: true,
          },
        },
      },
    });
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        productGroups: {
          take: 10,
          include: {
            _count: {
              select: { skus: true },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async removeCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productGroups: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category._count.productGroups > 0) {
      throw new BadRequestException(
        'Cannot delete category with associated products',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  // ============ Material Methods ============
  async createMaterial(dto: CreateMaterialDto) {
    return this.prisma.material.create({
      data: dto,
    });
  }

  async findAllMaterials(activeOnly = false) {
    return this.prisma.material.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: {
        _count: {
          select: {
            productGroups: true,
          },
        },
      },
    });
  }

  async findOneMaterial(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        productGroups: {
          take: 10,
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return material;
  }

  async updateMaterial(id: string, dto: UpdateMaterialDto) {
    const material = await this.prisma.material.findUnique({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    return this.prisma.material.update({
      where: { id },
      data: dto,
    });
  }

  async removeMaterial(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        _count: {
          select: { productGroups: true },
        },
      },
    });

    if (!material) {
      throw new NotFoundException('Material not found');
    }

    if (material._count.productGroups > 0) {
      throw new BadRequestException(
        'Cannot delete material with associated products',
      );
    }

    return this.prisma.material.delete({
      where: { id },
    });
  }

  // ============ Product Group Methods ============
  async createProductGroup(dto: CreateProductGroupDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    if (dto.materialId) {
      const material = await this.prisma.material.findUnique({
        where: { id: dto.materialId },
      });
      if (!material) {
        throw new BadRequestException('Material not found');
      }
    }

    return this.prisma.productGroup.create({
      data: dto,
      include: {
        category: true,
        material: true,
      },
    });
  }

  async findAllProductGroups(query?: {
    search?: string;
    categoryId?: string;
    materialId?: string;
    isPublished?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      categoryId,
      materialId,
      isPublished,
      page = 1,
      limit = 10,
    } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { groupNameZh: { contains: search } },
        { groupNameEn: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (materialId) {
      where.materialId = materialId;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [groups, total] = await Promise.all([
      this.prisma.productGroup.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          material: true,
          _count: {
            select: { skus: true },
          },
        },
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.productGroup.count({ where }),
    ]);

    return {
      data: groups,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneProductGroup(id: string) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id },
      include: {
        category: true,
        material: true,
        skus: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Product group not found');
    }

    return group;
  }

  async updateProductGroup(id: string, dto: UpdateProductGroupDto) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException('Product group not found');
    }

    return this.prisma.productGroup.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        material: true,
      },
    });
  }

  async removeProductGroup(id: string) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id },
      include: {
        _count: {
          select: { skus: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Product group not found');
    }

    if (group._count.skus > 0) {
      throw new BadRequestException(
        'Cannot delete product group with existing SKUs',
      );
    }

    return this.prisma.productGroup.delete({
      where: { id },
    });
  }

  // ============ Product SKU Methods ============
  async createProductSku(dto: CreateProductSkuDto) {
    const group = await this.prisma.productGroup.findUnique({
      where: { id: dto.groupId },
    });

    if (!group) {
      throw new BadRequestException('Product group not found');
    }

    // Check if product code already exists
    const existing = await this.prisma.productSku.findUnique({
      where: { productCode: dto.productCode },
    });

    if (existing) {
      throw new ConflictException('Product code already exists');
    }

    return this.prisma.productSku.create({
      data: dto,
      include: {
        group: {
          include: {
            category: true,
            material: true,
          },
        },
      },
    });
  }

  async findAllProductSkus(query?: {
    search?: string;
    groupId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, groupId, status, page = 1, limit = 20 } = query || {};
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.productCode = { contains: search };
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (status) {
      where.status = status;
    }

    const [skus, total] = await Promise.all([
      this.prisma.productSku.findMany({
        where,
        skip,
        take: limit,
        include: {
          group: {
            include: {
              category: true,
              material: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productSku.count({ where }),
    ]);

    return {
      data: skus,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneProductSku(id: string) {
    const sku = await this.prisma.productSku.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            category: true,
            material: true,
          },
        },
      },
    });

    if (!sku) {
      throw new NotFoundException('Product SKU not found');
    }

    return sku;
  }

  async updateProductSku(id: string, dto: UpdateProductSkuDto) {
    const sku = await this.prisma.productSku.findUnique({
      where: { id },
    });

    if (!sku) {
      throw new NotFoundException('Product SKU not found');
    }

    // Check product code uniqueness if updating
    if (dto.productCode) {
      const existing = await this.prisma.productSku.findFirst({
        where: {
          productCode: dto.productCode,
          id: { not: id },
        },
      });
      if (existing) {
        throw new ConflictException('Product code already exists');
      }
    }

    return this.prisma.productSku.update({
      where: { id },
      data: dto,
      include: {
        group: {
          include: {
            category: true,
            material: true,
          },
        },
      },
    });
  }

  async removeProductSku(id: string) {
    const sku = await this.prisma.productSku.findUnique({
      where: { id },
    });

    if (!sku) {
      throw new NotFoundException('Product SKU not found');
    }

    return this.prisma.productSku.delete({
      where: { id },
    });
  }

  // Batch import SKUs
  async batchImportSkus(skus: CreateProductSkuDto[]) {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
    };

    for (const sku of skus) {
      try {
        await this.createProductSku(sku);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          productCode: sku.productCode,
          error: error.message,
        });
      }
    }

    return results;
  }

  // ============ Excel Import/Export Methods ============
  async importSkusFromExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.fileUploadService.validateFile(file, ['.xlsx', '.xls'], 10485760); // 10MB

    // Parse Excel file
    const data = await this.excelService.parseExcelFile(file.buffer);

    // Validate data structure
    const requiredFields = ['groupId', 'productCode', 'price'];
    const validation = this.excelService.validateExcelData(
      data,
      requiredFields,
    );

    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Transform and import data
    const skus: CreateProductSkuDto[] = data.map((row) => ({
      groupId: row.groupId || row['商品组ID'] || row['Group ID'],
      productCode: row.productCode || row['品号'] || row['Product Code'],
      price:
        parseFloat(row.price || row['价格'] || row['Price']) || 0,
      stock: parseInt(row.stock || row['库存'] || row['Stock']) || 0,
      colorCombination: row.colorCombination || row['颜色组合']
        ? JSON.parse(row.colorCombination || row['颜色组合'])
        : null,
      mainImage: row.mainImage || row['主图'] || row['Main Image'],
      status: (row.status || row['状态'] || row['Status'] || 'ACTIVE') as
        | 'ACTIVE'
        | 'INACTIVE',
    }));

    // Batch import
    return await this.batchImportSkus(skus);
  }

  async generateExcelTemplate(res: Response) {
    const columns = [
      {
        header: '商品组ID (Group ID)',
        key: 'groupId',
        width: 40,
        example: 'uuid-of-product-group',
      },
      {
        header: '品号 (Product Code)',
        key: 'productCode',
        width: 20,
        example: 'PC-001',
      },
      { header: '价格 (Price)', key: 'price', width: 15, example: '12.50' },
      { header: '库存 (Stock)', key: 'stock', width: 15, example: '1000' },
      {
        header: '颜色组合 (JSON)',
        key: 'colorCombination',
        width: 30,
        example: '{"main":"red","accent":"blue"}',
      },
      {
        header: '主图 (Image URL)',
        key: 'mainImage',
        width: 40,
        example: 'https://example.com/image.jpg',
      },
      {
        header: '状态 (Status)',
        key: 'status',
        width: 15,
        example: 'ACTIVE',
      },
    ];

    const buffer = await this.excelService.createTemplateFile(
      columns,
      'Product_SKU_Import_Template.xlsx',
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Product_SKU_Import_Template.xlsx"',
    );
    res.send(buffer);
  }

  async exportSkusToExcel(groupId: string, res: Response) {
    const where = groupId ? { groupId } : {};

    const skus = await this.prisma.productSku.findMany({
      where,
      include: {
        group: {
          include: {
            category: true,
            material: true,
          },
        },
      },
    });

    const data = skus.map((sku) => ({
      productCode: sku.productCode,
      groupName: sku.group.groupNameZh,
      category: sku.group.category?.nameZh || '-',
      material: sku.group.material?.nameZh || '-',
      price: sku.price.toNumber(),
      stock: sku.stock,
      status: sku.status,
      createdAt: sku.createdAt.toISOString().split('T')[0],
    }));

    const columns = [
      { header: '品号', key: 'productCode', width: 20 },
      { header: '商品组', key: 'groupName', width: 25 },
      { header: '分类', key: 'category', width: 20 },
      { header: '材料', key: 'material', width: 20 },
      { header: '价格', key: 'price', width: 15 },
      { header: '库存', key: 'stock', width: 15 },
      { header: '状态', key: 'status', width: 15 },
      { header: '创建日期', key: 'createdAt', width: 15 },
    ];

    await this.excelService.streamExcelToResponse(
      res,
      data,
      columns,
      `Product_SKUs_${Date.now()}.xlsx`,
      '品号列表',
    );
  }
}

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
  CreateProductGroupDto,
  UpdateProductGroupDto,
  CreateProductSkuDto,
  UpdateProductSkuDto,
} from './dto/product.dto';
import {
  parseProductSpec,
  parseColorAttributes,
  validateComponentCodes,
} from '../../common/utils/product-parser';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private excelService: ExcelService,
    private fileUploadService: FileUploadService,
  ) {}

  // Helper method to enrich productSpec with bilingual component names
  private async enrichProductSpecWithComponents(productSpec: any): Promise<any> {
    if (!productSpec || !Array.isArray(productSpec) || productSpec.length === 0) {
      return productSpec;
    }

    // Get all component codes from productSpec
    const componentCodes = productSpec.map((spec: any) => spec.code).filter(Boolean);

    if (componentCodes.length === 0) {
      return productSpec;
    }

    // Fetch all components from database
    const components = await this.prisma.component.findMany({
      where: {
        code: { in: componentCodes },
        isActive: true,
      },
    });

    // Create a map for quick lookup
    const componentMap = new Map(
      components.map((c) => [c.code, { nameZh: c.nameZh, nameEn: c.nameEn, description: c.description }])
    );

    // Enrich productSpec with bilingual names and description from Component table
    return productSpec.map((spec: any) => {
      const component = componentMap.get(spec.code);
      return {
        ...spec,
        name: component?.nameZh || spec.name || spec.code,
        nameEn: component?.nameEn || spec.name || spec.code,
        // Sync spec from Component description if exists, otherwise keep original
        spec: component?.description || spec.spec || '',
      };
    });
  }

  /**
   * Enrich additionalAttributes with part translations from component configuration
   */
  private async enrichAdditionalAttributesWithParts(
    additionalAttributes: any,
    productSpec: any
  ): Promise<any> {
    console.log('🔍 [Enrich Parts] Called');

    if (!additionalAttributes || !Array.isArray(additionalAttributes) || additionalAttributes.length === 0) {
      console.log('⚠️  [Enrich Parts] Skipped: No additionalAttributes');
      return additionalAttributes;
    }

    if (!productSpec || !Array.isArray(productSpec) || productSpec.length === 0) {
      console.log('⚠️  [Enrich Parts] Skipped: No productSpec');
      return additionalAttributes;
    }

    // Get all component codes
    const componentCodes = productSpec.map((spec: any) => spec.code).filter(Boolean);
    if (componentCodes.length === 0) {
      return additionalAttributes;
    }

    // Fetch components with parts
    const components = await this.prisma.component.findMany({
      where: {
        code: { in: componentCodes },
        isActive: true,
      },
    });

    // Create a map: componentCode -> { parts: Map<partNameZh, partNameEn> }
    const componentPartsMap = new Map<string, Map<string, string>>();

    components.forEach((component) => {
      if (component.parts && Array.isArray(component.parts)) {
        const partsMap = new Map<string, string>();
        (component.parts as any[]).forEach((part) => {
          if (part.nameZh && part.nameEn) {
            partsMap.set(part.nameZh, part.nameEn);
          }
        });
        componentPartsMap.set(component.code, partsMap);
      }
    });

    // Enrich additionalAttributes with part translations
    return additionalAttributes.map((attr: any) => {
      const componentCode = attr.componentCode;
      if (!componentCode) return attr;

      const partsMap = componentPartsMap.get(componentCode);
      if (!partsMap) return attr;

      // Enrich colorSchemes
      if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
        const enrichedSchemes = attr.colorSchemes.map((scheme: any) => {
          if (scheme.colors && Array.isArray(scheme.colors)) {
            const enrichedColors = scheme.colors.map((colorPart: any) => {
              if (colorPart.part) {
                const partEn = partsMap.get(colorPart.part);
                // 合并成"中文/English"格式，如果part已经包含/，则不处理
                const bilingualPart = colorPart.part.includes('/')
                  ? colorPart.part
                  : `${colorPart.part}/${partEn || colorPart.part}`;

                return {
                  ...colorPart,
                  part: bilingualPart, // 更新part为双语格式
                  partEn: partEn || colorPart.part, // 保留partEn字段以便需要时使用
                };
              }
              return colorPart;
            });

            return {
              ...scheme,
              colors: enrichedColors,
            };
          }
          return scheme;
        });

        return {
          ...attr,
          colorSchemes: enrichedSchemes,
        };
      }

      return attr;
    });
  }

  // ============ Category Methods ============
  async createCategory(dto: CreateCategoryDto) {
    // Check if code already exists
    const existing = await this.prisma.category.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException('Category code already exists');
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

    return this.prisma.productGroup.create({
      data: dto,
      include: {
        category: true,
      },
    });
  }

  /**
   * Get allowed visibility levels for a customer tier
   */
  private getAllowedVisibilityLevels(customerTier?: string): string[] {
    if (!customerTier) {
      // Not logged in: only see 'ALL' visibility products
      return ['ALL'];
    }

    switch (customerTier) {
      case 'SVIP':
        // SVIP sees all products
        return ['ALL', 'STANDARD', 'VIP', 'SVIP'];
      case 'VIP':
        // VIP sees VIP + STANDARD + ALL
        return ['ALL', 'STANDARD', 'VIP'];
      case 'STANDARD':
        // STANDARD sees STANDARD + ALL
        return ['ALL', 'STANDARD'];
      default:
        // Unknown tier: only see 'ALL'
        return ['ALL'];
    }
  }

  async findAllProductGroups(query?: {
    search?: string;
    categoryId?: string;
    isPublished?: boolean;
    customerTier?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      search,
      categoryId,
      isPublished,
      customerTier,
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

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    // Apply visibility filter ONLY if customerTier is provided (for customer access)
    // When customerTier is undefined (admin access), show all products
    if (customerTier !== undefined) {
      const allowedLevels = this.getAllowedVisibilityLevels(customerTier);
      where.visibilityTier = { in: allowedLevels };
    }

    const [groups, total] = await Promise.all([
      this.prisma.productGroup.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          skus: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              productCode: true,
              productName: true,
              title: true,
              subtitle: true,
              price: true,
              images: true,
              brand: true,
              specification: true,
              productSpec: true,
              additionalAttributes: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.productGroup.count({ where }),
    ]);

    // Enrich productSpec and additionalAttributes for each group's SKUs
    for (const group of groups) {
      if (group.skus && group.skus.length > 0) {
        for (const sku of group.skus) {
          if (sku.productSpec) {
            sku.productSpec = await this.enrichProductSpecWithComponents(sku.productSpec);
          }
          if (sku.additionalAttributes && sku.productSpec) {
            sku.additionalAttributes = await this.enrichAdditionalAttributesWithParts(
              sku.additionalAttributes,
              sku.productSpec
            );
          }
        }
      }
    }

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
        skus: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Product group not found');
    }

    // Enrich productSpec for each SKU with bilingual component names
    if (group.skus && group.skus.length > 0) {
      for (const sku of group.skus) {
        if (sku.productSpec) {
          sku.productSpec = await this.enrichProductSpecWithComponents(sku.productSpec);
        }
        if (sku.additionalAttributes && sku.productSpec) {
          sku.additionalAttributes = await this.enrichAdditionalAttributesWithParts(
            sku.additionalAttributes,
            sku.productSpec
          );
        }
      }
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

    // 先删除该产品组下的所有SKU，再删除产品组
    console.log(`🗑️ [Delete Group] Deleting group ${id} with ${group._count.skus} SKUs`);

    // 删除所有关联的SKU
    if (group._count.skus > 0) {
      await this.prisma.productSku.deleteMany({
        where: { groupId: id },
      });
      console.log(`✅ [Delete Group] Deleted ${group._count.skus} SKUs`);
    }

    // 删除产品组
    const result = await this.prisma.productGroup.delete({
      where: { id },
    });

    console.log(`✅ [Delete Group] Deleted group ${id}`);
    return result;
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
          },
        },
      },
    });

    if (!sku) {
      throw new NotFoundException('Product SKU not found');
    }

    // Enrich productSpec with bilingual component names
    if (sku.productSpec) {
      sku.productSpec = await this.enrichProductSpecWithComponents(sku.productSpec);
    }

    // Enrich additionalAttributes with part translations
    if (sku.additionalAttributes && sku.productSpec) {
      sku.additionalAttributes = await this.enrichAdditionalAttributesWithParts(
        sku.additionalAttributes,
        sku.productSpec
      );
    }

    return sku;
  }

  async updateProductSku(id: string, dto: UpdateProductSkuDto) {
    console.log('📝 [Update SKU] ID:', id);
    console.log('📝 [Update SKU] DTO:', JSON.stringify(dto, null, 2));

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

    const result = await this.prisma.productSku.update({
      where: { id },
      data: dto,
      include: {
        group: {
          include: {
            category: true,
          },
        },
      },
    });

    console.log('✅ [Update SKU] 更新成功');
    console.log('✅ [Update SKU] images 类型:', typeof result.images);
    console.log('✅ [Update SKU] images 值:', JSON.stringify(result.images));
    console.log('✅ [Update SKU] video 类型:', typeof result.video);
    console.log('✅ [Update SKU] video 值:', JSON.stringify(result.video));

    return result;
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

  /**
   * 从品名中提取前缀 (使用 - 分隔符)
   * 例如: "MP007-清洁四件套" → "MP007"
   * 例如: "TB001-拖把" → "TB001"
   * 例如: "S002-刷子" → "S002"
   */
  private extractPrefix(productName: string): string | null {
    // 使用 - 分隔符提取前缀
    if (!productName || typeof productName !== 'string') {
      return null;
    }
    const parts = productName.split('-');
    return parts.length > 0 && parts[0].trim() ? parts[0].trim() : null;
  }

  /**
   * 从前缀中提取分类代码
   * 例如: "MP007" → "MP"
   * 例如: "TB001" → "TB"
   */
  private extractCategoryCode(prefix: string): string {
    // 提取字母部分作为分类代码
    const match = prefix.match(/^([A-Z]+)/);
    return match ? match[1] : prefix;
  }

  /**
   * 自动创建或获取分类
   * 如果分类不存在,则自动创建
   */
  private async ensureCategory(categoryCode: string): Promise<string> {
    // 先查找是否存在
    let category = await this.prisma.category.findUnique({
      where: { code: categoryCode },
    });

    // 如果不存在,自动创建
    if (!category) {
      category = await this.prisma.category.create({
        data: {
          code: categoryCode,
          nameZh: `${categoryCode}类`,
          nameEn: `${categoryCode} Category`,
          isAutoCreated: true,
          isActive: true,
          sortOrder: 999, // 自动创建的分类排在最后
        },
      });
      console.log(`✓ Auto-created category: ${categoryCode} - ${category.nameZh}`);
    }

    return category.id;
  }

  /**
   * 自动创建或获取产品组
   * 根据品号前缀自动分组
   */
  private async ensureProductGroup(
    prefix: string,
    categoryId: string,
    categoryCode: string,
  ): Promise<string> {
    // 先查找是否存在
    let group = await this.prisma.productGroup.findUnique({
      where: { prefix },
    });

    // 如果不存在,自动创建
    if (!group) {
      group = await this.prisma.productGroup.create({
        data: {
          prefix,
          groupNameZh: `${prefix}系列`,
          groupNameEn: `${prefix} Series`,
          categoryId,
          categoryCode,
          isPublished: false,
          status: 'inactive',
          videoMode: 'shared',
        },
      });
      console.log(`✓ Auto-created product group: ${prefix} - ${group.groupNameZh}`);
    }

    return group.id;
  }

  async importSkusFromExcel(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file
    this.fileUploadService.validateFile(file, ['.xlsx', '.xls'], 10485760); // 10MB

    // Parse Excel file
    const data = await this.excelService.parseExcelFile(file.buffer);
    console.log(`📋 [Service] Excel parsed. Rows: ${data.length}`);
    if (data.length > 0) {
      console.log('📝 [Service] First row keys:', Object.keys(data[0]).join(', '));
    }

    // 验证数据：检查每行是否有品号和品名（支持中英文字段名）
    const validationErrors: string[] = [];
    data.forEach((row, index) => {
      const productCode = row.productCode || row['品号'] || row['Product Code'];
      const productName = row.productName || row['品名'] || row['Product Name'];

      if (!productCode || productCode.toString().trim() === '') {
        validationErrors.push(`第${index + 2}行: 缺少品号`);
      }
      if (!productName || productName.toString().trim() === '') {
        validationErrors.push(`第${index + 2}行: 缺少品名`);
      }
    });

    if (validationErrors.length > 0) {
      console.error(`❌ [Service] Validation failed:`, validationErrors);
      return {
        success: false,
        errors: validationErrors.map(err => ({ error: err })),
      };
    }

    console.log(`✅ [Service] Validation passed`);

    // Transform and import data with auto-grouping (2025-10-31 updated)
    const results = {
      success: 0,
      failed: 0,
      errors: [] as any[],
      autoCreated: {
        categories: [] as string[],
        productGroups: [] as string[],
      },
    };

    for (const row of data) {
      try {
        const productCode = row.productCode || row['品号'] || row['Product Code'];
        const productName = row.productName || row['品名'] || row['Product Name'];

        // 从品名中提取前缀 (如: "MP007-清洁四件套" → "MP007")
        const prefix = this.extractPrefix(productName);
        if (!prefix) {
          throw new Error(`无法从品名中提取前缀: ${productName}`);
        }

        // 提取分类代码 (如: MP007 → MP)
        const categoryCode = this.extractCategoryCode(prefix);

        // 自动创建或获取分类
        const categoryId = await this.ensureCategory(categoryCode);
        if (results.autoCreated.categories.indexOf(categoryCode) === -1) {
          results.autoCreated.categories.push(categoryCode);
        }

        // 自动创建或获取产品组
        const groupId = await this.ensureProductGroup(prefix, categoryId, categoryCode);
        if (results.autoCreated.productGroups.indexOf(prefix) === -1) {
          results.autoCreated.productGroups.push(prefix);
        }

        // 获取货品规格和附加属性原始文本
        const rawSpec = row.specification || row['货品规格'] || row['Specification'];
        const rawAttrs = row.additionalAttributes || row['附加属性（颜色）'] || row['附加属性'];

        // 解析货品规格和附加属性
        const parsedSpec = parseProductSpec(rawSpec);
        const parsedColors = parseColorAttributes(rawAttrs);

        // 验证颜色属性的部件编号是否存在于规格中
        if (parsedSpec.length > 0 && parsedColors.length > 0) {
          const invalidCodes = validateComponentCodes(parsedSpec, parsedColors);
          if (invalidCodes.length > 0) {
            throw new Error(
              `颜色属性中的部件编号 [${invalidCodes.join(', ')}] 在货品规格中不存在`
            );
          }
        }

        // 构建SKU数据
        const skuData: CreateProductSkuDto = {
          groupId,
          productCode,
          productName,
          brand: row.brand || row['商标'] || row['Brand'],
          specification: rawSpec, // 保存原始文本
          productSpec: parsedSpec.length > 0 ? parsedSpec : null, // 保存解析后的JSON
          additionalAttributes: parsedColors.length > 0 ? parsedColors : null, // 保存解析后的JSON
          price: row.price || row['价格'] || row['Price']
            ? parseFloat(row.price || row['价格'] || row['Price'])
            : undefined,
          images: row.images || row['图片集']
            ? typeof (row.images || row['图片集']) === 'string'
              ? JSON.parse(row.images || row['图片集'])
              : row.images || row['图片集']
            : null,
          video: row.video || row['视频']
            ? typeof (row.video || row['视频']) === 'string'
              ? JSON.parse(row.video || row['视频'])
              : row.video || row['视频']
            : null,
          useSharedVideo: row.useSharedVideo !== undefined
            ? row.useSharedVideo
            : true,
          status: (row.status || row['状态'] || row['Status'] || 'INACTIVE') as
            | 'ACTIVE'
            | 'INACTIVE',
        };

        // 创建SKU
        await this.createProductSku(skuData);
        results.success++;
      } catch (error) {
        results.failed++;
        const errorDetail = {
          productCode: row.productCode || row['品号'],
          productName: row.productName || row['品名'],
          error: error.message,
        };
        results.errors.push(errorDetail);
        console.error(`❌ [Import Error] ${errorDetail.productCode} - ${errorDetail.productName}: ${errorDetail.error}`);
      }
    }

    console.log(`\n📊 [Import Summary]`);
    console.log(`✅ Success: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📁 Auto-created categories: ${results.autoCreated.categories.join(', ') || 'none'}`);
    console.log(`📦 Auto-created groups: ${results.autoCreated.productGroups.join(', ') || 'none'}`);

    return results;
  }

  async generateExcelTemplate(res: Response) {
    // 直接返回预制的模板文件
    const fs = require('fs');
    const path = require('path');

    const templatePath = path.join(__dirname, '..', '..', '..', '产品导入模板_最终版.xlsx');

    if (!fs.existsSync(templatePath)) {
      throw new NotFoundException('Template file not found');
    }

    const buffer = fs.readFileSync(templatePath);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="产品导入模板_最终版.xlsx"',
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
          },
        },
      },
    });

    const data = skus.map((sku) => ({
      productCode: sku.productCode,
      productName: sku.productName,
      groupName: sku.group.groupNameZh,
      category: sku.group.category?.nameZh || '-',
      price: sku.price?.toNumber() || 0,
      status: sku.status,
      createdAt: sku.createdAt.toISOString().split('T')[0],
    }));

    const columns = [
      { header: '品号', key: 'productCode', width: 20 },
      { header: '品名', key: 'productName', width: 30 },
      { header: '商品组', key: 'groupName', width: 25 },
      { header: '分类', key: 'category', width: 20 },
      { header: '价格', key: 'price', width: 15 },
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

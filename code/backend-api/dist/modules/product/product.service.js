"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const excel_service_1 = require("../../common/services/excel.service");
const file_upload_service_1 = require("../../common/services/file-upload.service");
const product_parser_1 = require("../../common/utils/product-parser");
let ProductService = class ProductService {
    prisma;
    excelService;
    fileUploadService;
    constructor(prisma, excelService, fileUploadService) {
        this.prisma = prisma;
        this.excelService = excelService;
        this.fileUploadService = fileUploadService;
    }
    async createCategory(dto) {
        const existing = await this.prisma.category.findUnique({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Category code already exists');
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
    async findOneCategory(id) {
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
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async updateCategory(id, dto) {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return this.prisma.category.update({
            where: { id },
            data: dto,
        });
    }
    async removeCategory(id) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { productGroups: true },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category._count.productGroups > 0) {
            throw new common_1.BadRequestException('Cannot delete category with associated products');
        }
        return this.prisma.category.delete({
            where: { id },
        });
    }
    async createProductGroup(dto) {
        if (dto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.BadRequestException('Category not found');
            }
        }
        return this.prisma.productGroup.create({
            data: dto,
            include: {
                category: true,
            },
        });
    }
    async findAllProductGroups(query) {
        const { search, categoryId, isPublished, page = 1, limit = 10, } = query || {};
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOneProductGroup(id) {
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
            throw new common_1.NotFoundException('Product group not found');
        }
        return group;
    }
    async updateProductGroup(id, dto) {
        const group = await this.prisma.productGroup.findUnique({
            where: { id },
        });
        if (!group) {
            throw new common_1.NotFoundException('Product group not found');
        }
        return this.prisma.productGroup.update({
            where: { id },
            data: dto,
            include: {
                category: true,
            },
        });
    }
    async removeProductGroup(id) {
        const group = await this.prisma.productGroup.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { skus: true },
                },
            },
        });
        if (!group) {
            throw new common_1.NotFoundException('Product group not found');
        }
        if (group._count.skus > 0) {
            throw new common_1.BadRequestException('Cannot delete product group with existing SKUs');
        }
        return this.prisma.productGroup.delete({
            where: { id },
        });
    }
    async createProductSku(dto) {
        const group = await this.prisma.productGroup.findUnique({
            where: { id: dto.groupId },
        });
        if (!group) {
            throw new common_1.BadRequestException('Product group not found');
        }
        const existing = await this.prisma.productSku.findUnique({
            where: { productCode: dto.productCode },
        });
        if (existing) {
            throw new common_1.ConflictException('Product code already exists');
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
    async findAllProductSkus(query) {
        const { search, groupId, status, page = 1, limit = 20 } = query || {};
        const skip = (page - 1) * limit;
        const where = {};
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
    async findOneProductSku(id) {
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
            throw new common_1.NotFoundException('Product SKU not found');
        }
        return sku;
    }
    async updateProductSku(id, dto) {
        console.log('📝 [Update SKU] ID:', id);
        console.log('📝 [Update SKU] DTO:', JSON.stringify(dto, null, 2));
        const sku = await this.prisma.productSku.findUnique({
            where: { id },
        });
        if (!sku) {
            throw new common_1.NotFoundException('Product SKU not found');
        }
        if (dto.productCode) {
            const existing = await this.prisma.productSku.findFirst({
                where: {
                    productCode: dto.productCode,
                    id: { not: id },
                },
            });
            if (existing) {
                throw new common_1.ConflictException('Product code already exists');
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
    async removeProductSku(id) {
        const sku = await this.prisma.productSku.findUnique({
            where: { id },
        });
        if (!sku) {
            throw new common_1.NotFoundException('Product SKU not found');
        }
        return this.prisma.productSku.delete({
            where: { id },
        });
    }
    async batchImportSkus(skus) {
        const results = {
            success: 0,
            failed: 0,
            errors: [],
        };
        for (const sku of skus) {
            try {
                await this.createProductSku(sku);
                results.success++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    productCode: sku.productCode,
                    error: error.message,
                });
            }
        }
        return results;
    }
    extractPrefix(productName) {
        if (!productName || typeof productName !== 'string') {
            return null;
        }
        const parts = productName.split('-');
        return parts.length > 0 && parts[0].trim() ? parts[0].trim() : null;
    }
    extractCategoryCode(prefix) {
        const match = prefix.match(/^([A-Z]+)/);
        return match ? match[1] : prefix;
    }
    async ensureCategory(categoryCode) {
        let category = await this.prisma.category.findUnique({
            where: { code: categoryCode },
        });
        if (!category) {
            category = await this.prisma.category.create({
                data: {
                    code: categoryCode,
                    nameZh: `${categoryCode}类`,
                    nameEn: `${categoryCode} Category`,
                    isAutoCreated: true,
                    isActive: true,
                    sortOrder: 999,
                },
            });
            console.log(`✓ Auto-created category: ${categoryCode} - ${category.nameZh}`);
        }
        return category.id;
    }
    async ensureProductGroup(prefix, categoryId, categoryCode) {
        let group = await this.prisma.productGroup.findUnique({
            where: { prefix },
        });
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
    async importSkusFromExcel(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        this.fileUploadService.validateFile(file, ['.xlsx', '.xls'], 10485760);
        const data = await this.excelService.parseExcelFile(file.buffer);
        console.log(`📋 [Service] Excel parsed. Rows: ${data.length}`);
        if (data.length > 0) {
            console.log('📝 [Service] First row keys:', Object.keys(data[0]).join(', '));
        }
        const validationErrors = [];
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
        const results = {
            success: 0,
            failed: 0,
            errors: [],
            autoCreated: {
                categories: [],
                productGroups: [],
            },
        };
        for (const row of data) {
            try {
                const productCode = row.productCode || row['品号'] || row['Product Code'];
                const productName = row.productName || row['品名'] || row['Product Name'];
                const prefix = this.extractPrefix(productName);
                if (!prefix) {
                    throw new Error(`无法从品名中提取前缀: ${productName}`);
                }
                const categoryCode = this.extractCategoryCode(prefix);
                const categoryId = await this.ensureCategory(categoryCode);
                if (results.autoCreated.categories.indexOf(categoryCode) === -1) {
                    results.autoCreated.categories.push(categoryCode);
                }
                const groupId = await this.ensureProductGroup(prefix, categoryId, categoryCode);
                if (results.autoCreated.productGroups.indexOf(prefix) === -1) {
                    results.autoCreated.productGroups.push(prefix);
                }
                const rawSpec = row.specification || row['货品规格'] || row['Specification'];
                const rawAttrs = row.additionalAttributes || row['附加属性（颜色）'] || row['附加属性'];
                const parsedSpec = (0, product_parser_1.parseProductSpec)(rawSpec);
                const parsedColors = (0, product_parser_1.parseColorAttributes)(rawAttrs);
                if (parsedSpec.length > 0 && parsedColors.length > 0) {
                    const invalidCodes = (0, product_parser_1.validateComponentCodes)(parsedSpec, parsedColors);
                    if (invalidCodes.length > 0) {
                        throw new Error(`颜色属性中的部件编号 [${invalidCodes.join(', ')}] 在货品规格中不存在`);
                    }
                }
                const skuData = {
                    groupId,
                    productCode,
                    productName,
                    brand: row.brand || row['商标'] || row['Brand'],
                    specification: rawSpec,
                    productSpec: parsedSpec.length > 0 ? parsedSpec : null,
                    additionalAttributes: parsedColors.length > 0 ? parsedColors : null,
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
                    status: (row.status || row['状态'] || row['Status'] || 'INACTIVE'),
                };
                await this.createProductSku(skuData);
                results.success++;
            }
            catch (error) {
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
    async generateExcelTemplate(res) {
        const fs = require('fs');
        const path = require('path');
        const templatePath = path.join(__dirname, '..', '..', '..', '产品导入模板_最终版.xlsx');
        if (!fs.existsSync(templatePath)) {
            throw new common_1.NotFoundException('Template file not found');
        }
        const buffer = fs.readFileSync(templatePath);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="产品导入模板_最终版.xlsx"');
        res.send(buffer);
    }
    async exportSkusToExcel(groupId, res) {
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
        await this.excelService.streamExcelToResponse(res, data, columns, `Product_SKUs_${Date.now()}.xlsx`, '品号列表');
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        excel_service_1.ExcelService,
        file_upload_service_1.FileUploadService])
], ProductService);
//# sourceMappingURL=product.service.js.map
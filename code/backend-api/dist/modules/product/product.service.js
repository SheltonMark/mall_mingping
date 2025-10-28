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
        if (dto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parentId },
            });
            if (!parent) {
                throw new common_1.BadRequestException('Parent category not found');
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
    async createMaterial(dto) {
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
    async findOneMaterial(id) {
        const material = await this.prisma.material.findUnique({
            where: { id },
            include: {
                productGroups: {
                    take: 10,
                },
            },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        return material;
    }
    async updateMaterial(id, dto) {
        const material = await this.prisma.material.findUnique({
            where: { id },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        return this.prisma.material.update({
            where: { id },
            data: dto,
        });
    }
    async removeMaterial(id) {
        const material = await this.prisma.material.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { productGroups: true },
                },
            },
        });
        if (!material) {
            throw new common_1.NotFoundException('Material not found');
        }
        if (material._count.productGroups > 0) {
            throw new common_1.BadRequestException('Cannot delete material with associated products');
        }
        return this.prisma.material.delete({
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
        if (dto.materialId) {
            const material = await this.prisma.material.findUnique({
                where: { id: dto.materialId },
            });
            if (!material) {
                throw new common_1.BadRequestException('Material not found');
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
    async findAllProductGroups(query) {
        const { search, categoryId, materialId, isPublished, page = 1, limit = 10, } = query || {};
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
    async findOneProductGroup(id) {
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
                material: true,
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
                        material: true,
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
    async findOneProductSku(id) {
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
            throw new common_1.NotFoundException('Product SKU not found');
        }
        return sku;
    }
    async updateProductSku(id, dto) {
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
    async importSkusFromExcel(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        this.fileUploadService.validateFile(file, ['.xlsx', '.xls'], 10485760);
        const data = await this.excelService.parseExcelFile(file.buffer);
        const requiredFields = ['groupId', 'productCode', 'price'];
        const validation = this.excelService.validateExcelData(data, requiredFields);
        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors,
            };
        }
        const skus = data.map((row) => ({
            groupId: row.groupId || row['商品组ID'] || row['Group ID'],
            productCode: row.productCode || row['品号'] || row['Product Code'],
            price: parseFloat(row.price || row['价格'] || row['Price']) || 0,
            stock: parseInt(row.stock || row['库存'] || row['Stock']) || 0,
            colorCombination: row.colorCombination || row['颜色组合']
                ? JSON.parse(row.colorCombination || row['颜色组合'])
                : null,
            mainImage: row.mainImage || row['主图'] || row['Main Image'],
            status: (row.status || row['状态'] || row['Status'] || 'ACTIVE'),
        }));
        return await this.batchImportSkus(skus);
    }
    async generateExcelTemplate(res) {
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
        const buffer = await this.excelService.createTemplateFile(columns, 'Product_SKU_Import_Template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="Product_SKU_Import_Template.xlsx"');
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
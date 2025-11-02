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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const product_service_1 = require("./product.service");
const product_dto_1 = require("./dto/product.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ProductController = class ProductController {
    productService;
    constructor(productService) {
        this.productService = productService;
    }
    findAllCategories(activeOnly) {
        return this.productService.findAllCategories(activeOnly === 'true');
    }
    findOneCategory(id) {
        return this.productService.findOneCategory(id);
    }
    createCategory(dto) {
        return this.productService.createCategory(dto);
    }
    updateCategory(id, dto) {
        return this.productService.updateCategory(id, dto);
    }
    removeCategory(id) {
        return this.productService.removeCategory(id);
    }
    findAllProductGroups(search, categoryId, isPublished, publishedOnly, page, limit) {
        return this.productService.findAllProductGroups({
            search,
            categoryId,
            isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findOneProductGroup(id) {
        return this.productService.findOneProductGroup(id);
    }
    createProductGroup(dto) {
        return this.productService.createProductGroup(dto);
    }
    updateProductGroup(id, dto) {
        return this.productService.updateProductGroup(id, dto);
    }
    removeProductGroup(id) {
        return this.productService.removeProductGroup(id);
    }
    findAllProductSkus(search, groupId, status, page, limit) {
        return this.productService.findAllProductSkus({
            search,
            groupId,
            status,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findOneProductSku(id) {
        return this.productService.findOneProductSku(id);
    }
    createProductSku(dto) {
        return this.productService.createProductSku(dto);
    }
    updateProductSku(id, dto) {
        return this.productService.updateProductSku(id, dto);
    }
    removeProductSku(id) {
        return this.productService.removeProductSku(id);
    }
    batchImportSkus(dto) {
        return this.productService.batchImportSkus(dto.skus);
    }
    async importFromExcel(file) {
        console.log('📥 [Controller] 收到Excel导入请求');
        console.log('📄 [Controller] 文件信息:', file ? {
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype
        } : 'No file');
        const result = await this.productService.importSkusFromExcel(file);
        console.log('✅ [Controller] 导入完成:', {
            success: typeof result.success === 'number' ? result.success : (result.success ? 1 : 0),
            failed: 'failed' in result ? result.failed : 0,
            errorCount: result.errors?.length || 0
        });
        return result;
    }
    async downloadTemplate(res) {
        return this.productService.generateExcelTemplate(res);
    }
    async exportSkusToExcel(groupId, res) {
        return this.productService.exportSkusToExcel(groupId, res);
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)('categories'),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findAllCategories", null);
__decorate([
    (0, common_1.Get)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findOneCategory", null);
__decorate([
    (0, common_1.Post)('categories'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('categories/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('isPublished')),
    __param(3, (0, common_1.Query)('publishedOnly')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findAllProductGroups", null);
__decorate([
    (0, common_1.Get)('groups/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findOneProductGroup", null);
__decorate([
    (0, common_1.Post)('groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductGroupDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createProductGroup", null);
__decorate([
    (0, common_1.Patch)('groups/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductGroupDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateProductGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeProductGroup", null);
__decorate([
    (0, common_1.Get)('skus'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('groupId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findAllProductSkus", null);
__decorate([
    (0, common_1.Get)('skus/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findOneProductSku", null);
__decorate([
    (0, common_1.Post)('skus'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createProductSku", null);
__decorate([
    (0, common_1.Patch)('skus/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateProductSku", null);
__decorate([
    (0, common_1.Delete)('skus/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeProductSku", null);
__decorate([
    (0, common_1.Post)('skus/batch-import'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.BatchImportSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "batchImportSkus", null);
__decorate([
    (0, common_1.Post)('skus/import-excel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "importFromExcel", null);
__decorate([
    (0, common_1.Get)('skus/export-template'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Get)('skus/export'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "exportSkusToExcel", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map
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
    createCategory(dto) {
        return this.productService.createCategory(dto);
    }
    findAllCategories(activeOnly) {
        return this.productService.findAllCategories(activeOnly === 'true');
    }
    findOneCategory(id) {
        return this.productService.findOneCategory(id);
    }
    updateCategory(id, dto) {
        return this.productService.updateCategory(id, dto);
    }
    removeCategory(id) {
        return this.productService.removeCategory(id);
    }
    createMaterial(dto) {
        return this.productService.createMaterial(dto);
    }
    findAllMaterials(activeOnly) {
        return this.productService.findAllMaterials(activeOnly === 'true');
    }
    findOneMaterial(id) {
        return this.productService.findOneMaterial(id);
    }
    updateMaterial(id, dto) {
        return this.productService.updateMaterial(id, dto);
    }
    removeMaterial(id) {
        return this.productService.removeMaterial(id);
    }
    createProductGroup(dto) {
        return this.productService.createProductGroup(dto);
    }
    findAllProductGroups(search, categoryId, materialId, isPublished, page, limit) {
        return this.productService.findAllProductGroups({
            search,
            categoryId,
            materialId,
            isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findOneProductGroup(id) {
        return this.productService.findOneProductGroup(id);
    }
    updateProductGroup(id, dto) {
        return this.productService.updateProductGroup(id, dto);
    }
    removeProductGroup(id) {
        return this.productService.removeProductGroup(id);
    }
    createProductSku(dto) {
        return this.productService.createProductSku(dto);
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
        return this.productService.importSkusFromExcel(file);
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
    (0, common_1.Post)('categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createCategory", null);
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
    (0, common_1.Patch)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Delete)('categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeCategory", null);
__decorate([
    (0, common_1.Post)('materials'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateMaterialDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createMaterial", null);
__decorate([
    (0, common_1.Get)('materials'),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findAllMaterials", null);
__decorate([
    (0, common_1.Get)('materials/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "findOneMaterial", null);
__decorate([
    (0, common_1.Patch)('materials/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateMaterialDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateMaterial", null);
__decorate([
    (0, common_1.Delete)('materials/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeMaterial", null);
__decorate([
    (0, common_1.Post)('groups'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductGroupDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createProductGroup", null);
__decorate([
    (0, common_1.Get)('groups'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('categoryId')),
    __param(2, (0, common_1.Query)('materialId')),
    __param(3, (0, common_1.Query)('isPublished')),
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
    (0, common_1.Patch)('groups/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductGroupDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateProductGroup", null);
__decorate([
    (0, common_1.Delete)('groups/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeProductGroup", null);
__decorate([
    (0, common_1.Post)('skus'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.CreateProductSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "createProductSku", null);
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
    (0, common_1.Patch)('skus/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_dto_1.UpdateProductSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "updateProductSku", null);
__decorate([
    (0, common_1.Delete)('skus/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "removeProductSku", null);
__decorate([
    (0, common_1.Post)('skus/batch-import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_dto_1.BatchImportSkuDto]),
    __metadata("design:returntype", void 0)
], ProductController.prototype, "batchImportSkus", null);
__decorate([
    (0, common_1.Post)('skus/import-excel'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "importFromExcel", null);
__decorate([
    (0, common_1.Get)('skus/export-template'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "downloadTemplate", null);
__decorate([
    (0, common_1.Get)('skus/export'),
    __param(0, (0, common_1.Query)('groupId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "exportSkusToExcel", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('products'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map
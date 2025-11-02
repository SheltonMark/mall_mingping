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
exports.SalespersonController = void 0;
const common_1 = require("@nestjs/common");
const salesperson_service_1 = require("./salesperson.service");
const salesperson_dto_1 = require("./dto/salesperson.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SalespersonController = class SalespersonController {
    salespersonService;
    constructor(salespersonService) {
        this.salespersonService = salespersonService;
    }
    create(createSalespersonDto) {
        return this.salespersonService.create(createSalespersonDto);
    }
    findAll(search, page, limit) {
        return this.salespersonService.findAll({
            search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findOne(id) {
        return this.salespersonService.findOne(id);
    }
    update(id, updateSalespersonDto) {
        return this.salespersonService.update(id, updateSalespersonDto);
    }
    remove(id) {
        return this.salespersonService.remove(id);
    }
};
exports.SalespersonController = SalespersonController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [salesperson_dto_1.CreateSalespersonDto]),
    __metadata("design:returntype", void 0)
], SalespersonController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], SalespersonController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalespersonController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, salesperson_dto_1.UpdateSalespersonDto]),
    __metadata("design:returntype", void 0)
], SalespersonController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalespersonController.prototype, "remove", null);
exports.SalespersonController = SalespersonController = __decorate([
    (0, common_1.Controller)('salespersons'),
    __metadata("design:paramtypes", [salesperson_service_1.SalespersonService])
], SalespersonController);
//# sourceMappingURL=salesperson.controller.js.map
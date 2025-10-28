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
exports.PartnershipController = void 0;
const common_1 = require("@nestjs/common");
const partnership_service_1 = require("./partnership.service");
const partnership_dto_1 = require("./dto/partnership.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let PartnershipController = class PartnershipController {
    partnershipService;
    constructor(partnershipService) {
        this.partnershipService = partnershipService;
    }
    create(createPartnershipDto) {
        return this.partnershipService.create(createPartnershipDto);
    }
    findAll(status, search, page, limit) {
        return this.partnershipService.findAll({
            status,
            search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    getStatistics() {
        return this.partnershipService.getStatistics();
    }
    findOne(id) {
        return this.partnershipService.findOne(id);
    }
    update(id, updatePartnershipDto) {
        return this.partnershipService.update(id, updatePartnershipDto);
    }
    remove(id) {
        return this.partnershipService.remove(id);
    }
};
exports.PartnershipController = PartnershipController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [partnership_dto_1.CreatePartnershipDto]),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, partnership_dto_1.UpdatePartnershipDto]),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PartnershipController.prototype, "remove", null);
exports.PartnershipController = PartnershipController = __decorate([
    (0, common_1.Controller)('partnerships'),
    __metadata("design:paramtypes", [partnership_service_1.PartnershipService])
], PartnershipController);
//# sourceMappingURL=partnership.controller.js.map
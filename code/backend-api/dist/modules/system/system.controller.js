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
exports.SystemController = void 0;
const common_1 = require("@nestjs/common");
const system_service_1 = require("./system.service");
const system_dto_1 = require("./dto/system.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let SystemController = class SystemController {
    systemService;
    constructor(systemService) {
        this.systemService = systemService;
    }
    getConfig(key) {
        return this.systemService.getConfig(key);
    }
    getConfigs(keys) {
        const keyArray = keys ? keys.split(',') : undefined;
        return this.systemService.getConfigs(keyArray);
    }
    updateConfig(dto) {
        return this.systemService.updateConfig(dto);
    }
    deleteConfig(key) {
        return this.systemService.deleteConfig(key);
    }
    getHomepageConfig() {
        return this.systemService.getHomepageConfig();
    }
    updateHomepageConfig(data) {
        return this.systemService.updateHomepageConfig(data);
    }
    getAboutUsConfig() {
        return this.systemService.getAboutUsConfig();
    }
    updateAboutUsConfig(data) {
        return this.systemService.updateAboutUsConfig(data);
    }
    getSiteConfig() {
        return this.systemService.getSiteConfig();
    }
    updateSiteConfig(data) {
        return this.systemService.updateSiteConfig(data);
    }
};
exports.SystemController = SystemController;
__decorate([
    (0, common_1.Get)('config/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Get)('configs'),
    __param(0, (0, common_1.Query)('keys')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "getConfigs", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [system_dto_1.UpdateSystemConfigDto]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('config/:key'),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "deleteConfig", null);
__decorate([
    (0, common_1.Get)('homepage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "getHomepageConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('homepage'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "updateHomepageConfig", null);
__decorate([
    (0, common_1.Get)('about'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "getAboutUsConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('about'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "updateAboutUsConfig", null);
__decorate([
    (0, common_1.Get)('site'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "getSiteConfig", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('site'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SystemController.prototype, "updateSiteConfig", null);
exports.SystemController = SystemController = __decorate([
    (0, common_1.Controller)('system'),
    __metadata("design:paramtypes", [system_service_1.SystemService])
], SystemController);
//# sourceMappingURL=system.controller.js.map
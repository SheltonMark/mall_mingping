"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalespersonModule = void 0;
const common_1 = require("@nestjs/common");
const salesperson_service_1 = require("./salesperson.service");
const salesperson_controller_1 = require("./salesperson.controller");
const prisma_service_1 = require("../../prisma.service");
let SalespersonModule = class SalespersonModule {
};
exports.SalespersonModule = SalespersonModule;
exports.SalespersonModule = SalespersonModule = __decorate([
    (0, common_1.Module)({
        controllers: [salesperson_controller_1.SalespersonController],
        providers: [salesperson_service_1.SalespersonService, prisma_service_1.PrismaService],
        exports: [salesperson_service_1.SalespersonService],
    })
], SalespersonModule);
//# sourceMappingURL=salesperson.module.js.map
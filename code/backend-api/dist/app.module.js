"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma.service");
const auth_module_1 = require("./modules/auth/auth.module");
const salesperson_module_1 = require("./modules/salesperson/salesperson.module");
const customer_module_1 = require("./modules/customer/customer.module");
const order_module_1 = require("./modules/order/order.module");
const product_module_1 = require("./modules/product/product.module");
const upload_module_1 = require("./modules/upload/upload.module");
const system_module_1 = require("./modules/system/system.module");
const partnership_module_1 = require("./modules/partnership/partnership.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            auth_module_1.AuthModule,
            salesperson_module_1.SalespersonModule,
            customer_module_1.CustomerModule,
            order_module_1.OrderModule,
            product_module_1.ProductModule,
            upload_module_1.UploadModule,
            system_module_1.SystemModule,
            partnership_module_1.PartnershipModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
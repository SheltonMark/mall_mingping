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
exports.UpdateOrderParamConfigDto = exports.CreateOrderParamConfigDto = exports.UpdateOrderDto = exports.CreateOrderDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var OrderType;
(function (OrderType) {
    OrderType["FORMAL"] = "FORMAL";
    OrderType["INTENTION"] = "INTENTION";
})(OrderType || (OrderType = {}));
var CustomerType;
(function (CustomerType) {
    CustomerType["NEW"] = "NEW";
    CustomerType["OLD"] = "OLD";
})(CustomerType || (CustomerType = {}));
class OrderItemDto {
    productSkuId;
    quantity;
    price;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], OrderItemDto.prototype, "productSkuId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], OrderItemDto.prototype, "price", void 0);
class CustomParamDto {
    paramKey;
    paramValue;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomParamDto.prototype, "paramKey", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CustomParamDto.prototype, "paramValue", void 0);
class CreateOrderDto {
    orderNumber;
    customerId;
    salespersonId;
    customerType;
    orderType;
    orderDate;
    status;
    items;
    customParams;
}
exports.CreateOrderDto = CreateOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderNumber", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "salespersonId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CustomerType),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(OrderType),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "orderDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CustomParamDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateOrderDto.prototype, "customParams", void 0);
class UpdateOrderDto {
    orderNumber;
    customerId;
    salespersonId;
    customerType;
    orderType;
    orderDate;
    status;
    items;
    customParams;
}
exports.UpdateOrderDto = UpdateOrderDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "orderNumber", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "salespersonId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CustomerType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "customerType", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(OrderType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "orderType", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "orderDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => OrderItemDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CustomParamDto),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateOrderDto.prototype, "customParams", void 0);
class CreateOrderParamConfigDto {
    fieldName;
    fieldNameZh;
    fieldType;
    isRequired;
    defaultValue;
    options;
    displayOrder;
}
exports.CreateOrderParamConfigDto = CreateOrderParamConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderParamConfigDto.prototype, "fieldName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOrderParamConfigDto.prototype, "fieldNameZh", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA']),
    __metadata("design:type", String)
], CreateOrderParamConfigDto.prototype, "fieldType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateOrderParamConfigDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateOrderParamConfigDto.prototype, "defaultValue", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateOrderParamConfigDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateOrderParamConfigDto.prototype, "displayOrder", void 0);
class UpdateOrderParamConfigDto {
    fieldNameZh;
    fieldType;
    isRequired;
    defaultValue;
    options;
    displayOrder;
    isActive;
}
exports.UpdateOrderParamConfigDto = UpdateOrderParamConfigDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderParamConfigDto.prototype, "fieldNameZh", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'TEXTAREA']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderParamConfigDto.prototype, "fieldType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateOrderParamConfigDto.prototype, "isRequired", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateOrderParamConfigDto.prototype, "defaultValue", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateOrderParamConfigDto.prototype, "options", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateOrderParamConfigDto.prototype, "displayOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateOrderParamConfigDto.prototype, "isActive", void 0);
//# sourceMappingURL=order.dto.js.map
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
exports.UpdatePartnershipDto = exports.CreatePartnershipDto = exports.PartnershipStatus = void 0;
const class_validator_1 = require("class-validator");
var PartnershipStatus;
(function (PartnershipStatus) {
    PartnershipStatus["PENDING"] = "PENDING";
    PartnershipStatus["CONTACTED"] = "CONTACTED";
    PartnershipStatus["PARTNERED"] = "PARTNERED";
    PartnershipStatus["REJECTED"] = "REJECTED";
})(PartnershipStatus || (exports.PartnershipStatus = PartnershipStatus = {}));
class CreatePartnershipDto {
    name;
    company;
    email;
    phone;
    message;
}
exports.CreatePartnershipDto = CreatePartnershipDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreatePartnershipDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartnershipDto.prototype, "company", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePartnershipDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartnershipDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePartnershipDto.prototype, "message", void 0);
class UpdatePartnershipDto {
    status;
    notes;
}
exports.UpdatePartnershipDto = UpdatePartnershipDto;
__decorate([
    (0, class_validator_1.IsEnum)(PartnershipStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePartnershipDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePartnershipDto.prototype, "notes", void 0);
//# sourceMappingURL=partnership.dto.js.map
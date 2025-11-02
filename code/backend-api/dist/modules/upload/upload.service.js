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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const file_upload_service_1 = require("../../common/services/file-upload.service");
const upload_dto_1 = require("./dto/upload.dto");
let UploadService = class UploadService {
    fileUploadService;
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadFile(file, type = upload_dto_1.UploadType.IMAGE) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        let allowedExtensions;
        let maxSize;
        let subDir;
        switch (type) {
            case upload_dto_1.UploadType.IMAGE:
                allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                maxSize = 5 * 1024 * 1024;
                subDir = 'images';
                break;
            case upload_dto_1.UploadType.VIDEO:
                allowedExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'];
                maxSize = 50 * 1024 * 1024;
                subDir = 'videos';
                break;
            case upload_dto_1.UploadType.DOCUMENT:
                allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
                maxSize = 10 * 1024 * 1024;
                subDir = 'documents';
                break;
            case upload_dto_1.UploadType.EXCEL:
                allowedExtensions = ['.xlsx', '.xls', '.csv'];
                maxSize = 10 * 1024 * 1024;
                subDir = 'excel';
                break;
            default:
                throw new common_1.BadRequestException('Invalid upload type');
        }
        this.fileUploadService.validateFile(file, allowedExtensions, maxSize);
        const filename = this.fileUploadService.generateFileName(file.originalname, type);
        const fs = require('fs');
        const filePath = this.fileUploadService.getFilePath(subDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        return {
            url: this.fileUploadService.getFileUrl(subDir, filename),
            filename,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
    async uploadMultipleFiles(files, type = upload_dto_1.UploadType.IMAGE) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files uploaded');
        }
        const results = [];
        for (const file of files) {
            try {
                const result = await this.uploadFile(file, type);
                results.push(result);
            }
            catch (error) {
                results.push({
                    filename: file.originalname,
                    error: error.message,
                });
            }
        }
        return results;
    }
    async deleteFile(fileUrl) {
        const urlParts = fileUrl.split('/uploads/');
        if (urlParts.length !== 2) {
            throw new common_1.BadRequestException('Invalid file URL');
        }
        const [subDir, ...filenameParts] = urlParts[1].split('/');
        const filename = filenameParts.join('/');
        const filePath = this.fileUploadService.getFilePath(subDir, filename);
        const deleted = this.fileUploadService.deleteFile(filePath);
        if (!deleted) {
            throw new common_1.BadRequestException('File not found or could not be deleted');
        }
        return { success: true, message: 'File deleted successfully' };
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], UploadService);
//# sourceMappingURL=upload.service.js.map
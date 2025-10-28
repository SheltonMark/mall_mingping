"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FileUploadService = class FileUploadService {
    configService;
    uploadDir;
    constructor(configService) {
        this.configService = configService;
        this.uploadDir =
            this.configService.get('UPLOAD_DIR') || './uploads';
        this.ensureUploadDirExists();
    }
    ensureUploadDirExists() {
        const dirs = [
            this.uploadDir,
            path.join(this.uploadDir, 'images'),
            path.join(this.uploadDir, 'documents'),
            path.join(this.uploadDir, 'excel'),
            path.join(this.uploadDir, 'temp'),
        ];
        dirs.forEach((dir) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    validateFile(file, allowedTypes, maxSize) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const fileExt = path.extname(file.originalname).toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
        }
        const maxFileSize = maxSize || this.configService.get('MAX_FILE_SIZE') || 5242880;
        if (file.size > maxFileSize) {
            throw new common_1.BadRequestException(`File size exceeds limit of ${maxFileSize / 1024 / 1024}MB`);
        }
        return true;
    }
    generateFileName(originalName, prefix) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const ext = path.extname(originalName);
        const baseName = path.basename(originalName, ext);
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
        return prefix
            ? `${prefix}_${sanitizedName}_${timestamp}_${random}${ext}`
            : `${sanitizedName}_${timestamp}_${random}${ext}`;
    }
    getFilePath(subDir, fileName) {
        return path.join(this.uploadDir, subDir, fileName);
    }
    getFileUrl(subDir, fileName) {
        return `/uploads/${subDir}/${fileName}`;
    }
    deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('Error deleting file:', error);
            return false;
        }
    }
    cleanupTempFiles() {
        const tempDir = path.join(this.uploadDir, 'temp');
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000;
        try {
            const files = fs.readdirSync(tempDir);
            files.forEach((file) => {
                const filePath = path.join(tempDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > maxAge) {
                    fs.unlinkSync(filePath);
                }
            });
        }
        catch (error) {
            console.error('Error cleaning up temp files:', error);
        }
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FileUploadService);
//# sourceMappingURL=file-upload.service.js.map
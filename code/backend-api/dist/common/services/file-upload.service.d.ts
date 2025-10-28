import { ConfigService } from '@nestjs/config';
export declare class FileUploadService {
    private configService;
    private uploadDir;
    constructor(configService: ConfigService);
    private ensureUploadDirExists;
    validateFile(file: Express.Multer.File, allowedTypes: string[], maxSize?: number): boolean;
    generateFileName(originalName: string, prefix?: string): string;
    getFilePath(subDir: string, fileName: string): string;
    getFileUrl(subDir: string, fileName: string): string;
    deleteFile(filePath: string): boolean;
    cleanupTempFiles(): void;
}

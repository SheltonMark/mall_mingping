import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  private uploadDir: string;

  constructor(private configService: ConfigService) {
    this.uploadDir =
      this.configService.get<string>('UPLOAD_DIR') || './uploads';
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
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

  validateFile(
    file: Express.Multer.File,
    allowedTypes: string[],
    maxSize?: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check file type
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Check file size
    const maxFileSize =
      maxSize || this.configService.get<number>('MAX_FILE_SIZE') || 5242880; // 5MB default
    if (file.size > maxFileSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${maxFileSize / 1024 / 1024}MB`,
      );
    }

    return true;
  }

  generateFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');

    return prefix
      ? `${prefix}_${sanitizedName}_${timestamp}_${random}${ext}`
      : `${sanitizedName}_${timestamp}_${random}${ext}`;
  }

  getFilePath(subDir: string, fileName: string): string {
    return path.join(this.uploadDir, subDir, fileName);
  }

  getFileUrl(subDir: string, fileName: string): string {
    return `/uploads/${subDir}/${fileName}`;
  }

  deleteFile(filePath: string): boolean {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Clean up temporary files older than 24 hours
  cleanupTempFiles() {
    const tempDir = path.join(this.uploadDir, 'temp');
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    try {
      const files = fs.readdirSync(tempDir);
      files.forEach((file) => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > maxAge) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

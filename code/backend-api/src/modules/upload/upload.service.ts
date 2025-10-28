import { Injectable, BadRequestException } from '@nestjs/common';
import { FileUploadService } from '../../common/services/file-upload.service';
import { UploadType } from './dto/upload.dto';

@Injectable()
export class UploadService {
  constructor(private fileUploadService: FileUploadService) {}

  async uploadFile(
    file: Express.Multer.File,
    type: UploadType = UploadType.IMAGE,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Define allowed types based on upload type
    let allowedExtensions: string[];
    let maxSize: number;
    let subDir: string;

    switch (type) {
      case UploadType.IMAGE:
        allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        maxSize = 5 * 1024 * 1024; // 5MB
        subDir = 'images';
        break;
      case UploadType.DOCUMENT:
        allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        maxSize = 10 * 1024 * 1024; // 10MB
        subDir = 'documents';
        break;
      case UploadType.EXCEL:
        allowedExtensions = ['.xlsx', '.xls', '.csv'];
        maxSize = 10 * 1024 * 1024; // 10MB
        subDir = 'excel';
        break;
      default:
        throw new BadRequestException('Invalid upload type');
    }

    // Validate file
    this.fileUploadService.validateFile(file, allowedExtensions, maxSize);

    // Generate unique filename
    const filename = this.fileUploadService.generateFileName(
      file.originalname,
      type,
    );

    // Save file
    const fs = require('fs');
    const filePath = this.fileUploadService.getFilePath(subDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    // Return file info
    return {
      url: this.fileUploadService.getFileUrl(subDir, filename),
      filename,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    type: UploadType = UploadType.IMAGE,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const results: any[] = [];
    for (const file of files) {
      try {
        const result = await this.uploadFile(file, type);
        results.push(result);
      } catch (error) {
        results.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    return results;
  }

  async deleteFile(fileUrl: string) {
    // Extract file path from URL
    // URL format: /uploads/subdirectory/filename
    const urlParts = fileUrl.split('/uploads/');
    if (urlParts.length !== 2) {
      throw new BadRequestException('Invalid file URL');
    }

    const [subDir, ...filenameParts] = urlParts[1].split('/');
    const filename = filenameParts.join('/');

    const filePath = this.fileUploadService.getFilePath(subDir, filename);
    const deleted = this.fileUploadService.deleteFile(filePath);

    if (!deleted) {
      throw new BadRequestException('File not found or could not be deleted');
    }

    return { success: true, message: 'File deleted successfully' };
  }
}

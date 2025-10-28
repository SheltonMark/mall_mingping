import { UploadService } from './upload.service';
import { UploadType } from './dto/upload.dto';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadSingle(file: Express.Multer.File, type?: UploadType): Promise<{
        url: string;
        filename: string;
        size: number;
        mimetype: string;
    }>;
    uploadMultiple(files: Express.Multer.File[], type?: UploadType): Promise<any[]>;
    deleteFile(url: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

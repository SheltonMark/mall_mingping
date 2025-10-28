import { FileUploadService } from '../../common/services/file-upload.service';
import { UploadType } from './dto/upload.dto';
export declare class UploadService {
    private fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadFile(file: Express.Multer.File, type?: UploadType): Promise<{
        url: string;
        filename: string;
        size: number;
        mimetype: string;
    }>;
    uploadMultipleFiles(files: Express.Multer.File[], type?: UploadType): Promise<any[]>;
    deleteFile(fileUrl: string): Promise<{
        success: boolean;
        message: string;
    }>;
}

import { Response } from 'express';
export declare class ExcelService {
    parseExcelFile(buffer: Buffer): Promise<any[]>;
    createExcelFile(data: any[], columns: Array<{
        header: string;
        key: string;
        width?: number;
    }>, sheetName?: string): Promise<Buffer>;
    streamExcelToResponse(res: Response, data: any[], columns: Array<{
        header: string;
        key: string;
        width?: number;
    }>, filename: string, sheetName?: string): Promise<void>;
    createTemplateFile(columns: Array<{
        header: string;
        key: string;
        width?: number;
        example?: string;
    }>, filename: string): Promise<Buffer>;
    validateExcelData(data: any[], requiredFields: string[]): {
        valid: boolean;
        errors: string[];
    };
}

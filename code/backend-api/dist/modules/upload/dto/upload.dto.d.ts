export declare enum UploadType {
    IMAGE = "image",
    DOCUMENT = "document",
    EXCEL = "excel"
}
export declare class UploadResponseDto {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
}

export declare enum UploadType {
    IMAGE = "image",
    DOCUMENT = "document",
    EXCEL = "excel",
    VIDEO = "video"
}
export declare class UploadResponseDto {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
}

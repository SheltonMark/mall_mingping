import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum UploadType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  EXCEL = 'excel',
  VIDEO = 'video',
}

export class UploadResponseDto {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

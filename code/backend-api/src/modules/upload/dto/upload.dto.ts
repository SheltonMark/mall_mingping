import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum UploadType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  EXCEL = 'excel',
}

export class UploadResponseDto {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

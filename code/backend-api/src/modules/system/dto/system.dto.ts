import { IsString, IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateSystemConfigDto {
  @IsString()
  configKey: string;

  @IsOptional()
  configValue?: any; // Can be string, object, array, etc.

  @IsString()
  @IsOptional()
  configType?: string; // json, text, number, boolean

  @IsString()
  @IsOptional()
  description?: string;
}

export class GetSystemConfigDto {
  @IsString()
  configKey: string;
}

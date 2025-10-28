import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
} from 'class-validator';

export enum PartnershipStatus {
  PENDING = 'PENDING',
  CONTACTED = 'CONTACTED',
  PARTNERED = 'PARTNERED',
  REJECTED = 'REJECTED',
}

export class CreatePartnershipDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdatePartnershipDto {
  @IsEnum(PartnershipStatus)
  @IsOptional()
  status?: PartnershipStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

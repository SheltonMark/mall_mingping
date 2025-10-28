import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreateSalespersonDto {
  @IsString()
  @MinLength(2)
  accountId: string;

  @IsString()
  @MinLength(2)
  chineseName: string;

  @IsString()
  @MinLength(2)
  englishName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  hireDate: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdateSalespersonDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  chineseName?: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  englishName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsDateString()
  @IsOptional()
  hireDate?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

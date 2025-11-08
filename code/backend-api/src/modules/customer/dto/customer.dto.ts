import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  MinLength,
} from 'class-validator';

enum CustomerType {
  NEW = 'NEW',
  OLD = 'OLD',
}

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;
}

export class UpdateCustomerDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsUUID()
  @IsOptional()
  salespersonId?: string;

  @IsEnum(CustomerType)
  @IsOptional()
  customerType?: CustomerType;
}

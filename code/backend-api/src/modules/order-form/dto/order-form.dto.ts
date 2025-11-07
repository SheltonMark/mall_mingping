import { IsNotEmpty, IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateOrderFormDto {
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsNotEmpty()
  items: any[]; // JSON array of cart items

  @IsString()
  @IsNotEmpty()
  totalAmount: string;
}

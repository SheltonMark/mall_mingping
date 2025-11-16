import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginSalespersonDto {
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class RegisterSalespersonDto {
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  accountId: string;

  @IsString()
  @IsNotEmpty({ message: 'Chinese name is required' })
  chineseName: string;

  @IsString()
  @IsNotEmpty({ message: 'English name is required' })
  englishName: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Hire date is required' })
  hireDate: string; // ISO date string
}

export class UpdateSalespersonProfileDto {
  @IsString()
  @IsOptional()
  chineseName?: string;

  @IsString()
  @IsOptional()
  englishName?: string;

  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

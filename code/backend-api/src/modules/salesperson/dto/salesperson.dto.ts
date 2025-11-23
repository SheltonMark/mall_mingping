import {
  IsString,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateSalespersonDto {
  @IsString()
  @MinLength(2, { message: '工号至少2位' })
  accountId: string;

  @IsString()
  @MinLength(2, { message: '中文名至少2个字符' })
  chineseName: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;
}

export class UpdateSalespersonDto {
  @IsString()
  @MinLength(2, { message: '工号至少2位' })
  @IsOptional()
  accountId?: string;

  @IsString()
  @MinLength(2, { message: '中文名至少2个字符' })
  @IsOptional()
  chineseName?: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @IsOptional()
  password?: string;
}

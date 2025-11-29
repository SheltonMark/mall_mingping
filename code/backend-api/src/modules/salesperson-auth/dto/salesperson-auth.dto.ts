import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SalespersonLoginDto {
  @IsString()
  @IsNotEmpty({ message: '工号不能为空' })
  accountId: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, { message: '密码至少6位' })
  password: string;
}

export class VerifyPasswordDto {
  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}

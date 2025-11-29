import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { SalespersonLoginDto } from './dto/salesperson-auth.dto';

@Injectable()
export class SalespersonAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: SalespersonLoginDto) {
    const { accountId, password } = loginDto;

    // Find salesperson by accountId (工号)
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { accountId },
    });

    if (!salesperson) {
      throw new UnauthorizedException('工号或密码错误');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, salesperson.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('工号或密码错误');
    }

    const token = await this.generateToken(salesperson);

    return {
      salesperson: {
        id: salesperson.id,
        accountId: salesperson.accountId,
        chineseName: salesperson.chineseName,
      },
      access_token: token,
    };
  }

  async verifyPassword(salespersonId: string, password: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id: salespersonId },
    });

    if (!salesperson) {
      throw new UnauthorizedException('业务员不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, salesperson.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('密码错误');
    }

    return { verified: true };
  }

  async validateSalesperson(salespersonId: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id: salespersonId },
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        createdAt: true,
      },
    });

    if (!salesperson) {
      throw new UnauthorizedException('业务员不存在');
    }

    return salesperson;
  }

  private async generateToken(salesperson: any): Promise<string> {
    const payload = {
      sub: salesperson.id,
      accountId: salesperson.accountId,
      type: 'salesperson', // 区分业务员token和管理员token
    };

    return this.jwtService.sign(payload);
  }
}

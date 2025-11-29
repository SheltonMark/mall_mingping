import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SalespersonAuthService } from './salesperson-auth.service';

@Injectable()
export class JwtSalespersonStrategy extends PassportStrategy(Strategy, 'jwt-salesperson') {
  constructor(private salespersonAuthService: SalespersonAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-jwt-secret-key-2024',
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // Only validate if this is a salesperson token
    if (payload.type !== 'salesperson') {
      throw new UnauthorizedException('无效的业务员令牌');
    }

    const salesperson = await this.salespersonAuthService.validateSalesperson(payload.sub);
    if (!salesperson) {
      throw new UnauthorizedException('业务员不存在');
    }

    // 返回包含 sub 字段的用户对象，以便 controller 使用
    return { ...salesperson, sub: payload.sub };
  }
}

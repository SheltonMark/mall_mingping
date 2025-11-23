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
    });
  }

  async validate(payload: any) {
    // Verify this is a salesperson token
    if (payload.type !== 'salesperson') {
      throw new UnauthorizedException('无效的token类型');
    }

    const salesperson = await this.salespersonAuthService.validateSalesperson(payload.sub);
    return salesperson;
  }
}

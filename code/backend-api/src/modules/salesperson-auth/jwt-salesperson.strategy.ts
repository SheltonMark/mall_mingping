import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SalespersonAuthService } from './salesperson-auth.service';

@Injectable()
export class JwtSalespersonStrategy extends PassportStrategy(
  Strategy,
  'jwt-salesperson',
) {
  constructor(private salespersonAuthService: SalespersonAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // Verify it's a salesperson token
    if (payload.role !== 'salesperson') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate salesperson still exists and is active
    const salesperson = await this.salespersonAuthService.validateSalesperson(
      payload.sub,
    );

    return salesperson;
  }
}

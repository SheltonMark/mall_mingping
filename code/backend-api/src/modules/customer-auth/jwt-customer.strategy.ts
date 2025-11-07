import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CustomerAuthService } from './customer-auth.service';

@Injectable()
export class JwtCustomerStrategy extends PassportStrategy(
  Strategy,
  'jwt-customer',
) {
  constructor(private customerAuthService: CustomerAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    });
  }

  async validate(payload: any) {
    // Verify it's a customer token
    if (payload.type !== 'customer') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate customer still exists and is active
    const customer = await this.customerAuthService.validateCustomer(
      payload.sub,
    );

    return customer;
  }
}
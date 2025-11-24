import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminAuthService } from './admin-auth.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(private adminAuthService: AdminAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-jwt-secret-key-2024',
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    // Only validate if this is an admin token
    if (payload.type !== 'admin') {
      return null; // Return null to let other strategies try
    }

    const admin = await this.adminAuthService.validateAdmin(payload.sub);
    return admin;
  }
}

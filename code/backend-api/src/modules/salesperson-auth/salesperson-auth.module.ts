import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../../prisma.service';
import { SalespersonAuthController } from './salesperson-auth.controller';
import { SalespersonAuthService } from './salesperson-auth.service';
import { JwtSalespersonStrategy } from './jwt-salesperson.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-jwt-secret-key-2024',
      signOptions: { expiresIn: process.env.JWT_EXPIRATION || '7d' },
    }),
  ],
  controllers: [SalespersonAuthController],
  providers: [SalespersonAuthService, JwtSalespersonStrategy, PrismaService],
  exports: [SalespersonAuthService],
})
export class SalespersonAuthModule {}

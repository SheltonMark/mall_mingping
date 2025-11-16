import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SalespersonAuthController } from './salesperson-auth.controller';
import { SalespersonAuthService } from './salesperson-auth.service';
import { JwtSalespersonStrategy } from './jwt-salesperson.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-salesperson' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' }, // Token expires in 7 days
    }),
  ],
  controllers: [SalespersonAuthController],
  providers: [SalespersonAuthService, JwtSalespersonStrategy, PrismaService],
  exports: [SalespersonAuthService, JwtSalespersonStrategy],
})
export class SalespersonAuthModule {}

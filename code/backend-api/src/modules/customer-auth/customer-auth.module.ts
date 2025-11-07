import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { JwtCustomerStrategy } from './jwt-customer.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt-customer' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' }, // Token expires in 7 days
    }),
  ],
  controllers: [CustomerAuthController],
  providers: [CustomerAuthService, JwtCustomerStrategy, PrismaService],
  exports: [CustomerAuthService, JwtCustomerStrategy],
})
export class CustomerAuthModule {}
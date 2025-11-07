import { Module } from '@nestjs/common';
import { OrderFormController } from './order-form.controller';
import { OrderFormService } from './order-form.service';
import { PrismaService } from '../../prisma.service';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';

@Module({
  imports: [CustomerAuthModule],
  controllers: [OrderFormController],
  providers: [OrderFormService, PrismaService],
  exports: [OrderFormService],
})
export class OrderFormModule {}

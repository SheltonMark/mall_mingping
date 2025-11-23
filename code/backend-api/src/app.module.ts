import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { SalespersonAuthModule } from './modules/salesperson-auth/salesperson-auth.module';
import { OrderFormModule } from './modules/order-form/order-form.module';
import { SalespersonModule } from './modules/salesperson/salesperson.module';
import { CustomerModule } from './modules/customer/customer.module';
import { OrderModule } from './modules/order/order.module';
import { ProductModule } from './modules/product/product.module';
import { UploadModule } from './modules/upload/upload.module';
import { SystemModule } from './modules/system/system.module';
import { PartnershipModule } from './modules/partnership/partnership.module';
import { ComponentModule } from './modules/component/component.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    SalespersonAuthModule, // Internal sales: Salesperson authentication
    OrderFormModule,
    SalespersonModule,
    CustomerModule,
    OrderModule,
    ProductModule,
    UploadModule,
    SystemModule,
    PartnershipModule,
    ComponentModule,
    CartModule, // External site: Shopping cart
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}

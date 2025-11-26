import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { ErpModule } from '../../erp/erp.module';

@Module({
  imports: [ErpModule],
  controllers: [OrderController],
  providers: [OrderService, PrismaService, ExcelService],
  exports: [OrderService],
})
export class OrderModule {}

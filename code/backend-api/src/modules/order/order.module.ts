import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, PrismaService, ExcelService],
  exports: [OrderService],
})
export class OrderModule {}

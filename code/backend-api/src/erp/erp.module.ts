import { Module } from '@nestjs/common';
import { ErpOrderSyncService } from './erp-order-sync.service';
import { ErpController } from './erp.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ErpController],
  providers: [ErpOrderSyncService, PrismaService],
  exports: [ErpOrderSyncService],
})
export class ErpModule {}

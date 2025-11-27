import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ErpOrderSyncService } from './erp-order-sync.service';
import { ErpProductSyncService } from './erp-product-sync.service';
import { ErpEntitySyncService } from './erp-entity-sync.service';
import { ErpScheduleService } from './erp-schedule.service';
import { ErpController } from './erp.controller';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [ErpController],
  providers: [
    ErpOrderSyncService,
    ErpProductSyncService,
    ErpEntitySyncService,
    ErpScheduleService,
    PrismaService,
  ],
  exports: [ErpOrderSyncService, ErpProductSyncService, ErpEntitySyncService],
})
export class ErpModule {}

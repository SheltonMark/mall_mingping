import { Module } from '@nestjs/common';
import { ErpOrderSyncService } from './erp-order-sync.service';
import { ErpProductSyncService } from './erp-product-sync.service';
import { ErpEntitySyncService } from './erp-entity-sync.service';
import { ErpCustomerSyncService } from './erp-customer-sync.service';
import { ErpSalespersonSyncService } from './erp-salesperson-sync.service';
import { ErpController } from './erp.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ErpController],
  providers: [
    ErpOrderSyncService,
    ErpProductSyncService,
    ErpEntitySyncService,
    ErpCustomerSyncService,
    ErpSalespersonSyncService,
    PrismaService,
  ],
  exports: [
    ErpOrderSyncService,
    ErpProductSyncService,
    ErpEntitySyncService,
    ErpCustomerSyncService,
    ErpSalespersonSyncService,
  ],
})
export class ErpModule {}

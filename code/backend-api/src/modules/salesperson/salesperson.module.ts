import { Module } from '@nestjs/common';
import { SalespersonService } from './salesperson.service';
import { SalespersonController } from './salesperson.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [SalespersonController],
  providers: [SalespersonService, PrismaService],
  exports: [SalespersonService],
})
export class SalespersonModule {}

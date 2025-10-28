import { Module } from '@nestjs/common';
import { PartnershipService } from './partnership.service';
import { PartnershipController } from './partnership.controller';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [PartnershipController],
  providers: [PartnershipService, PrismaService],
  exports: [PartnershipService],
})
export class PartnershipModule {}

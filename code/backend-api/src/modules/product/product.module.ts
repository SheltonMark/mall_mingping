import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaService } from '../../prisma.service';
import { ExcelService } from '../../common/services/excel.service';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  controllers: [ProductController],
  providers: [
    ProductService,
    PrismaService,
    ExcelService,
    FileUploadService,
  ],
  exports: [ProductService],
})
export class ProductModule {}

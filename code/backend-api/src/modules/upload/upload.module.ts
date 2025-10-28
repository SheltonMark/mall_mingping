import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { FileUploadService } from '../../common/services/file-upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, FileUploadService],
  exports: [UploadService],
})
export class UploadModule {}

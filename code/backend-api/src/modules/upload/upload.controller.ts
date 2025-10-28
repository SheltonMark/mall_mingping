import {
  Controller,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadType } from './dto/upload.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type?: UploadType,
  ) {
    return this.uploadService.uploadFile(file, type || UploadType.IMAGE);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('type') type?: UploadType,
  ) {
    return this.uploadService.uploadMultipleFiles(files, type || UploadType.IMAGE);
  }

  @Delete()
  async deleteFile(@Body('url') url: string) {
    return this.uploadService.deleteFile(url);
  }
}

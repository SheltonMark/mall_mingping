import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ProductService } from './product.service';
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
  CreateProductSkuDto,
  UpdateProductSkuDto,
  BatchImportSkuDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============ Category Endpoints ============
  // 公开接口：获取分类列表（前台商城使用）
  @Get('categories')
  findAllCategories(@Query('activeOnly') activeOnly?: string) {
    return this.productService.findAllCategories(activeOnly === 'true');
  }

  // 公开接口：获取分类详情
  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.productService.findOneCategory(id);
  }

  // 管理接口：需要认证
  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.productService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  removeCategory(@Param('id') id: string) {
    return this.productService.removeCategory(id);
  }

  // ============ Product Group Endpoints ============
  // 公开接口：获取产品组列表（前台商城使用，支持publishedOnly参数）
  @Get('groups')
  findAllProductGroups(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isPublished') isPublished?: string,
    @Query('publishedOnly') publishedOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAllProductGroups({
      search,
      categoryId,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // 公开接口：获取产品组详情
  @Get('groups/:id')
  findOneProductGroup(@Param('id') id: string) {
    return this.productService.findOneProductGroup(id);
  }

  // 管理接口：需要认证
  @Post('groups')
  @UseGuards(JwtAuthGuard)
  createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.productService.createProductGroup(dto);
  }

  @Patch('groups/:id')
  @UseGuards(JwtAuthGuard)
  updateProductGroup(
    @Param('id') id: string,
    @Body() dto: UpdateProductGroupDto,
  ) {
    return this.productService.updateProductGroup(id, dto);
  }

  @Delete('groups/:id')
  @UseGuards(JwtAuthGuard)
  removeProductGroup(@Param('id') id: string) {
    return this.productService.removeProductGroup(id);
  }

  // ============ Product SKU Endpoints ============
  // 公开接口：获取SKU列表
  @Get('skus')
  findAllProductSkus(
    @Query('search') search?: string,
    @Query('groupId') groupId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAllProductSkus({
      search,
      groupId,
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // 公开接口：获取SKU详情
  @Get('skus/:id')
  findOneProductSku(@Param('id') id: string) {
    return this.productService.findOneProductSku(id);
  }

  // 管理接口：需要认证
  @Post('skus')
  @UseGuards(JwtAuthGuard)
  createProductSku(@Body() dto: CreateProductSkuDto) {
    return this.productService.createProductSku(dto);
  }

  @Patch('skus/:id')
  @UseGuards(JwtAuthGuard)
  updateProductSku(@Param('id') id: string, @Body() dto: UpdateProductSkuDto) {
    return this.productService.updateProductSku(id, dto);
  }

  @Delete('skus/:id')
  @UseGuards(JwtAuthGuard)
  removeProductSku(@Param('id') id: string) {
    return this.productService.removeProductSku(id);
  }

  @Post('skus/batch-import')
  @UseGuards(JwtAuthGuard)
  batchImportSkus(@Body() dto: BatchImportSkuDto) {
    return this.productService.batchImportSkus(dto.skus);
  }

  // ============ Excel Import/Export Endpoints ============
  @Post('skus/import-excel')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    console.log('📥 [Controller] 收到Excel导入请求');
    console.log('📄 [Controller] 文件信息:', file ? {
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    } : 'No file');

    const result = await this.productService.importSkusFromExcel(file);

    console.log('✅ [Controller] 导入完成:', {
      success: typeof result.success === 'number' ? result.success : (result.success ? 1 : 0),
      failed: 'failed' in result ? result.failed : 0,
      errorCount: result.errors?.length || 0
    });

    return result;
  }

  @Get('skus/export-template')
  @UseGuards(JwtAuthGuard)
  async downloadTemplate(@Res() res: Response) {
    return this.productService.generateExcelTemplate(res);
  }

  @Get('skus/export')
  @UseGuards(JwtAuthGuard)
  async exportSkusToExcel(
    @Query('groupId') groupId: string,
    @Res() res: Response,
  ) {
    return this.productService.exportSkusToExcel(groupId, res);
  }
}

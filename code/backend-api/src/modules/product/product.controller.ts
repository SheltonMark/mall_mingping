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
  CreateMaterialDto,
  UpdateMaterialDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
  CreateProductSkuDto,
  UpdateProductSkuDto,
  BatchImportSkuDto,
} from './dto/product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ============ Category Endpoints ============
  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.productService.createCategory(dto);
  }

  @Get('categories')
  findAllCategories(@Query('activeOnly') activeOnly?: string) {
    return this.productService.findAllCategories(activeOnly === 'true');
  }

  @Get('categories/:id')
  findOneCategory(@Param('id') id: string) {
    return this.productService.findOneCategory(id);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.productService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.productService.removeCategory(id);
  }

  // ============ Material Endpoints ============
  @Post('materials')
  createMaterial(@Body() dto: CreateMaterialDto) {
    return this.productService.createMaterial(dto);
  }

  @Get('materials')
  findAllMaterials(@Query('activeOnly') activeOnly?: string) {
    return this.productService.findAllMaterials(activeOnly === 'true');
  }

  @Get('materials/:id')
  findOneMaterial(@Param('id') id: string) {
    return this.productService.findOneMaterial(id);
  }

  @Patch('materials/:id')
  updateMaterial(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.productService.updateMaterial(id, dto);
  }

  @Delete('materials/:id')
  removeMaterial(@Param('id') id: string) {
    return this.productService.removeMaterial(id);
  }

  // ============ Product Group Endpoints ============
  @Post('groups')
  createProductGroup(@Body() dto: CreateProductGroupDto) {
    return this.productService.createProductGroup(dto);
  }

  @Get('groups')
  findAllProductGroups(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('materialId') materialId?: string,
    @Query('isPublished') isPublished?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAllProductGroups({
      search,
      categoryId,
      materialId,
      isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('groups/:id')
  findOneProductGroup(@Param('id') id: string) {
    return this.productService.findOneProductGroup(id);
  }

  @Patch('groups/:id')
  updateProductGroup(
    @Param('id') id: string,
    @Body() dto: UpdateProductGroupDto,
  ) {
    return this.productService.updateProductGroup(id, dto);
  }

  @Delete('groups/:id')
  removeProductGroup(@Param('id') id: string) {
    return this.productService.removeProductGroup(id);
  }

  // ============ Product SKU Endpoints ============
  @Post('skus')
  createProductSku(@Body() dto: CreateProductSkuDto) {
    return this.productService.createProductSku(dto);
  }

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

  @Get('skus/:id')
  findOneProductSku(@Param('id') id: string) {
    return this.productService.findOneProductSku(id);
  }

  @Patch('skus/:id')
  updateProductSku(@Param('id') id: string, @Body() dto: UpdateProductSkuDto) {
    return this.productService.updateProductSku(id, dto);
  }

  @Delete('skus/:id')
  removeProductSku(@Param('id') id: string) {
    return this.productService.removeProductSku(id);
  }

  @Post('skus/batch-import')
  batchImportSkus(@Body() dto: BatchImportSkuDto) {
    return this.productService.batchImportSkus(dto.skus);
  }

  // ============ Excel Import/Export Endpoints ============
  @Post('skus/import-excel')
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(@UploadedFile() file: Express.Multer.File) {
    return this.productService.importSkusFromExcel(file);
  }

  @Get('skus/export-template')
  async downloadTemplate(@Res() res: Response) {
    return this.productService.generateExcelTemplate(res);
  }

  @Get('skus/export')
  async exportSkusToExcel(
    @Query('groupId') groupId: string,
    @Res() res: Response,
  ) {
    return this.productService.exportSkusToExcel(groupId, res);
  }
}

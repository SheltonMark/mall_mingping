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
} from '@nestjs/common';
import { SalespersonService } from './salesperson.service';
import {
  CreateSalespersonDto,
  UpdateSalespersonDto,
} from './dto/salesperson.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('salespersons')
export class SalespersonController {
  constructor(private readonly salespersonService: SalespersonService) {}

  // 管理接口：需要认证
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createSalespersonDto: CreateSalespersonDto) {
    return this.salespersonService.create(createSalespersonDto);
  }

  // 公开接口：获取业务员列表（前台订单页面使用）
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.salespersonService.findAll({
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  // 公开接口：获取业务员详情
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salespersonService.findOne(id);
  }

  // 管理接口：需要认证
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSalespersonDto: UpdateSalespersonDto,
  ) {
    return this.salespersonService.update(id, updateSalespersonDto);
  }

  // 管理接口：需要认证
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.salespersonService.remove(id);
  }
}

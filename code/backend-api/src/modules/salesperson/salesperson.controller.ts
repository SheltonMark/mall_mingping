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
@UseGuards(JwtAuthGuard)
export class SalespersonController {
  constructor(private readonly salespersonService: SalespersonService) {}

  @Post()
  create(@Body() createSalespersonDto: CreateSalespersonDto) {
    return this.salespersonService.create(createSalespersonDto);
  }

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.salespersonService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSalespersonDto: UpdateSalespersonDto,
  ) {
    return this.salespersonService.update(id, updateSalespersonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.salespersonService.remove(id);
  }
}

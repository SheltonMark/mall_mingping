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
import { PartnershipService } from './partnership.service';
import {
  CreatePartnershipDto,
  UpdatePartnershipDto,
} from './dto/partnership.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  // Public endpoint - anyone can submit partnership application
  @Post()
  create(@Body() createPartnershipDto: CreatePartnershipDto) {
    return this.partnershipService.create(createPartnershipDto);
  }

  // Protected endpoints - require authentication
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partnershipService.findAll({
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('statistics')
  getStatistics() {
    return this.partnershipService.getStatistics();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnershipService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePartnershipDto: UpdatePartnershipDto,
  ) {
    return this.partnershipService.update(id, updatePartnershipDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnershipService.remove(id);
  }
}

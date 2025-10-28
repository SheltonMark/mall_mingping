import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SystemService } from './system.service';
import { UpdateSystemConfigDto } from './dto/system.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  // General config endpoints
  @Get('config/:key')
  getConfig(@Param('key') key: string) {
    return this.systemService.getConfig(key);
  }

  @Get('configs')
  getConfigs(@Query('keys') keys?: string) {
    const keyArray = keys ? keys.split(',') : undefined;
    return this.systemService.getConfigs(keyArray);
  }

  @UseGuards(JwtAuthGuard)
  @Put('config')
  updateConfig(@Body() dto: UpdateSystemConfigDto) {
    return this.systemService.updateConfig(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('config/:key')
  deleteConfig(@Param('key') key: string) {
    return this.systemService.deleteConfig(key);
  }

  // Homepage config
  @Get('homepage')
  getHomepageConfig() {
    return this.systemService.getHomepageConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put('homepage')
  updateHomepageConfig(@Body() data: any) {
    return this.systemService.updateHomepageConfig(data);
  }

  // About Us config
  @Get('about')
  getAboutUsConfig() {
    return this.systemService.getAboutUsConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put('about')
  updateAboutUsConfig(@Body() data: any) {
    return this.systemService.updateAboutUsConfig(data);
  }

  // Site config
  @Get('site')
  getSiteConfig() {
    return this.systemService.getSiteConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Put('site')
  updateSiteConfig(@Body() data: any) {
    return this.systemService.updateSiteConfig(data);
  }
}

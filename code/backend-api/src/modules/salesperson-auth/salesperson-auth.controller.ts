import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SalespersonAuthService } from './salesperson-auth.service';
import { SalespersonLoginDto } from './dto/salesperson-auth.dto';

@Controller('salesperson-auth')
export class SalespersonAuthController {
  constructor(private salespersonAuthService: SalespersonAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: SalespersonLoginDto) {
    return this.salespersonAuthService.login(loginDto);
  }
}

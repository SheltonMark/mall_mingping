import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { SalespersonAuthService } from './salesperson-auth.service';
import { SalespersonLoginDto, VerifyPasswordDto } from './dto/salesperson-auth.dto';
import { JwtSalespersonGuard } from './jwt-salesperson.guard';

@Controller('salesperson-auth')
export class SalespersonAuthController {
  constructor(private salespersonAuthService: SalespersonAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: SalespersonLoginDto) {
    return this.salespersonAuthService.login(loginDto);
  }

  @Post('verify-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtSalespersonGuard)
  async verifyPassword(@Request() req, @Body() verifyDto: VerifyPasswordDto) {
    return this.salespersonAuthService.verifyPassword(req.user.sub, verifyDto.password);
  }
}

import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SalespersonAuthService } from './salesperson-auth.service';
import {
  LoginSalespersonDto,
  RegisterSalespersonDto,
  UpdateSalespersonProfileDto,
} from './dto/salesperson-auth.dto';
import { JwtSalespersonGuard } from './jwt-salesperson.guard';

@Controller('salesperson-auth')
export class SalespersonAuthController {
  constructor(
    private readonly salespersonAuthService: SalespersonAuthService,
  ) {}

  /**
   * Salesperson Login
   * POST /api/salesperson-auth/login
   */
  @Post('login')
  async login(@Body() loginDto: LoginSalespersonDto) {
    return this.salespersonAuthService.login(loginDto);
  }

  /**
   * Create Salesperson Account
   * POST /api/salesperson-auth/register
   * Note: In production, this should require admin authentication
   */
  @Post('register')
  async register(@Body() registerDto: RegisterSalespersonDto) {
    return this.salespersonAuthService.register(registerDto);
  }

  /**
   * Get Current Salesperson Profile
   * GET /api/salesperson-auth/profile
   * Requires authentication
   */
  @UseGuards(JwtSalespersonGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.salespersonAuthService.getProfile(req.user.id);
  }

  /**
   * Update Salesperson Profile
   * PATCH /api/salesperson-auth/profile
   * Requires authentication
   */
  @UseGuards(JwtSalespersonGuard)
  @Patch('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: UpdateSalespersonProfileDto,
  ) {
    return this.salespersonAuthService.updateProfile(req.user.id, updateDto);
  }
}

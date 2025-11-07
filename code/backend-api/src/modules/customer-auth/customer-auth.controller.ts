import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CustomerAuthService } from './customer-auth.service';
import {
  CustomerRegisterDto,
  CustomerLoginDto,
  UpdateCustomerProfileDto,
} from './dto/customer-auth.dto';
import { JwtAuthGuard } from './jwt-customer.guard';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  /**
   * Customer Registration
   * POST /customer-auth/register
   */
  @Post('register')
  async register(@Body() registerDto: CustomerRegisterDto) {
    return this.customerAuthService.register(registerDto);
  }

  /**
   * Customer Login
   * POST /customer-auth/login
   */
  @Post('login')
  async login(@Body() loginDto: CustomerLoginDto) {
    return this.customerAuthService.login(loginDto);
  }

  /**
   * Get Current Customer Profile
   * GET /customer-auth/profile
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.customerAuthService.getProfile(req.user.sub);
  }

  /**
   * Update Customer Profile
   * PUT /customer-auth/profile
   * Requires authentication
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(
    @Request() req: any,
    @Body() updateDto: UpdateCustomerProfileDto,
  ) {
    return this.customerAuthService.updateProfile(req.user.sub, updateDto);
  }
}
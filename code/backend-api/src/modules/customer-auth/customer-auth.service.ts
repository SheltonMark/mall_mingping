import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  CustomerRegisterDto,
  CustomerLoginDto,
  UpdateCustomerProfileDto,
} from './dto/customer-auth.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Customer Registration - Requires admin approval
   */
  async register(registerDto: CustomerRegisterDto) {
    const { email, password } = registerDto;

    // Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('This email is already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer with status='active' (auto-activated)
    const customer = await this.prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        name: email.split('@')[0], // Use email prefix as default name
        status: 'active', // Auto-activated
      },
      select: {
        id: true,
        email: true,
        name: true,
        contactPerson: true,
        phone: true,
        address: true,
        country: true,
        tier: true, // ADDED: Include tier
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.generateToken(customer);

    return {
      customer,
      access_token: token,
      message: 'Registration successful. Welcome!',
    };
  }

  /**
   * Customer Login
   */
  async login(loginDto: CustomerLoginDto) {
    const { email, password } = loginDto;

    // Find customer by email
    const customer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (!customer || !customer.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if customer is disabled (not pending or active)
    if (customer.status === 'inactive') {
      throw new UnauthorizedException('Your account has been disabled');
    }

    // Generate JWT token
    const token = await this.generateToken(customer);

    return {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        contactPerson: customer.contactPerson,
        phone: customer.phone,
        address: customer.address,
        country: customer.country,
        tier: customer.tier, // ADDED: Include tier
        status: customer.status,
        createdAt: customer.createdAt,
      },
      access_token: token,
    };
  }

  /**
   * Get customer profile
   */
  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        name: true,
        contactPerson: true,
        phone: true,
        address: true,
        country: true,
        tier: true, // ADDED: Include tier
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  /**
   * Update customer profile
   */
  async updateProfile(
    customerId: string,
    updateDto: UpdateCustomerProfileDto,
  ) {
    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Update customer
    const updatedCustomer = await this.prisma.customer.update({
      where: { id: customerId },
      data: updateDto,
      select: {
        id: true,
        email: true,
        name: true,
        contactPerson: true,
        phone: true,
        address: true,
        country: true,
        tier: true, // ADDED: Include tier
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedCustomer;
  }

  /**
   * Validate customer for JWT strategy
   */
  async validateCustomer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        name: true,
        contactPerson: true,
        phone: true,
        address: true,
        country: true,
        status: true,
        tier: true, // ADDED: Include tier for product visibility filtering
        createdAt: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    if (customer.status === 'inactive') {
      throw new UnauthorizedException('Your account has been disabled');
    }

    return customer;
  }

  /**
   * Generate JWT token
   */
  private async generateToken(customer: any): Promise<string> {
    const payload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer', // Distinguish from admin tokens
    };

    return this.jwtService.sign(payload);
  }
}
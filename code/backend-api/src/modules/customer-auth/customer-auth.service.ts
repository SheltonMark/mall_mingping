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
   * Customer Registration - No approval needed, automatically activated
   */
  async register(registerDto: CustomerRegisterDto) {
    const { email, password, name, contactPerson, phone, address, country } =
      registerDto;

    // Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      throw new ConflictException('This email is already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create customer with status='active' (auto-approved)
    const customer = await this.prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        name,
        contactPerson,
        phone,
        address,
        country,
        status: 'active', // Automatically activated
      },
      select: {
        id: true,
        email: true,
        name: true,
        contactPerson: true,
        phone: true,
        address: true,
        country: true,
        status: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.generateToken(customer);

    return {
      customer,
      access_token: token,
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

    // Check if customer is active
    if (customer.status !== 'active') {
      throw new UnauthorizedException('Your account has been disabled');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
        createdAt: true,
      },
    });

    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    if (customer.status !== 'active') {
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
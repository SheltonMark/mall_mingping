import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import {
  LoginSalespersonDto,
  RegisterSalespersonDto,
  UpdateSalespersonProfileDto,
} from './dto/salesperson-auth.dto';

@Injectable()
export class SalespersonAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Salesperson Login
   */
  async login(loginDto: LoginSalespersonDto) {
    const { accountId, password } = loginDto;

    // Find salesperson by accountId
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { accountId },
    });

    if (!salesperson || !salesperson.password) {
      throw new UnauthorizedException('Invalid account ID or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      salesperson.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid account ID or password');
    }

    // Generate JWT token
    const token = await this.generateToken(salesperson);

    return {
      salesperson: {
        id: salesperson.id,
        accountId: salesperson.accountId,
        chineseName: salesperson.chineseName,
        englishName: salesperson.englishName,
        email: salesperson.email,
        phone: salesperson.phone,
        avatar: salesperson.avatar,
        hireDate: salesperson.hireDate,
        createdAt: salesperson.createdAt,
      },
      access_token: token,
    };
  }

  /**
   * Create Salesperson Account (Admin only - no guard here, should be added in controller or separate admin module)
   */
  async register(registerDto: RegisterSalespersonDto) {
    const { accountId, chineseName, englishName, password, email, phone, hireDate } = registerDto;

    // Check if accountId already exists
    const existingSalesperson = await this.prisma.salesperson.findUnique({
      where: { accountId },
    });

    if (existingSalesperson) {
      throw new ConflictException('This account ID already exists');
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await this.prisma.salesperson.findUnique({
        where: { email },
      });

      if (existingEmail) {
        throw new ConflictException('This email is already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse hireDate
    let hireDateObj: Date;
    try {
      hireDateObj = new Date(hireDate);
      if (isNaN(hireDateObj.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      throw new BadRequestException('Invalid hire date format');
    }

    // Create salesperson
    const salesperson = await this.prisma.salesperson.create({
      data: {
        accountId,
        chineseName,
        englishName,
        password: hashedPassword,
        email,
        phone,
        hireDate: hireDateObj,
      },
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        englishName: true,
        email: true,
        phone: true,
        hireDate: true,
        avatar: true,
        createdAt: true,
      },
    });

    return {
      salesperson,
      message: 'Salesperson account created successfully',
    };
  }

  /**
   * Get salesperson profile
   */
  async getProfile(salespersonId: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id: salespersonId },
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        englishName: true,
        email: true,
        phone: true,
        hireDate: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    return salesperson;
  }

  /**
   * Update salesperson profile
   */
  async updateProfile(
    salespersonId: string,
    updateDto: UpdateSalespersonProfileDto,
  ) {
    // Check if salesperson exists
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id: salespersonId },
    });

    if (!salesperson) {
      throw new NotFoundException('Salesperson not found');
    }

    // Check email uniqueness if updating email
    if (updateDto.email && updateDto.email !== salesperson.email) {
      const existingEmail = await this.prisma.salesperson.findUnique({
        where: { email: updateDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('This email is already in use');
      }
    }

    // Update salesperson
    const updatedSalesperson = await this.prisma.salesperson.update({
      where: { id: salespersonId },
      data: updateDto,
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        englishName: true,
        email: true,
        phone: true,
        hireDate: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedSalesperson;
  }

  /**
   * Validate salesperson for JWT strategy
   */
  async validateSalesperson(salespersonId: string) {
    const salesperson = await this.prisma.salesperson.findUnique({
      where: { id: salespersonId },
      select: {
        id: true,
        accountId: true,
        chineseName: true,
        englishName: true,
        email: true,
        phone: true,
        hireDate: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!salesperson) {
      throw new UnauthorizedException('Salesperson not found');
    }

    return salesperson;
  }

  /**
   * Generate JWT token
   */
  private async generateToken(salesperson: any): Promise<string> {
    const payload = {
      sub: salesperson.id,
      accountId: salesperson.accountId,
      role: 'salesperson', // Distinguish from customer/admin tokens
    };

    return this.jwtService.sign(payload);
  }
}

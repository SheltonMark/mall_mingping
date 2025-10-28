import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, email, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.admin.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await this.prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'admin',
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = await this.generateToken(admin);

    return {
      user: admin,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;

    // Find admin by username
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken(admin);

    return {
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
      access_token: token,
    };
  }

  async validateUser(userId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedException('User not found');
    }

    return admin;
  }

  private async generateToken(admin: any): Promise<string> {
    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    return this.jwtService.sign(payload);
  }
}

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            username: string;
            email: string | null;
            id: string;
            role: string;
            createdAt: Date;
        };
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            username: string;
            email: string | null;
            role: string;
        };
        access_token: string;
    }>;
    validateUser(userId: string): Promise<{
        username: string;
        email: string | null;
        id: string;
        role: string;
        createdAt: Date;
    }>;
    private generateToken;
}

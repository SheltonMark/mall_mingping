import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(user: any): Promise<{
        user: any;
    }>;
}

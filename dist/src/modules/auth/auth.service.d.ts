import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './auth.repository';
import { LoginDto } from './dto/login.dto';
export declare class AuthService implements OnModuleInit {
    private authRepository;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(authRepository: AuthRepository, jwtService: JwtService, configService: ConfigService);
    onModuleInit(): Promise<void>;
    private seedAdminUser;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
        };
    }>;
    private generateTokens;
}

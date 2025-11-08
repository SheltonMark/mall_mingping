import { PrismaService } from '../../prisma.service';
import { UpdateSystemConfigDto } from './dto/system.dto';
export declare class SystemService {
    private prisma;
    constructor(prisma: PrismaService);
    getConfig(configKey: string): Promise<{
        configValue: any;
        id: string;
        configKey: string;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    getConfigs(configKeys?: string[]): Promise<{
        configValue: any;
        id: string;
        configKey: string;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }[]>;
    getAllConfigs(): Promise<{
        configValue: any;
        id: string;
        configKey: string;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }[]>;
    updateConfig(dto: UpdateSystemConfigDto): Promise<{
        id: string;
        configKey: string;
        configValue: string | null;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    deleteConfig(configKey: string): Promise<{
        id: string;
        configKey: string;
        configValue: string | null;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    getHomepageConfig(): Promise<any>;
    updateHomepageConfig(data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAboutUsConfig(): Promise<any>;
    updateAboutUsConfig(data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getSiteConfig(): Promise<any>;
    updateSiteConfig(data: any): Promise<{
        success: boolean;
        message: string;
    }>;
}

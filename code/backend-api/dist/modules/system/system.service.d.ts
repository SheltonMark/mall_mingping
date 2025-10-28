import { PrismaService } from '../../prisma.service';
import { UpdateSystemConfigDto } from './dto/system.dto';
export declare class SystemService {
    private prisma;
    constructor(prisma: PrismaService);
    getConfig(configKey: string): Promise<{
        configValue: any;
        id: string;
        updatedAt: Date;
        configKey: string;
        configType: string | null;
        description: string | null;
    }>;
    getConfigs(configKeys?: string[]): Promise<{
        configValue: any;
        id: string;
        updatedAt: Date;
        configKey: string;
        configType: string | null;
        description: string | null;
    }[]>;
    getAllConfigs(): Promise<{
        configValue: any;
        id: string;
        updatedAt: Date;
        configKey: string;
        configType: string | null;
        description: string | null;
    }[]>;
    updateConfig(dto: UpdateSystemConfigDto): Promise<{
        id: string;
        updatedAt: Date;
        configKey: string;
        configValue: string | null;
        configType: string | null;
        description: string | null;
    }>;
    deleteConfig(configKey: string): Promise<{
        id: string;
        updatedAt: Date;
        configKey: string;
        configValue: string | null;
        configType: string | null;
        description: string | null;
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

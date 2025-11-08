import { SystemService } from './system.service';
import { UpdateSystemConfigDto } from './dto/system.dto';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getConfig(key: string): Promise<{
        configValue: any;
        id: string;
        configKey: string;
        configType: string | null;
        description: string | null;
        updatedAt: Date;
    }>;
    getConfigs(keys?: string): Promise<{
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
    deleteConfig(key: string): Promise<{
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

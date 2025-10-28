import { SystemService } from './system.service';
import { UpdateSystemConfigDto } from './dto/system.dto';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getConfig(key: string): Promise<{
        configValue: any;
        id: string;
        updatedAt: Date;
        configKey: string;
        configType: string | null;
        description: string | null;
    }>;
    getConfigs(keys?: string): Promise<{
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
    deleteConfig(key: string): Promise<{
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

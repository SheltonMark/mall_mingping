"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let SystemService = class SystemService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConfig(configKey) {
        const config = await this.prisma.systemConfig.findUnique({
            where: { configKey },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Config key "${configKey}" not found`);
        }
        if (config.configType === 'json' && config.configValue) {
            try {
                return {
                    ...config,
                    configValue: JSON.parse(config.configValue),
                };
            }
            catch (error) {
                return config;
            }
        }
        return config;
    }
    async getConfigs(configKeys) {
        const where = configKeys ? { configKey: { in: configKeys } } : undefined;
        const configs = await this.prisma.systemConfig.findMany({
            where,
            orderBy: { configKey: 'asc' },
        });
        return configs.map((config) => {
            if (config.configType === 'json' && config.configValue) {
                try {
                    return {
                        ...config,
                        configValue: JSON.parse(config.configValue),
                    };
                }
                catch (error) {
                    return config;
                }
            }
            return config;
        });
    }
    async getAllConfigs() {
        return this.getConfigs();
    }
    async updateConfig(dto) {
        const { configKey, configValue, configType, description } = dto;
        let finalConfigType = configType;
        let finalConfigValue = configValue;
        if (!finalConfigType) {
            if (typeof configValue === 'object') {
                finalConfigType = 'json';
            }
            else if (typeof configValue === 'number') {
                finalConfigType = 'number';
            }
            else if (typeof configValue === 'boolean') {
                finalConfigType = 'boolean';
            }
            else {
                finalConfigType = 'text';
            }
        }
        if (finalConfigType === 'json' && typeof configValue === 'object') {
            finalConfigValue = JSON.stringify(configValue);
        }
        else {
            finalConfigValue = String(configValue);
        }
        return this.prisma.systemConfig.upsert({
            where: { configKey },
            create: {
                configKey,
                configValue: finalConfigValue,
                configType: finalConfigType,
                description,
            },
            update: {
                configValue: finalConfigValue,
                configType: finalConfigType,
                description,
            },
        });
    }
    async deleteConfig(configKey) {
        const config = await this.prisma.systemConfig.findUnique({
            where: { configKey },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Config key "${configKey}" not found`);
        }
        return this.prisma.systemConfig.delete({
            where: { configKey },
        });
    }
    async getHomepageConfig() {
        const keys = [
            'homepage_hero_title',
            'homepage_hero_subtitle',
            'homepage_hero_image',
            'homepage_featured_products',
            'homepage_banner_images',
            'homepage_about_section',
        ];
        const configs = await this.getConfigs(keys);
        const result = {};
        configs.forEach((config) => {
            const key = config.configKey.replace('homepage_', '');
            result[key] = config.configValue;
        });
        return result;
    }
    async updateHomepageConfig(data) {
        const updates = [];
        for (const [key, value] of Object.entries(data)) {
            const configKey = `homepage_${key}`;
            updates.push(this.updateConfig({
                configKey,
                configValue: value,
            }));
        }
        await Promise.all(updates);
        return { success: true, message: 'Homepage config updated' };
    }
    async getAboutUsConfig() {
        const keys = [
            'about_company_name_zh',
            'about_company_intro_zh',
            'about_mission_zh',
            'about_vision_zh',
            'about_history_zh',
            'about_team_zh',
            'about_certifications_zh',
            'about_company_name_en',
            'about_company_intro_en',
            'about_mission_en',
            'about_vision_en',
            'about_history_en',
            'about_team_en',
            'about_certifications_en',
            'about_hero_image',
            'about_story_image_1',
            'about_story_image_2',
            'about_factory_images',
            'about_contact_email',
            'about_contact_phone',
            'about_contact_address',
        ];
        const configs = await this.getConfigs(keys);
        const result = {};
        configs.forEach((config) => {
            const key = config.configKey.replace('about_', '');
            result[key] = config.configValue;
        });
        return result;
    }
    async updateAboutUsConfig(data) {
        const updates = [];
        for (const [key, value] of Object.entries(data)) {
            const configKey = `about_${key}`;
            updates.push(this.updateConfig({
                configKey,
                configValue: value,
            }));
        }
        await Promise.all(updates);
        return { success: true, message: 'About Us config updated' };
    }
    async getSiteConfig() {
        const keys = [
            'site_name',
            'site_logo',
            'site_favicon',
            'site_footer_text',
            'site_copyright',
            'site_social_media',
            'site_navigation',
        ];
        const configs = await this.getConfigs(keys);
        const result = {};
        configs.forEach((config) => {
            const key = config.configKey.replace('site_', '');
            result[key] = config.configValue;
        });
        return result;
    }
    async updateSiteConfig(data) {
        const updates = [];
        for (const [key, value] of Object.entries(data)) {
            const configKey = `site_${key}`;
            updates.push(this.updateConfig({
                configKey,
                configValue: value,
            }));
        }
        await Promise.all(updates);
        return { success: true, message: 'Site config updated' };
    }
};
exports.SystemService = SystemService;
exports.SystemService = SystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SystemService);
//# sourceMappingURL=system.service.js.map
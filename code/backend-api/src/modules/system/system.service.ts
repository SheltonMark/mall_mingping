import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { UpdateSystemConfigDto } from './dto/system.dto';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  // Get single config by key
  async getConfig(configKey: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey },
    });

    if (!config) {
      throw new NotFoundException(`Config key "${configKey}" not found`);
    }

    // Parse JSON if configType is json
    if (config.configType === 'json' && config.configValue) {
      try {
        return {
          ...config,
          configValue: JSON.parse(config.configValue),
        };
      } catch (error) {
        // Return as-is if parsing fails
        return config;
      }
    }

    return config;
  }

  // Get multiple configs by keys
  async getConfigs(configKeys?: string[]) {
    const where = configKeys ? { configKey: { in: configKeys } } : undefined;

    const configs = await this.prisma.systemConfig.findMany({
      where,
      orderBy: { configKey: 'asc' },
    });

    // Parse JSON values
    return configs.map((config) => {
      if (config.configType === 'json' && config.configValue) {
        try {
          return {
            ...config,
            configValue: JSON.parse(config.configValue),
          };
        } catch (error) {
          return config;
        }
      }
      return config;
    });
  }

  // Get all configs
  async getAllConfigs() {
    return this.getConfigs();
  }

  // Update or create config
  async updateConfig(dto: UpdateSystemConfigDto) {
    const { configKey, configValue, configType, description } = dto;

    // Determine config type if not provided
    let finalConfigType = configType;
    let finalConfigValue = configValue;

    if (!finalConfigType) {
      if (typeof configValue === 'object') {
        finalConfigType = 'json';
      } else if (typeof configValue === 'number') {
        finalConfigType = 'number';
      } else if (typeof configValue === 'boolean') {
        finalConfigType = 'boolean';
      } else {
        finalConfigType = 'text';
      }
    }

    // Stringify if JSON
    if (finalConfigType === 'json' && typeof configValue === 'object') {
      finalConfigValue = JSON.stringify(configValue);
    } else {
      finalConfigValue = String(configValue);
    }

    // Upsert config
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

  // Delete config
  async deleteConfig(configKey: string) {
    const config = await this.prisma.systemConfig.findUnique({
      where: { configKey },
    });

    if (!config) {
      throw new NotFoundException(`Config key "${configKey}" not found`);
    }

    return this.prisma.systemConfig.delete({
      where: { configKey },
    });
  }

  // ========== Predefined Config Helpers ==========

  // Homepage config
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
    const result: any = {};

    configs.forEach((config) => {
      const key = config.configKey.replace('homepage_', '');
      result[key] = config.configValue;
    });

    return result;
  }

  async updateHomepageConfig(data: any) {
    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(data)) {
      const configKey = `homepage_${key}`;
      updates.push(
        this.updateConfig({
          configKey,
          configValue: value,
        }),
      );
    }

    await Promise.all(updates);
    return { success: true, message: 'Homepage config updated' };
  }

  // About Us config
  async getAboutUsConfig() {
    const keys = [
      // 中文字段
      'about_company_name_zh',
      'about_company_intro_zh',
      'about_mission_zh',
      'about_vision_zh',
      'about_history_zh',
      'about_team_zh',
      'about_certifications_zh',
      // 英文字段
      'about_company_name_en',
      'about_company_intro_en',
      'about_mission_en',
      'about_vision_en',
      'about_history_en',
      'about_team_en',
      'about_certifications_en',
      // 图片字段
      'about_hero_image',
      'about_story_image_1',
      'about_story_image_2',
      'about_factory_images', // JSON array
      // 联系方式（不需要分语言）
      'about_contact_email',
      'about_contact_phone',
      'about_contact_address',
    ];

    const configs = await this.getConfigs(keys);
    const result: any = {};

    configs.forEach((config) => {
      const key = config.configKey.replace('about_', '');
      result[key] = config.configValue;
    });

    return result;
  }

  async updateAboutUsConfig(data: any) {
    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(data)) {
      const configKey = `about_${key}`;
      updates.push(
        this.updateConfig({
          configKey,
          configValue: value,
        }),
      );
    }

    await Promise.all(updates);
    return { success: true, message: 'About Us config updated' };
  }

  // General site config
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
    const result: any = {};

    configs.forEach((config) => {
      const key = config.configKey.replace('site_', '');
      result[key] = config.configValue;
    });

    return result;
  }

  async updateSiteConfig(data: any) {
    const updates: Promise<any>[] = [];

    for (const [key, value] of Object.entries(data)) {
      const configKey = `site_${key}`;
      updates.push(
        this.updateConfig({
          configKey,
          configValue: value,
        }),
      );
    }

    await Promise.all(updates);
    return { success: true, message: 'Site config updated' };
  }
}

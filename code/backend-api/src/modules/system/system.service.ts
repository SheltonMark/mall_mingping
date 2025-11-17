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
      'homepage_hero_images', // 轮播图数组(最多6张)
      'homepage_featured_products',
      'homepage_banner_images',
      'homepage_about_section',
      'homepage_certificates', // 证书图片数组(最多6张)
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
      // Hero区域
      'about_hero_image',
      'about_hero_title_line1_en',
      'about_hero_title_line1_zh',
      'about_hero_title_line2_en',
      'about_hero_title_line2_zh',
      'about_hero_subtitle_en',
      'about_hero_subtitle_zh',
      // 品牌故事 - 第一组
      'about_story1_image',
      'about_story1_title_en',
      'about_story1_title_zh',
      'about_story1_desc1_en',
      'about_story1_desc1_zh',
      'about_story1_desc2_en',
      'about_story1_desc2_zh',
      // 品牌故事 - 第二组
      'about_story2_image',
      'about_story2_title_en',
      'about_story2_title_zh',
      'about_story2_desc1_en',
      'about_story2_desc1_zh',
      'about_story2_desc2_en',
      'about_story2_desc2_zh',
      // 工厂展示区 (支持视频/图片)
      'about_factory_carousel', // JSON array
      // 联系方式
      'about_contact_email',
      'about_contact_phone',
      'about_contact_address_en',
      'about_contact_address_zh',
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
      'site_social_media', // JSON object: { facebook, twitter, instagram, linkedin, youtube, email }
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

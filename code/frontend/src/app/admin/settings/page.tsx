'use client';

import { useEffect, useState } from 'react';
import { systemApi, uploadApi } from '@/lib/adminApi';

type TabType = 'homepage' | 'about' | 'site';

interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

interface AboutConfig {
  title?: string;
  content?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  images?: string[];
}

interface SiteConfig {
  siteName?: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('homepage');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>({});
  const [aboutConfig, setAboutConfig] = useState<AboutConfig>({});
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'homepage') {
        const data = await systemApi.getHomepage();
        setHomepageConfig(data || {});
      } else if (activeTab === 'about') {
        const data = await systemApi.getAbout();
        setAboutConfig(data || {});
      } else if (activeTab === 'site') {
        const data = await systemApi.getSite();
        setSiteConfig(data || {});
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (activeTab === 'homepage') {
        await systemApi.updateHomepage(homepageConfig);
        alert('首页配置保存成功');
      } else if (activeTab === 'about') {
        await systemApi.updateAbout(aboutConfig);
        alert('关于我们配置保存成功');
      } else if (activeTab === 'site') {
        await systemApi.updateSite(siteConfig);
        alert('站点配置保存成功');
      }
    } catch (error: any) {
      console.error('Failed to save config:', error);
      alert(error.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { key: 'homepage', label: '首页配置', icon: '🏠' },
    { key: 'about', label: '关于我们', icon: 'ℹ️' },
    { key: 'site', label: '站点设置', icon: '⚙️' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">系统配置</h1>
        <p className="text-gray-600 mt-1">配置网站首页、关于我们和站点信息</p>
      </div>

      {/* 标签页 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">加载中...</div>
            </div>
          ) : (
            <>
              {activeTab === 'homepage' && (
                <HomepageTab config={homepageConfig} setConfig={setHomepageConfig} />
              )}
              {activeTab === 'about' && (
                <AboutTab config={aboutConfig} setConfig={setAboutConfig} />
              )}
              {activeTab === 'site' && (
                <SiteTab config={siteConfig} setConfig={setSiteConfig} />
              )}

              <div className="flex justify-end pt-6 border-t mt-6">
                <button
                  onClick={handleSave}
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {submitting ? '保存中...' : '💾 保存配置'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 首页配置组件
function HomepageTab({ config, setConfig }: { config: HomepageConfig; setConfig: (config: HomepageConfig) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          首页标题
        </label>
        <input
          type="text"
          value={config.heroTitle || ''}
          onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="欢迎来到LEMOPX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          首页副标题
        </label>
        <input
          type="text"
          value={config.heroSubtitle || ''}
          onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="专业的B2B电商解决方案"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          首页图片URL
        </label>
        <input
          type="text"
          value={config.heroImage || ''}
          onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="/images/hero.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">支持相对路径或完整URL</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          💡 更多首页配置功能（特色功能列表、合作伙伴等）将在后续版本中添加
        </div>
      </div>
    </div>
  );
}

// 关于我们配置组件
function AboutTab({ config, setConfig }: { config: AboutConfig; setConfig: (config: AboutConfig) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          页面标题
        </label>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => setConfig({ ...config, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="关于LEMOPX"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司简介
        </label>
        <textarea
          value={config.content || ''}
          onChange={(e) => setConfig({ ...config, content: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="介绍公司的历史、业务范围等..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司使命
        </label>
        <textarea
          value={config.mission || ''}
          onChange={(e) => setConfig({ ...config, mission: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="我们的使命是..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司愿景
        </label>
        <textarea
          value={config.vision || ''}
          onChange={(e) => setConfig({ ...config, vision: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="我们的愿景是..."
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          💡 更多配置选项（公司价值观、团队介绍、图片上传等）将在后续版本中添加
        </div>
      </div>
    </div>
  );
}

// 站点设置组件
function SiteTab({ config, setConfig }: { config: SiteConfig; setConfig: (config: SiteConfig) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            站点名称
          </label>
          <input
            type="text"
            value={config.siteName || ''}
            onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="LEMOPX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            联系电话
          </label>
          <input
            type="tel"
            value={config.contactPhone || ''}
            onChange={(e) => setConfig({ ...config, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+86 123-4567-8901"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            联系邮箱
          </label>
          <input
            type="email"
            value={config.contactEmail || ''}
            onChange={(e) => setConfig({ ...config, contactEmail: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="contact@lemopx.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          站点描述
        </label>
        <textarea
          value={config.siteDescription || ''}
          onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="专业的B2B电商平台..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          公司地址
        </label>
        <textarea
          value={config.address || ''}
          onChange={(e) => setConfig({ ...config, address: e.target.value })}
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="中国广东省深圳市..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          社交媒体链接
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Facebook</label>
            <input
              type="url"
              value={config.socialMedia?.facebook || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, facebook: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Twitter</label>
            <input
              type="url"
              value={config.socialMedia?.twitter || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, twitter: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://twitter.com/..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">LinkedIn</label>
            <input
              type="url"
              value={config.socialMedia?.linkedin || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, linkedin: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/..."
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Instagram</label>
            <input
              type="url"
              value={config.socialMedia?.instagram || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, instagram: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { systemApi, uploadApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';

type TabType = 'homepage' | 'about' | 'site';

interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  hero_image?: string;
  features?: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  featured_products?: Array<{
    title: string;
    description: string;
    image: string;
    link: string;
  }>;
}

interface AboutConfig {
  title?: string;
  content?: string;
  mission?: string;
  vision?: string;
  values?: string[];
  images?: string[];
  // 图片字段
  hero_image?: string;
  story_image_1?: string;
  story_image_2?: string;
  factory_images?: string[] | string;
  // 中英文字段
  company_name_zh?: string;
  company_name_en?: string;
  company_intro_zh?: string;
  company_intro_en?: string;
  mission_zh?: string;
  mission_en?: string;
  vision_zh?: string;
  vision_en?: string;
  history_zh?: string;
  history_en?: string;
  team_zh?: string;
  team_en?: string;
  certifications_zh?: string;
  certifications_en?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
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
  const toast = useToast();
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
        toast.success('首页配置保存成功');
      } else if (activeTab === 'about') {
        await systemApi.updateAbout(aboutConfig);
        toast.success('关于我们配置保存成功');
      } else if (activeTab === 'site') {
        await systemApi.updateSite(siteConfig);
        toast.success('站点配置保存成功');
      }
    } catch (error: any) {
      console.error('Failed to save config:', error);
      toast.error(error.message || '保存失败');
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
                  {submitting ? <ButtonLoader /> : '💾 保存配置'}
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
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [productSkus, setProductSkus] = useState<any[]>([]);
  const [searchTexts, setSearchTexts] = useState<string[]>(['', '', '', '']); // 每个产品位置的搜索文本
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false, false, false, false]); // 控制下拉框显示

  // 加载所有SKU列表（用于路由选择）
  useEffect(() => {
    const loadProductSkus = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/skus?limit=200`);
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded SKUs:', data);
          setProductSkus(data.data || []);
        }
      } catch (error) {
        console.error('Failed to load product SKUs:', error);
      }
    };
    loadProductSkus();
  }, []);

  // 初始化精选产品（如果不存在）
  const featuredProducts = config.featured_products || [
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
  ];

  // 更新精选产品
  const updateFeaturedProduct = (index: number, field: string, value: string) => {
    const newProducts = [...featuredProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setConfig({ ...config, featured_products: newProducts });
  };

  // 更新搜索文本
  const updateSearchText = (index: number, value: string) => {
    const newSearchTexts = [...searchTexts];
    newSearchTexts[index] = value;
    setSearchTexts(newSearchTexts);

    // 显示下拉框
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = true;
    setShowDropdowns(newShowDropdowns);
  };

  // 选择SKU
  const selectSku = (index: number, sku: any) => {
    updateFeaturedProduct(index, 'link', `/products/${sku.groupId}`);

    // 更新搜索框显示为选中的SKU
    const newSearchTexts = [...searchTexts];
    newSearchTexts[index] = `${sku.productCode} - ${sku.productName}`;
    setSearchTexts(newSearchTexts);

    // 隐藏下拉框
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = false;
    setShowDropdowns(newShowDropdowns);
  };

  // 过滤SKU列表
  const getFilteredSkus = (index: number) => {
    const searchText = searchTexts[index].toLowerCase();
    if (!searchText) return productSkus;

    return productSkus.filter(sku =>
      sku.productCode.toLowerCase().includes(searchText) ||
      sku.productName.toLowerCase().includes(searchText)
    );
  };

  // 上传精选产品图片
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      updateFeaturedProduct(index, 'image', result.url);
      toast.success('图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 上传Hero图片
  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    // 验证文件大小（限制5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, hero_image: result.url });
      toast.success('首屏图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 首屏区域</h3>
        <div className="space-y-4">
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

          {/* Hero Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              首屏Hero图片
            </label>
            {config.hero_image ? (
              <div className="relative">
                <img
                  src={config.hero_image.startsWith('http') ? config.hero_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${config.hero_image}`}
                  alt="Hero"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setConfig({ ...config, hero_image: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  删除
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white">
                <div className="text-center">
                  <div className="text-4xl text-gray-400 mb-2">📷</div>
                  <div className="text-sm text-gray-600 font-medium mb-1">
                    {uploading ? '上传中...' : '点击上传首屏图片'}
                  </div>
                  <div className="text-xs text-gray-500">
                    支持 JPG、PNG、WebP，最大5MB
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    建议尺寸：1920x1080 或更大
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleHeroImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ 首页精选产品系列（2x2 网格）</h3>
        <p className="text-sm text-gray-600 mb-6">配置首页展示的4个精选产品卡片，用户点击后将跳转到对应的产品系列详情页</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProducts.map((product, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">产品 {index + 1}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {index === 0 && '左上'}{index === 1 && '右上'}{index === 2 && '左下'}{index === 3 && '右下'}
                </span>
              </div>

              <div className="space-y-4">
                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品图片 <span className="text-red-500">*</span>
                  </label>
                  {product.image ? (
                    <div className="relative">
                      <img
                        src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.image}`}
                        alt={`Product ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => updateFeaturedProduct(index, 'image', '')}
                        className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-white">
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">📷</div>
                        <div className="text-sm text-gray-600 font-medium mb-1">
                          {uploading ? '上传中...' : '点击上传图片'}
                        </div>
                        <div className="text-xs text-gray-500">
                          支持 JPG、PNG、WebP，最大5MB
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={(e) => handleProductImageUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>

                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品标题 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={product.title}
                    onChange={(e) => updateFeaturedProduct(index, 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：MF007-清洁四件套"
                  />
                </div>

                {/* 描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品描述 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateFeaturedProduct(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：专业级别清洁工具，适用于多种场景"
                  />
                </div>

                {/* 跳转路由选择 - 可搜索下拉框 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择跳转产品 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTexts[index]}
                      onChange={(e) => updateSearchText(index, e.target.value)}
                      onFocus={() => {
                        const newShowDropdowns = [...showDropdowns];
                        newShowDropdowns[index] = true;
                        setShowDropdowns(newShowDropdowns);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="输入产品编号或名称搜索..."
                    />
                    {showDropdowns[index] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {getFilteredSkus(index).length > 0 ? (
                          getFilteredSkus(index).map((sku) => (
                            <div
                              key={sku.id}
                              onClick={() => selectSku(index, sku)}
                              className="px-4 py-2 hover:bg-blue-50 cursor-pointer transition-colors"
                            >
                              <div className="font-medium text-gray-900">{sku.productCode}</div>
                              <div className="text-sm text-gray-600">{sku.productName}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            没有找到匹配的产品
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {product.link && (
                    <p className="text-xs text-gray-500 mt-1">
                      已选择：{product.link}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    选择产品后，点击卡片将跳转到该产品系列详情页
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">💡</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">配置提示：</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>建议图片尺寸：1200x800 像素或更大，保持3:2比例</li>
                <li>图片会自动裁剪适配卡片，建议主体居中</li>
                <li>产品标题建议控制在20字以内，描述在50字以内</li>
                <li>只支持本地图片上传（JPG/PNG/WebP格式，最大5MB）</li>
                <li>跳转链接自动从产品库中加载，如没有所需产品请先在"产品管理"中创建</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 关于我们配置组件
function AboutTab({ config, setConfig }: { config: AboutConfig; setConfig: (config: AboutConfig) => void }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AboutConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, [fieldName]: result.url });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 处理多图片上传（工厂图片）
  const handleMultiImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      const result = await uploadApi.uploadMultiple(Array.from(files), 'image');
      const urls = result.urls || [];

      const currentImages = Array.isArray(config.factory_images)
        ? config.factory_images
        : config.factory_images
          ? JSON.parse(config.factory_images as string)
          : [];

      setConfig({ ...config, factory_images: [...currentImages, ...urls] });
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除工厂图片
  const handleRemoveFactoryImage = (index: number) => {
    const currentImages = Array.isArray(config.factory_images)
      ? config.factory_images
      : config.factory_images
        ? JSON.parse(config.factory_images as string)
        : [];
    const newImages = currentImages.filter((_: string, i: number) => i !== index);
    setConfig({ ...config, factory_images: newImages });
  };

  // 获取工厂图片数组
  const getFactoryImages = () => {
    if (Array.isArray(config.factory_images)) {
      return config.factory_images;
    }
    if (typeof config.factory_images === 'string') {
      try {
        return JSON.parse(config.factory_images);
      } catch {
        return [];
      }
    }
    return [];
  };

  return (
    <div className="space-y-8">
      {/* 中文内容区 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🇨🇳 中文内容</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司名称（中文）</label>
              <input
                type="text"
                value={config.company_name_zh || ''}
                onChange={(e) => setConfig({ ...config, company_name_zh: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例：乐模科技"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公司简介（中文）</label>
            <textarea
              value={config.company_intro_zh || ''}
              onChange={(e) => setConfig({ ...config, company_intro_zh: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="介绍公司的历史、业务范围等..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司使命（中文）</label>
              <textarea
                value={config.mission_zh || ''}
                onChange={(e) => setConfig({ ...config, mission_zh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="我们的使命是..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">公司愿景（中文）</label>
              <textarea
                value={config.vision_zh || ''}
                onChange={(e) => setConfig({ ...config, vision_zh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="我们的愿景是..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发展历程（中文）</label>
            <textarea
              value={config.history_zh || ''}
              onChange={(e) => setConfig({ ...config, history_zh: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="公司发展历程..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">团队介绍（中文）</label>
              <textarea
                value={config.team_zh || ''}
                onChange={(e) => setConfig({ ...config, team_zh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="团队介绍..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">资质认证（中文）</label>
              <textarea
                value={config.certifications_zh || ''}
                onChange={(e) => setConfig({ ...config, certifications_zh: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="资质认证..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 英文内容区 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🇬🇧 English Content</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name (EN)</label>
              <input
                type="text"
                value={config.company_name_en || ''}
                onChange={(e) => setConfig({ ...config, company_name_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., LEMOPX Technology"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Introduction (EN)</label>
            <textarea
              value={config.company_intro_en || ''}
              onChange={(e) => setConfig({ ...config, company_intro_en: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company history, business scope, etc..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mission (EN)</label>
              <textarea
                value={config.mission_en || ''}
                onChange={(e) => setConfig({ ...config, mission_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Our mission is..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vision (EN)</label>
              <textarea
                value={config.vision_en || ''}
                onChange={(e) => setConfig({ ...config, vision_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Our vision is..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">History (EN)</label>
            <textarea
              value={config.history_en || ''}
              onChange={(e) => setConfig({ ...config, history_en: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Company development history..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team (EN)</label>
              <textarea
                value={config.team_en || ''}
                onChange={(e) => setConfig({ ...config, team_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Team introduction..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certifications (EN)</label>
              <textarea
                value={config.certifications_en || ''}
                onChange={(e) => setConfig({ ...config, certifications_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Certifications..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 图片配置区 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📸 图片配置</h3>
        <div className="space-y-6">
          {/* Hero Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              首屏大图 (Hero Image)
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={config.hero_image || ''}
                  onChange={(e) => setConfig({ ...config, hero_image: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="图片URL或路径"
                />
              </div>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                {uploading ? '上传中...' : '上传图片'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'hero_image')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {config.hero_image && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <img src={config.hero_image} alt="Hero" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* Story Image 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故事图片 1 (Story Image 1)
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={config.story_image_1 || ''}
                  onChange={(e) => setConfig({ ...config, story_image_1: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="图片URL或路径"
                />
              </div>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                {uploading ? '上传中...' : '上传图片'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'story_image_1')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {config.story_image_1 && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <img src={config.story_image_1} alt="Story 1" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* Story Image 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              故事图片 2 (Story Image 2)
            </label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={config.story_image_2 || ''}
                  onChange={(e) => setConfig({ ...config, story_image_2: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="图片URL或路径"
                />
              </div>
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                {uploading ? '上传中...' : '上传图片'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'story_image_2')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {config.story_image_2 && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
                <img src={config.story_image_2} alt="Story 2" className="w-full h-48 object-cover" />
              </div>
            )}
          </div>

          {/* Factory Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              工厂图片轮播 (Factory Images)
            </label>
            <div className="flex items-center gap-4 mb-3">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                {uploading ? '上传中...' : '+ 添加图片'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultiImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <span className="text-sm text-gray-500">可同时选择多张图片上传</span>
            </div>
            {getFactoryImages().length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getFactoryImages().map((img: string, index: number) => (
                  <div key={index} className="relative border border-gray-200 rounded-lg overflow-hidden group">
                    <img src={img} alt={`Factory ${index + 1}`} className="w-full h-32 object-cover" />
                    <button
                      onClick={() => handleRemoveFactoryImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 联系方式配置 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📞 联系方式</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系邮箱</label>
            <input
              type="email"
              value={config.contact_email || ''}
              onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系电话</label>
            <input
              type="tel"
              value={config.contact_phone || ''}
              onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+86 123-4567-8901"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">联系地址</label>
            <input
              type="text"
              value={config.contact_address || ''}
              onChange={(e) => setConfig({ ...config, contact_address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="公司地址"
            />
          </div>
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

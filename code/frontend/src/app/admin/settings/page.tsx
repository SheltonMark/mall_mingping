'use client';

import { useEffect, useState } from 'react';
import { systemApi, uploadApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import PageHeader from '@/components/admin/PageHeader';

type TabType = 'homepage' | 'about' | 'site';

interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  hero_image?: string;
  hero_images?: string[]; // 轮播图数组(最多6张)
  certificates?: Array<{
    image: string;
    label_zh?: string;
    label_en?: string;
  }>; // 证书数组(最多6张，支持中英文标签)
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
  // Hero区域
  hero_image?: string;
  hero_title_line1_en?: string;
  hero_title_line1_zh?: string;
  hero_title_line2_en?: string;
  hero_title_line2_zh?: string;
  hero_subtitle_en?: string;
  hero_subtitle_zh?: string;

  // 品牌故事 - 第一组
  story1_image?: string;
  story1_title_en?: string;
  story1_title_zh?: string;
  story1_desc1_en?: string;
  story1_desc1_zh?: string;
  story1_desc2_en?: string;
  story1_desc2_zh?: string;

  // 品牌故事 - 第二组
  story2_image?: string;
  story2_title_en?: string;
  story2_title_zh?: string;
  story2_desc1_en?: string;
  story2_desc1_zh?: string;
  story2_desc2_en?: string;
  story2_desc2_zh?: string;

  // 工厂展示区 (支持视频/图片)
  factory_carousel?: Array<{
    media_type: 'image' | 'video';
    media_url: string;
    label_en: string;
    label_zh: string;
    video_autoplay?: boolean;
    video_loop?: boolean;
    video_muted?: boolean;
  }> | string;

  // 联系方式
  contact_email?: string;
  contact_phone?: string;
  contact_address_en?: string;
  contact_address_zh?: string;
}

interface SiteConfig {
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
    email?: string;
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
    <div className="space-y-6">
      {/* 页面标题 */}
      <PageHeader
        title="系统配置"
        subtitle="配置网站首页、关于我们和站点信息"
      />

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
            </>
          )}
        </div>
      </div>

      {/* 粘性底部按钮栏 */}
      {!loading && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {submitting ? <ButtonLoader /> : '💾 保存配置'}
              </button>
            </div>
          </div>
        </div>
      )}
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

  // 当SKU列表和配置都加载完成后，初始化搜索文本（反显已选择的产品）
  useEffect(() => {
    if (productSkus.length > 0 && config.featured_products) {
      const featured = parseFeaturedProducts();
      const newSearchTexts = featured.map((product: any) => {
        if (product.link) {
          // 从 link 中提取 groupId，格式: /products/123
          const match = product.link.match(/\/products\/(.+)/);
          if (match && match[1]) {
            const groupId = match[1];
            // 找到第一个匹配该 groupId 的 SKU
            const sku = productSkus.find(s => s.groupId === groupId);
            if (sku) {
              return `${sku.group?.prefix || sku.productCode} - ${sku.productName}`;
            }
          }
        }
        return '';
      });
      setSearchTexts(newSearchTexts);
    }
  }, [productSkus, config.featured_products]);

  // 初始化精选产品（如果不存在）
  const parseFeaturedProducts = () => {
    if (!config.featured_products) {
      return [
        { title: '', description: '', image: '', link: '' },
        { title: '', description: '', image: '', link: '' },
        { title: '', description: '', image: '', link: '' },
        { title: '', description: '', image: '', link: '' },
      ];
    }

    // 如果是字符串,解析它
    if (typeof config.featured_products === 'string') {
      try {
        return JSON.parse(config.featured_products);
      } catch (e) {
        console.error('Failed to parse featured_products:', e);
        return [
          { title: '', description: '', image: '', link: '' },
          { title: '', description: '', image: '', link: '' },
          { title: '', description: '', image: '', link: '' },
          { title: '', description: '', image: '', link: '' },
        ];
      }
    }

    // 如果已经是数组,直接返回
    return config.featured_products;
  };

  const featuredProducts = parseFeaturedProducts();

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

    // 更新搜索框显示为选中的SKU（使用group的prefix）
    const newSearchTexts = [...searchTexts];
    newSearchTexts[index] = `${sku.group?.prefix || sku.productCode} - ${sku.productName}`;
    setSearchTexts(newSearchTexts);

    // 隐藏下拉框
    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = false;
    setShowDropdowns(newShowDropdowns);
  };

  // 过滤SKU列表（支持按prefix或productCode或productName搜索）
  const getFilteredSkus = (index: number) => {
    const searchText = searchTexts[index].toLowerCase();
    if (!searchText) return productSkus;

    return productSkus.filter(sku =>
      (sku.group?.prefix && sku.group.prefix.toLowerCase().includes(searchText)) ||
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

  // 上传Hero轮播图
  const handleHeroCarouselUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    const currentImages = config.hero_images || [];
    if (currentImages.length >= 6) {
      toast.error('最多只能上传6张轮播图');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, hero_images: [...currentImages, result.url] });
      toast.success('轮播图上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除Hero轮播图
  const handleDeleteHeroCarouselImage = (index: number) => {
    const newImages = (config.hero_images || []).filter((_, i) => i !== index);
    setConfig({ ...config, hero_images: newImages });
    toast.success('轮播图已删除');
  };

  // 上传证书图片
  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    const currentCerts = config.certificates || [];
    if (currentCerts.length >= 6) {
      toast.error('最多只能上传6张证书图片');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, certificates: [...currentCerts, { image: result.url, label_zh: '', label_en: '' }] });
      toast.success('证书图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };


  // 更新证书标签
  const updateCertificateLabel = (index: number, field: 'label_zh' | 'label_en', value: string) => {
    const newCerts = [...(config.certificates || [])];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setConfig({ ...config, certificates: newCerts });
  };

  // 删除证书图片
  const handleDeleteCertificate = (index: number) => {
    const newCerts = (config.certificates || []).filter((_, i) => i !== index);
    setConfig({ ...config, certificates: newCerts });
    toast.success('证书图片已删除');
  };

  return (
    <div className="space-y-8">
      {/* Hero 轮播图 - 替代单张Hero图片 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎠 Hero 轮播图</h3>
        <p className="text-sm text-gray-600 mb-4">首页Hero区域的轮播图片集（最多6张）</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(config.hero_images || []).map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                  alt={`Hero ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => handleDeleteHeroCarouselImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/6
                </div>
              </div>
            ))}
            {(!config.hero_images || config.hero_images.length < 6) && (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-sm font-medium text-gray-700">
                    {uploading ? '上传中...' : '添加轮播图'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {config.hero_images?.length || 0}/6
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroCarouselUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* 证书认证 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 证书认证</h3>
        <p className="text-sm text-gray-600 mb-4">展示企业资质和产品认证证书（最多6张），支持悬停显示中英文说明</p>
        <div className="space-y-4">
          {(config.certificates || []).map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">证书 {index + 1}</h4>
                <button
                  onClick={() => handleDeleteCertificate(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <img
                    src={cert.image.startsWith('http') ? cert.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${cert.image}`}
                    alt={`证书 ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🇨🇳 中文标签
                    </label>
                    <input
                      type="text"
                      value={cert.label_zh || ''}
                      onChange={(e) => updateCertificateLabel(index, 'label_zh', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="例：ISO 9001质量管理体系认证"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🇬🇧 英文标签
                    </label>
                    <input
                      type="text"
                      value={cert.label_en || ''}
                      onChange={(e) => updateCertificateLabel(index, 'label_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      placeholder="e.g., ISO 9001 Quality Management"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(!config.certificates || config.certificates.length < 6) && (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
              <div className="text-center">
                <div className="text-4xl mb-2">🏅</div>
                <div className="text-sm font-medium text-gray-700">
                  {uploading ? '上传中...' : '添加证书'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {config.certificates?.length || 0}/6
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleCertificateUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Featured Products Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ 首页精选产品系列（2x2 网格）</h3>
        <p className="text-sm text-gray-600 mb-6">配置首页展示的4个精选产品卡片，用户点击后将跳转到对应的产品系列详情页</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProducts.map((product: any, index: number) => (
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
                    产品描述(中文) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={product.description}
                    onChange={(e) => updateFeaturedProduct(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="例：专业级别清洁工具，适用于多种场景"
                  />
                </div>

                {/* 英文标题 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品标题(英文)
                  </label>
                  <input
                    type="text"
                    value={product.title_en || ''}
                    onChange={(e) => updateFeaturedProduct(index, 'title_en', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Example: Professional Cleaning Kit"
                  />
                </div>

                {/* 英文描述 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品描述(英文)
                  </label>
                  <textarea
                    value={product.description_en || ''}
                    onChange={(e) => updateFeaturedProduct(index, 'description_en', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Example: Professional-grade cleaning tools for various scenarios"
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
                              <div className="font-medium text-gray-900">{sku.group?.prefix || sku.productCode}</div>
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

// 关于我们配置组件 - 新版本
function AboutTab({ config, setConfig }: { config: AboutConfig; setConfig: (config: AboutConfig) => void }) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  // 通用图片上传处理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof AboutConfig) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'image');
      setConfig({ ...config, [fieldName]: result.url });
      toast.success('图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 通用视频上传处理
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, carouselIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('请上传视频文件');
      e.target.value = ''; // 重置input
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('视频大小不能超过50MB');
      e.target.value = ''; // 重置input
      return;
    }

    try {
      setUploading(true);
      const result = await uploadApi.uploadSingle(file, 'video');

      const carousel = [...getFactoryCarousel()]; // 创建新数组
      carousel[carouselIndex] = {
        ...carousel[carouselIndex],
        media_type: 'video',
        media_url: result.url,
      };
      // 强制更新config触发重新渲染
      const newConfig = { ...config, factory_carousel: [...carousel] };
      setConfig(newConfig);
      console.log('视频上传成功，新配置:', newConfig);
      toast.success('视频上传成功');
      e.target.value = ''; // 重置input以允许重新选择同一文件
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '视频上传失败');
      e.target.value = ''; // 重置input
    } finally {
      setUploading(false);
    }
  };

  // 获取工厂轮播数组
  const getFactoryCarousel = () => {
    if (Array.isArray(config.factory_carousel)) {
      return config.factory_carousel;
    }
    if (typeof config.factory_carousel === 'string') {
      try {
        return JSON.parse(config.factory_carousel);
      } catch {
        return [];
      }
    }
    return [];
  };

  // 构建媒体文件完整URL
  const getMediaUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // uploads目录通过后端static serve，直接返回相对路径即可
    // Nginx会将/uploads代理到后端的uploads目录
    return url;
  };

  // 添加轮播项
  const addCarouselItem = () => {
    const carousel = getFactoryCarousel();
    if (carousel.length >= 6) {
      toast.warning('最多支持6个轮播项');
      return;
    }
    carousel.push({
      media_type: 'image',
      media_url: '',
      label_en: '',
      label_zh: '',
      video_autoplay: true,
      video_loop: true,
      video_muted: true,
    });
    setConfig({ ...config, factory_carousel: carousel });
  };

  // 删除轮播项
  const removeCarouselItem = (index: number) => {
    const carousel = [...getFactoryCarousel()]; // 创建新数组
    carousel.splice(index, 1);
    setConfig({ ...config, factory_carousel: carousel });
  };

  // 更新轮播项
  const updateCarouselItem = (index: number, field: string, value: any) => {
    const carousel = [...getFactoryCarousel()]; // 创建新数组
    carousel[index] = { ...carousel[index], [field]: value };
    setConfig({ ...config, factory_carousel: carousel });
  };

  return (
    <div className="space-y-8 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
      {/* Hero区域配置 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 1. Hero区域配置</h3>

        {/* Hero背景图 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero背景图</label>
          {config.hero_image ? (
            <div className="relative">
              <img
                src={config.hero_image.startsWith('http') ? config.hero_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${config.hero_image}`}
                alt="Hero"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setConfig({ ...config, hero_image: '' })}
                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
              >
                删除
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
              <div className="text-center">
                <div className="text-4xl mb-2">📷</div>
                <div className="text-sm text-gray-600">{uploading ? '上传中...' : '点击上传背景图'}</div>
                <div className="text-xs text-gray-500 mt-1">建议尺寸: 1920x1080</div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'hero_image')}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {/* 主标题第一行 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 主标题第一行 (English)</label>
            <input
              type="text"
              value={config.hero_title_line1_en || ''}
              onChange={(e) => setConfig({ ...config, hero_title_line1_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Crafting Tomorrow's"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 主标题第一行 (中文)</label>
            <input
              type="text"
              value={config.hero_title_line1_zh || ''}
              onChange={(e) => setConfig({ ...config, hero_title_line1_zh: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="匠心打造"
            />
          </div>
        </div>

        {/* 主标题第二行 (金色斜体) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 主标题第二行 (金色斜体)</label>
            <input
              type="text"
              value={config.hero_title_line2_en || ''}
              onChange={(e) => setConfig({ ...config, hero_title_line2_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Cleaning Solutions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 主标题第二行 (金色斜体)</label>
            <input
              type="text"
              value={config.hero_title_line2_zh || ''}
              onChange={(e) => setConfig({ ...config, hero_title_line2_zh: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="清洁方案"
            />
          </div>
        </div>

        {/* 副标题 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 副标题</label>
            <input
              type="text"
              value={config.hero_subtitle_en || ''}
              onChange={(e) => setConfig({ ...config, hero_subtitle_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Professional cleaning tools manufacturer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 副标题</label>
            <input
              type="text"
              value={config.hero_subtitle_zh || ''}
              onChange={(e) => setConfig({ ...config, hero_subtitle_zh: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="专业清洁工具制造商"
            />
          </div>
        </div>
      </div>

      {/* 品牌故事区配置 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 2. 品牌故事区配置</h3>

        {/* 第一组 */}
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">第一组 - 工匠精神</h4>

          {/* 配图 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">配图</label>
            {config.story1_image ? (
              <div className="relative">
                <img
                  src={config.story1_image.startsWith('http') ? config.story1_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${config.story1_image}`}
                  alt="Story 1"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => setConfig({ ...config, story1_image: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
                <div className="text-center">
                  <div className="text-3xl mb-1">📷</div>
                  <div className="text-sm text-gray-600">{uploading ? '上传中...' : '点击上传'}</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'story1_image')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* 标题 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 标题</label>
              <input
                type="text"
                value={config.story1_title_en || ''}
                onChange={(e) => setConfig({ ...config, story1_title_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Craftsmanship Excellence"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 标题</label>
              <input
                type="text"
                value={config.story1_title_zh || ''}
                onChange={(e) => setConfig({ ...config, story1_title_zh: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="工匠精神"
              />
            </div>
          </div>

          {/* 介绍段落1 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 介绍段落1</label>
              <textarea
                value={config.story1_desc1_en || ''}
                onChange={(e) => setConfig({ ...config, story1_desc1_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Since 1995..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 介绍段落1</label>
              <textarea
                value={config.story1_desc1_zh || ''}
                onChange={(e) => setConfig({ ...config, story1_desc1_zh: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="自1995年以来..."
              />
            </div>
          </div>

          {/* 介绍段落2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 介绍段落2</label>
              <textarea
                value={config.story1_desc2_en || ''}
                onChange={(e) => setConfig({ ...config, story1_desc2_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Our mission is..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 介绍段落2</label>
              <textarea
                value={config.story1_desc2_zh || ''}
                onChange={(e) => setConfig({ ...config, story1_desc2_zh: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="我们的使命是..."
              />
            </div>
          </div>
        </div>

        {/* 第二组 - 同样的结构 */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-4">第二组 - 工厂直供</h4>

          {/* 配图 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">配图</label>
            {config.story2_image ? (
              <div className="relative">
                <img
                  src={config.story2_image.startsWith('http') ? config.story2_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${config.story2_image}`}
                  alt="Story 2"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <button
                  onClick={() => setConfig({ ...config, story2_image: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                >
                  删除
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
                <div className="text-center">
                  <div className="text-3xl mb-1">📷</div>
                  <div className="text-sm text-gray-600">{uploading ? '上传中...' : '点击上传'}</div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'story2_image')}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* 标题 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 标题</label>
              <input
                type="text"
                value={config.story2_title_en || ''}
                onChange={(e) => setConfig({ ...config, story2_title_en: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Factory Direct Supply"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 标题</label>
              <input
                type="text"
                value={config.story2_title_zh || ''}
                onChange={(e) => setConfig({ ...config, story2_title_zh: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="工厂直供"
              />
            </div>
          </div>

          {/* 介绍段落1 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 介绍段落1</label>
              <textarea
                value={config.story2_desc1_en || ''}
                onChange={(e) => setConfig({ ...config, story2_desc1_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Direct from factory..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 介绍段落1</label>
              <textarea
                value={config.story2_desc1_zh || ''}
                onChange={(e) => setConfig({ ...config, story2_desc1_zh: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="直接从工厂..."
              />
            </div>
          </div>

          {/* 介绍段落2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 介绍段落2</label>
              <textarea
                value={config.story2_desc2_en || ''}
                onChange={(e) => setConfig({ ...config, story2_desc2_en: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="We provide..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 介绍段落2</label>
              <textarea
                value={config.story2_desc2_zh || ''}
                onChange={(e) => setConfig({ ...config, story2_desc2_zh: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="我们提供..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 工厂展示区配置 (支持视频/图片) */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">📍 3. 工厂展示区配置 (轮播图)</h3>
          <button
            onClick={addCarouselItem}
            disabled={getFactoryCarousel().length >= 6}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            + 添加轮播项 ({getFactoryCarousel().length}/6)
          </button>
        </div>

        <div className="space-y-4">
          {getFactoryCarousel().map((item: any, index: number) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">轮播项 {index + 1}</h4>
                <button
                  onClick={() => removeCarouselItem(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>

              {/* 媒体文件上传 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">媒体文件</label>
                {item.media_url ? (
                  <div className="relative">
                    {item.media_type === 'video' ? (
                      <video
                        src={getMediaUrl(item.media_url)}
                        className="w-full h-60 rounded-lg bg-black"
                        controls
                        preload="metadata"
                      >
                        <source src={getMediaUrl(item.media_url)} type="video/mp4" />
                        您的浏览器不支持视频播放
                      </video>
                    ) : (
                      <img
                        src={getMediaUrl(item.media_url)}
                        alt={`Carousel ${index + 1}`}
                        className="w-full h-60 object-cover rounded-lg"
                        onError={(e) => {
                          console.error('图片加载失败:', item.media_url);
                        }}
                      />
                    )}
                    <button
                      onClick={() => updateCarouselItem(index, 'media_url', '')}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600"
                    >
                      删除
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <label className="flex-1 flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
                      <div className="text-center">
                        <div className="text-3xl mb-1">📷</div>
                        <div className="text-sm text-gray-600">{uploading ? '上传中...' : '上传图片'}</div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploading(true);
                            const result = await uploadApi.uploadSingle(file, 'image');
                            // 一次性更新多个字段
                            const carousel = [...getFactoryCarousel()];
                            carousel[index] = {
                              ...carousel[index],
                              media_url: result.url,
                              media_type: 'image'
                            };
                            // 强制更新config触发重新渲染
                            const newConfig = { ...config, factory_carousel: [...carousel] };
                            setConfig(newConfig);
                            console.log('图片上传成功，新配置:', newConfig);
                            toast.success('图片上传成功');
                            e.target.value = '';
                          } catch (error: any) {
                            toast.error(error.message || '上传失败');
                            e.target.value = '';
                          } finally {
                            setUploading(false);
                          }
                        }}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    <label className="flex-1 flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white">
                      <div className="text-center">
                        <div className="text-3xl mb-1">🎬</div>
                        <div className="text-sm text-gray-600">{uploading ? '上传中...' : '上传视频'}</div>
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* 视频设置 (仅视频模式显示) */}
              {item.media_type === 'video' && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🎬 视频设置</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.video_autoplay !== false}
                        onChange={(e) => updateCarouselItem(index, 'video_autoplay', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">自动播放</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.video_loop !== false}
                        onChange={(e) => updateCarouselItem(index, 'video_loop', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">循环播放</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={item.video_muted !== false}
                        onChange={(e) => updateCarouselItem(index, 'video_muted', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">静音</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 标签文字 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 标签文字</label>
                  <input
                    type="text"
                    value={item.label_en || ''}
                    onChange={(e) => updateCarouselItem(index, 'label_en', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Production Line A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 标签文字</label>
                  <input
                    type="text"
                    value={item.label_zh || ''}
                    onChange={(e) => updateCarouselItem(index, 'label_zh', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="生产线A"
                  />
                </div>
              </div>
            </div>
          ))}

          {getFactoryCarousel().length === 0 && (
            <div className="text-center py-8 text-gray-500">
              暂无轮播项，点击上方按钮添加
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-lg">ℹ️</span>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">提示:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-700">
                <li>图片格式支持: JPG, PNG, WEBP (最大5MB)</li>
                <li>视频格式支持: MP4, WEBM (最大50MB)</li>
                <li>建议图片尺寸: 1200x800 像素</li>
                <li>最多支持6个轮播项</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 联系方式配置 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 4. 联系方式配置</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              type="email"
              value={config.contact_email || ''}
              onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XXL7702@163.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">电话</label>
            <input
              type="tel"
              value={config.contact_phone || ''}
              onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+86 13806777702"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇬🇧 地址</label>
            <input
              type="text"
              value={config.contact_address_en || ''}
              onChange={(e) => setConfig({ ...config, contact_address_en: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Dongyang, Zhejiang, China"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">🇨🇳 地址</label>
            <input
              type="text"
              value={config.contact_address_zh || ''}
              onChange={(e) => setConfig({ ...config, contact_address_zh: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="浙江省东阳市"
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">说明</p>
            <p>配置社交媒体链接后，将在网站页脚显示对应的图标链接。</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          🌐 社交媒体链接
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
              placeholder="https://facebook.com/lemopx"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Twitter / X</label>
            <input
              type="url"
              value={config.socialMedia?.twitter || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, twitter: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://twitter.com/lemopx"
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
              placeholder="https://instagram.com/lemopx"
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
              placeholder="https://linkedin.com/company/lemopx"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">YouTube</label>
            <input
              type="url"
              value={config.socialMedia?.youtube || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, youtube: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/@lemopx"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input
              type="email"
              value={config.socialMedia?.email || ''}
              onChange={(e) => setConfig({
                ...config,
                socialMedia: { ...config.socialMedia, email: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="contact@lemopx.com"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

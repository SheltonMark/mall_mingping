'use client';

import { useEffect, useState } from 'react';
import { systemApi, uploadApi } from '@/lib/adminApi';
import { useToast } from '@/components/common/ToastContainer';
import { ButtonLoader } from '@/components/common/Loader';
import { Upload, X, Save, Search } from 'lucide-react';

interface HomepageConfig {
  hero_image?: string;
  hero_images?: string[]; // 轮播图数组(最多6张)
  certificates?: string[]; // 证书图片数组(最多6张)
  featured_products?: Array<{
    title: string;
    title_en?: string;
    description: string;
    description_en?: string;
    image: string;
    link: string;
  }>;
}

export default function HomepageConfigPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState<HomepageConfig>({});
  const [productSkus, setProductSkus] = useState<any[]>([]);
  const [searchTexts, setSearchTexts] = useState<string[]>(['', '', '', '']);
  const [showDropdowns, setShowDropdowns] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    loadData();
    loadProductSkus();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await systemApi.getHomepage();
      setConfig(data || {});
    } catch (error) {
      console.error('Failed to load config:', error);
      toast.error('加载配置失败');
    } finally {
      setLoading(false);
    }
  };

  const loadProductSkus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/skus?limit=200`);
      if (response.ok) {
        const data = await response.json();
        const skus = data.data || [];
        setProductSkus(skus);

        // Populate searchTexts from saved links
        if (config.featured_products) {
          const newSearchTexts = config.featured_products.map((product: any) => {
            if (product.link) {
              const groupId = product.link.replace('/products/', '');
              // Find first SKU with matching groupId
              const sku = skus.find((s: any) => s.groupId === groupId);
              if (sku) {
                return `${sku.productCode} - ${sku.productName}`;
              }
            }
            return '';
          });
          setSearchTexts(newSearchTexts);
        }
      }
    } catch (error) {
      console.error('Failed to load product SKUs:', error);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await systemApi.updateHomepage(config);
      toast.success('首页配置保存成功');
    } catch (error: any) {
      console.error('Failed to save config:', error);
      toast.error(error.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setConfig({ ...config, hero_image: result.url });
      toast.success('首屏图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
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
      updateFeaturedProduct(index, 'image', result.url);
      toast.success('图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

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

  const handleDeleteHeroCarouselImage = (index: number) => {
    const currentImages = config.hero_images || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setConfig({ ...config, hero_images: newImages });
    toast.success('轮播图已删除');
  };

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
      setConfig({ ...config, certificates: [...currentCerts, result.url] });
      toast.success('证书图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCertificate = (index: number) => {
    const currentCerts = config.certificates || [];
    const newCerts = currentCerts.filter((_, i) => i !== index);
    setConfig({ ...config, certificates: newCerts });
    toast.success('证书图片已删除');
  };

  const featuredProducts = config.featured_products || [
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
    { title: '', description: '', image: '', link: '' },
  ];

  const updateFeaturedProduct = (index: number, field: string, value: string) => {
    const newProducts = [...featuredProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setConfig({ ...config, featured_products: newProducts });
  };

  const updateSearchText = (index: number, value: string) => {
    const newSearchTexts = [...searchTexts];
    newSearchTexts[index] = value;
    setSearchTexts(newSearchTexts);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = true;
    setShowDropdowns(newShowDropdowns);
  };

  const selectSku = (index: number, sku: any) => {
    updateFeaturedProduct(index, 'link', `/products/${sku.groupId}`);

    const newSearchTexts = [...searchTexts];
    newSearchTexts[index] = `${sku.productCode} - ${sku.productName}`;
    setSearchTexts(newSearchTexts);

    const newShowDropdowns = [...showDropdowns];
    newShowDropdowns[index] = false;
    setShowDropdowns(newShowDropdowns);
  };

  const getFilteredSkus = (index: number) => {
    const searchText = searchTexts[index].toLowerCase();
    if (!searchText) return productSkus;

    return productSkus.filter(sku =>
      sku.productCode.toLowerCase().includes(searchText) ||
      sku.productName.toLowerCase().includes(searchText)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部标题栏 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">首页配置</h1>
              <p className="text-sm text-gray-600 mt-1">配置首页Hero区域和精选产品</p>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Hero区域 */}
          <Section title="Hero 首屏区域" description="首页顶部的主要视觉区域">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Hero主图 (右侧大图)</label>
              {config.hero_image ? (
                <div className="relative group">
                  <img
                    src={config.hero_image.startsWith('http') ? config.hero_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${config.hero_image}`}
                    alt="Hero"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setConfig({ ...config, hero_image: '' })}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto mb-3 text-gray-400" size={40} />
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {uploading ? '上传中...' : '点击上传Hero图片'}
                    </div>
                    <div className="text-xs text-gray-500">支持 JPG、PNG、WebP，最大5MB</div>
                    <div className="text-xs text-gray-500 mt-1">建议尺寸：1200x900 像素</div>
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
          </Section>

          {/* Hero轮播图 */}
          <Section title="Hero 轮播图" description="首页Hero区域的轮播图片集（最多6张）">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(config.hero_images || []).map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`}
                      alt={`Hero Carousel ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => handleDeleteHeroCarouselImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}/6
                    </div>
                  </div>
                ))}

                {(!config.hero_images || config.hero_images.length < 6) && (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {uploading ? '上传中...' : '添加轮播图'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {config.hero_images?.length || 0}/6
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleHeroCarouselUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">💡</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">轮播图提示：</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>建议尺寸：1920x1080 像素或更大，保持16:9比例</li>
                      <li>最多上传6张图片，支持 JPG、PNG、WebP 格式</li>
                      <li>单个文件大小不超过5MB</li>
                      <li>图片会按照上传顺序在首页轮播展示</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* 精选产品 */}
          <Section title="精选产品系列 (2x2 网格)" description="首页展示的4个产品卡片">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProducts.map((product, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">产品 {index + 1}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {index === 0 && '左上'}{index === 1 && '右上'}{index === 2 && '左下'}{index === 3 && '右下'}
                    </span>
                  </div>

                  {/* 图片上传 */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">产品图片</label>
                    {product.image ? (
                      <div className="relative group">
                        <img
                          src={product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${product.image}`}
                          alt={`Product ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => updateFeaturedProduct(index, 'image', '')}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="text-center">
                          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                          <div className="text-sm font-medium text-gray-700 mb-1">
                            {uploading ? '上传中...' : '点击上传图片'}
                          </div>
                          <div className="text-xs text-gray-500">支持 JPG、PNG、WebP</div>
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
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">产品标题</label>
                    <input
                      type="text"
                      value={product.title}
                      onChange={(e) => updateFeaturedProduct(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例：MF007-清洁四件套"
                    />
                  </div>

                  {/* 描述 */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">产品描述</label>
                    <textarea
                      value={product.description}
                      onChange={(e) => updateFeaturedProduct(index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="例：专业级别清洁工具，适用于多种场景"
                    />
                  </div>

                  {/* 跳转路由 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">选择跳转产品</label>
                    <div className="relative">
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
                          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="输入产品编号或名称搜索..."
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      </div>
                      {showDropdowns[index] && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {getFilteredSkus(index).length > 0 ? (
                            getFilteredSkus(index).map((sku) => (
                              <div
                                key={sku.id}
                                onClick={() => selectSku(index, sku)}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 text-sm">{sku.productCode}</div>
                                <div className="text-xs text-gray-600 mt-1">{sku.productName}</div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 text-center text-sm">
                              没有找到匹配的产品
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {product.link && (
                      <p className="text-xs text-gray-500 mt-2">
                        已选择：<span className="font-medium text-blue-600">{product.link}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">💡</span>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">配置提示：</p>
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
          </Section>

          {/* 证书图片 */}
          <Section title="证书认证" description="展示企业资质和产品认证证书（最多6张）">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(config.certificates || []).map((certUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={certUrl.startsWith('http') ? certUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${certUrl}`}
                      alt={`Certificate ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => handleDeleteCertificate(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      {index + 1}/6
                    </div>
                  </div>
                ))}

                {(!config.certificates || config.certificates.length < 6) && (
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                      <div className="text-sm font-medium text-gray-700 mb-1">
                        {uploading ? '上传中...' : '添加证书'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {config.certificates?.length || 0}/6
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleCertificateUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-xl">💡</span>
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-2">证书图片提示：</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>建议尺寸：800x1000 像素或更大，保持4:5比例</li>
                      <li>最多上传6张证书图片，支持 JPG、PNG、WebP 格式</li>
                      <li>单个文件大小不超过5MB</li>
                      <li>建议上传清晰的证书扫描件或照片</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* 粘性底部按钮栏 */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {submitting ? <ButtonLoader /> : <><Save size={18} /> 保存配置</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

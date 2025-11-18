const fs = require('fs');

// 读取当前admin/settings页面
let settingsPage = fs.readFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', 'utf-8');

// 1. 更新HomepageConfig接口，添加hero_images和certificates
settingsPage = settingsPage.replace(
  /interface HomepageConfig \{[\s\S]*?\n\}/,
  `interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
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
}`
);

// 2. 在HomepageTab组件中添加必要的函数
const functionsToAdd = `
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
      setConfig({
        ...config,
        certificates: [...currentCerts, { image: result.url, label_zh: '', label_en: '' }]
      });
      toast.success('证书图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除证书
  const handleDeleteCertificate = (index: number) => {
    const newCerts = (config.certificates || []).filter((_, i) => i !== index);
    setConfig({ ...config, certificates: newCerts });
    toast.success('证书已删除');
  };

  // 更新证书标签
  const updateCertificateLabel = (index: number, field: 'label_zh' | 'label_en', value: string) => {
    const newCerts = [...(config.certificates || [])];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setConfig({ ...config, certificates: newCerts });
  };
`;

// 找到HomepageTab函数的开始位置，插入这些函数
const homepageTabIndex = settingsPage.indexOf('function HomepageTab(');
const returnIndex = settingsPage.indexOf('return (', homepageTabIndex);
settingsPage = settingsPage.slice(0, returnIndex) + functionsToAdd + '\n\n  ' + settingsPage.slice(returnIndex);

// 3. 删除单张Hero图片配置section，替换为轮播和证书配置
const newReturnContent = `  return (
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
                  src={imageUrl.startsWith('http') ? imageUrl : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${imageUrl}\`}
                  alt={\`Hero Carousel \${index + 1}\`}
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => handleDeleteHeroCarouselImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/6
                </div>
              </div>
            ))}
            {(!config.hero_images || config.hero_images.length < 6) && (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-center">
                  <div className="text-4xl text-gray-400 mb-2">📷</div>
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
        </div>
      </div>

      {/* 证书认证 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 证书认证</h3>
        <p className="text-sm text-gray-600 mb-4">展示企业资质和产品认证证书（最多6张），支持悬停显示中英文说明</p>
        <div className="space-y-4">
          {(config.certificates || []).map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">证书 {index + 1}</h4>
                <button
                  onClick={() => handleDeleteCertificate(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <img
                    src={cert.image.startsWith('http') ? cert.image : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${cert.image}\`}
                    alt={\`Certificate \${index + 1}\`}
                    className="w-full h-32 object-cover rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., ISO 9001 Quality Management"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!config.certificates || config.certificates.length < 6) && (
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-white hover:bg-gray-50 transition-colors">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-2">🏅</div>
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
      </div>`;

// 找到HomepageTab的return语句并替换
const homepageTabReturnIndex = settingsPage.indexOf('function HomepageTab(');
const nextFunctionIndex = settingsPage.indexOf('function AboutTab(');
const homepageTabContent = settingsPage.substring(homepageTabReturnIndex, nextFunctionIndex);

// 找到return (开始和结束
const returnStart = homepageTabContent.indexOf('return (');
const divStart = homepageTabContent.indexOf('<div className="space-y-8">', returnStart);

// 替换return内容，保留Featured Products部分
const beforeReturn = homepageTabContent.substring(0, returnStart);
const featuredProductsStart = homepageTabContent.indexOf('{/* Featured Products Section */}');
const featuredProductsContent = homepageTabContent.substring(featuredProductsStart);

const newHomepageTab = beforeReturn + newReturnContent + '\n\n      ' + featuredProductsContent;

// 替换整个HomepageTab函数
settingsPage = settingsPage.substring(0, homepageTabReturnIndex) + newHomepageTab + settingsPage.substring(nextFunctionIndex);

// 保存文件
fs.writeFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', settingsPage);

console.log('✅ Admin settings page updated successfully!');
console.log('  - Removed single Hero image config');
console.log('  - Added Hero carousel config (max 6)');
console.log('  - Added certificate config with zh/en labels');
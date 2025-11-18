const fs = require('fs');

// 读取当前的settings/page.tsx
const settingsPage = fs.readFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', 'utf-8');

// 在HomepageConfig interface中添加hero_images和certificates字段
const updatedSettings = settingsPage.replace(
  /interface HomepageConfig \{[\s\S]*?\n\}/,
  `interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  hero_image?: string;
  hero_images?: string[]; // 轮播图数组(最多6张)
  certificates?: string[]; // 证书数组(最多6张)
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

// 添加轮播图和证书的上传处理函数 (在handleHeroImageUpload之后)
const uploadFunctions = `
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
      setConfig({ ...config, certificates: [...currentCerts, result.url] });
      toast.success('证书图片上传成功');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || '图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 删除证书图片
  const handleDeleteCertificate = (index: number) => {
    const newCerts = (config.certificates || []).filter((_, i) => i !== index);
    setConfig({ ...config, certificates: newCerts });
    toast.success('证书图片已删除');
  };
`;

const updated2 = updatedSettings.replace(
  /(const handleHeroImageUpload[\s\S]*?  };\n)/,
  `$1${uploadFunctions}`
);

// 添加轮播图和证书配置UI (在首屏区域</div>之后，精选产品之前)
const carouselAndCertUI = `
      {/* Hero 轮播图 */}
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
        <p className="text-sm text-gray-600 mb-4">展示企业资质和产品认证证书（最多6张）</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(config.certificates || []).map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl.startsWith('http') ? imageUrl : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${imageUrl}\`}
                  alt={\`Certificate \${index + 1}\`}
                  className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={() => handleDeleteCertificate(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/6
                </div>
              </div>
            ))}
            {(!config.certificates || config.certificates.length < 6) && (
              <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 bg-gray-50 hover:bg-gray-100 transition-colors">
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
        </div>
      </div>
`;

const updated3 = updated2.replace(
  /(        <\/div>\n      <\/div>\n\n      \/\* Featured Products Section \*\/)/,
  `        </div>\n      </div>\n${carouselAndCertUI}\n      /* Featured Products Section */`
);

fs.writeFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', updated3);
console.log('✅ Homepage config merged successfully!');

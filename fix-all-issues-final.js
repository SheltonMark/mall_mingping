const fs = require('fs');

console.log('🔧 Starting comprehensive fix...\n');

// ===== 1. Fix Homepage (frontend) =====
let homepage = fs.readFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', 'utf-8');

// 1.1 删除Hero左右按钮（187-203行）
console.log('1️⃣  Removing Hero navigation buttons...');
homepage = homepage.replace(
  /\{\/\* Hero Left\/Right Navigation Buttons \*\/\}\n            <>\n                <button\n[\s\S]*?                <\/button>\n            <>\n/,
  ''
);

// 1.2 删除证书左右按钮
console.log('2️⃣  Removing certificate navigation buttons...');
homepage = homepage.replace(
  /                \{\/\* Left Arrow \*\/\}\n                <button[\s\S]*?<ChevronLeft[\s\S]*?<\/button>\n                \{\/\* Right Arrow \*\/\}\n                <button[\s\S]*?<ChevronRight[\s\S]*?<\/button>\n\n/,
  ''
);

// 1.3 修改证书数据结构，支持中英文
console.log('3️⃣  Updating certificate data structure...');
homepage = homepage.replace(
  /  const \[certificates, setCertificates\] = useState<string\[\]>\(\[\]\)/,
  `  const [certificates, setCertificates] = useState<Array<{image: string, label_zh?: string, label_en?: string}>>([])`
);

// 1.4 修改证书加载逻辑
homepage = homepage.replace(
  /          \/\/ 加载certificates配置 \(max 6 images\)\n          if \(data\.certificates[\s\S]*?            }\n          }/,
  `          // 加载certificates配置 (max 6 images)
          if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
            const certificateData = data.certificates
              .slice(0, 6)
              .map((cert: any) => {
                let imageUrl = '';
                if (typeof cert === 'string') {
                  imageUrl = cert;
                } else {
                  imageUrl = cert.image || cert.url || '';
                }

                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${imageUrl}\`;
                }

                return {
                  image: imageUrl,
                  label_zh: cert.label_zh || '',
                  label_en: cert.label_en || ''
                };
              })
              .filter((cert: any) => cert.image);

            if (certificateData.length > 0) {
              setCertificates(certificateData);
            }
          }`
);

// 1.5 修改证书轮播为3张循环展示 + 柔和过渡
console.log('4️⃣  Implementing 3-item carousel with smooth transitions...');
const certificateSection = `      {/* Certificates Section - 3-item Carousel */}
      <section className="py-20 md:py-28 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
        <div className="w-full max-w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-20 px-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">
              {language === 'zh' ? '资质保障' : 'CERTIFICATIONS'}
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.015em' }}>
              {language === 'zh' ? '源头工厂·资质保障' : 'Factory Direct, Quality Assured'}
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'zh' ? '自有工厂，专业认证，品质保证' : 'Own factory with professional certifications and quality assurance'}
            </p>
          </div>

          {/* 3-Item Carousel */}
          {certificates.length > 0 && (
            <div className="relative px-6 overflow-hidden">
              <div className="max-w-[1200px] mx-auto">
                <div className="relative h-[400px] md:h-[500px]">
                  {/* 显示3张证书的循环轮播 */}
                  <div className="flex gap-6 absolute inset-0 transition-transform duration-700 ease-in-out"
                       style={{
                         transform: \`translateX(-\${currentCertificateIndex * (100 / 3)}%)\`,
                         width: \`\${certificates.length * (100 / 3)}%\`
                       }}>
                    {[...certificates, ...certificates, ...certificates].map((cert, idx) => {
                      const actualIndex = idx % certificates.length;
                      return (
                        <div key={idx} className="flex-shrink-0" style={{ width: \`\${100 / certificates.length / 3}%\` }}>
                          <div className="group relative h-full mx-3 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <img
                              src={cert.image}
                              alt={\`Certificate \${actualIndex + 1}\`}
                              className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* 悬停显示文字 */}
                            {(cert.label_zh || cert.label_en) && (
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                                <p className="text-white text-center text-lg md:text-xl font-medium">
                                  {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Linear Progress Indicator */}
                <div className="flex justify-center mt-12 px-6">
                  <div className="max-w-md w-full flex gap-1">
                    {certificates.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentCertificateIndex(index)}
                        className={\`flex-1 h-1 rounded-sm transition-all duration-300 \${
                          index === currentCertificateIndex
                            ? 'bg-primary'
                            : 'bg-neutral-300 hover:bg-neutral-400'
                        }\`}
                        aria-label={\`Go to certificate \${index + 1}\`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>`;

// 替换证书section
homepage = homepage.replace(
  /      \{\/\* Certificates Section[\s\S]*?      <\/section>/,
  certificateSection
);

fs.writeFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', homepage);
console.log('✅ Homepage fixed!\n');

// ===== 2. Fix Admin Settings Page =====
console.log('5️⃣  Fixing admin settings page...');
let settings = fs.readFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', 'utf-8');

// 2.1 更新interface
settings = settings.replace(
  /interface HomepageConfig \{[\s\S]*?  hero_images\?: string\[\]; \/\/ 轮播图数组\(最多6张\)\n  certificates\?: string\[\]; \/\/ 证书数组\(最多6张\)/,
  `interface HomepageConfig {
  heroTitle?: string;
  heroSubtitle?: string;
  hero_images?: string[]; // 轮播图数组(最多6张) - 替代单张hero_image
  certificates?: Array<{
    image: string;
    label_zh?: string;
    label_en?: string;
  }>; // 证书数组(最多6张，支持中英文标签)`
);

// 2.2 删除"首屏区域"单张Hero图片配置section
settings = settings.replace(
  /      \{\/\* Hero Section \*\/\}\n      <div className="border-b border-gray-200 pb-6">[\s\S]*?      <\/div>\n\n/,
  ''
);

// 2.3 删除handleHeroImageUpload函数
settings = settings.replace(
  /  \/\/ 上传Hero图片\n  const handleHeroImageUpload[\s\S]*?  };\n\n/,
  ''
);

// 2.4 更新证书上传逻辑，支持中英文标签
settings = settings.replace(
  /  \/\/ 上传证书图片\n  const handleCertificateUpload = async[\s\S]*?  };/,
  `  // 上传证书图片
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
  }`
);

// 2.5 更新证书UI，添加中英文标签输入
const newCertUI = `      {/* 证书认证 */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 证书认证</h3>
        <p className="text-sm text-gray-600 mb-4">展示企业资质和产品认证证书（最多6张），支持悬停显示中英文说明</p>
        <div className="space-y-6">
          {(config.certificates || []).map((cert, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">证书 {index + 1}</h4>
                <button
                  onClick={() => handleDeleteCertificate(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  删除
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 证书图片 */}
                <div className="md:col-span-1">
                  <img
                    src={cert.image.startsWith('http') ? cert.image : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${cert.image}\`}
                    alt={\`Certificate \${index + 1}\`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                </div>
                {/* 标签输入 */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🇨🇳 中文标签（悬停显示）
                    </label>
                    <input
                      type="text"
                      value={cert.label_zh || ''}
                      onChange={(e) => updateCertificateLabel(index, 'label_zh', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例：ISO 9001质量管理体系认证"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      🇬🇧 英文标签（悬停显示）
                    </label>
                    <input
                      type="text"
                      value={cert.label_en || ''}
                      onChange={(e) => updateCertificateLabel(index, 'label_en', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., ISO 9001 Quality Management System Certification"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 上传按钮 */}
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

settings = settings.replace(
  /      \{\/\* 证书认证 \*\/\}\n      <div className="border-b border-gray-200 pb-6">[\s\S]*?      <\/div>/,
  newCertUI
);

fs.writeFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', settings);
console.log('✅ Admin settings fixed!\n');

console.log('🎉 All fixes completed successfully!');
console.log('');
console.log('Summary:');
console.log('  ✅ Removed Hero navigation buttons');
console.log('  ✅ Removed certificate navigation buttons');
console.log('  ✅ Removed single hero_image config');
console.log('  ✅ Implemented 3-item carousel with smooth transitions');
console.log('  ✅ Added certificate label support (zh/en)');

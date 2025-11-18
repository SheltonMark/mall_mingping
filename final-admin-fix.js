const fs = require('fs');

let content = fs.readFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', 'utf-8');

// 1. 修改interface，添加证书的中英文标签支持
content = content.replace(
  /certificates\?: string\[\]; \/\/ 证书数组\(最多6张\)/,
  `certificates?: Array<{
    image: string;
    label_zh?: string;
    label_en?: string;
  }>; // 证书数组(最多6张，支持中英文标签)`
);

// 2. 修改证书上传函数，使用对象格式
content = content.replace(
  /setConfig\(\{ \.\.\.config, certificates: \[\.\.\.currentCerts, result\.url\] \}\);/,
  `setConfig({ ...config, certificates: [...currentCerts, { image: result.url, label_zh: '', label_en: '' }] });`
);

// 3. 添加更新证书标签的函数（在handleDeleteCertificate之前）
const updateLabelFunction = `
  // 更新证书标签
  const updateCertificateLabel = (index: number, field: 'label_zh' | 'label_en', value: string) => {
    const newCerts = [...(config.certificates || [])];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setConfig({ ...config, certificates: newCerts });
  };

`;

content = content.replace(
  /  \/\/ 删除证书图片\n  const handleDeleteCertificate/,
  updateLabelFunction + '  // 删除证书图片\n  const handleDeleteCertificate'
);

// 4. 替换return中的"首屏区域"为"Hero轮播图"和"证书认证"
const newHeroAndCertSections = `  return (
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
                  alt={\`Hero \${index + 1}\`}
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
                    src={cert.image.startsWith('http') ? cert.image : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${cert.image}\`}
                    alt={\`证书 \${index + 1}\`}
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
`;

// 找到return语句开始位置和"首屏区域"结束位置
const returnIndex = content.indexOf('  return (', content.indexOf('function HomepageTab'));
const heroSectionEnd = content.indexOf('      {/* Featured Products Section', returnIndex);

if (returnIndex !== -1 && heroSectionEnd !== -1) {
  content = content.substring(0, returnIndex) +
            newHeroAndCertSections + '\n' +
            content.substring(heroSectionEnd);
} else {
  console.error('Could not find return statement or Featured Products section');
}

fs.writeFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', content);
console.log('✅ Admin settings updated successfully!');
console.log('  - Removed single Hero image config');
console.log('  - Added Hero carousel (max 6)');
console.log('  - Added certificates with zh/en labels (max 6)');
console.log('  - Preserved Featured Products config');

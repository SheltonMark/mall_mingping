const fs = require('fs');

// 读取首页文件
let homepage = fs.readFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', 'utf-8');

// 1. 修改certificates状态为对象数组而不是字符串数组
homepage = homepage.replace(
  'const [certificates, setCertificates] = useState<string[]>([])',
  'const [certificates, setCertificates] = useState<Array<{image: string, label_zh?: string, label_en?: string}>>([])'
);

// 2. 添加证书自动轮播（3秒）
homepage = homepage.replace(
  '  // 从API加载首页配置\n  useEffect(() => {',
  `  // 证书自动轮播（3秒）
  useEffect(() => {
    if (certificates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCertificateIndex((prev) => (prev === certificates.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [certificates.length]);

  // 从API加载首页配置
  useEffect(() => {`
);

// 3. 修改证书加载逻辑
homepage = homepage.replace(
  /\/\/ 加载certificates配置 \(max 6 images\)[\s\S]*?setCertificates\(certificateUrls\);[\s\S]*?}\s*}/,
  `// 加载certificates配置 (max 6 images with labels)
          if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
            const certificateData = data.certificates
              .slice(0, 6)
              .map((cert: any) => {
                if (typeof cert === 'string') {
                  // 兼容旧版纯字符串格式
                  return {
                    image: cert.startsWith('http') ? cert : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${cert}\`,
                    label_zh: '',
                    label_en: ''
                  };
                } else {
                  // 新版对象格式
                  const imageUrl = cert.image || cert.url || '';
                  return {
                    image: imageUrl.startsWith('http') ? imageUrl : \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${imageUrl}\`,
                    label_zh: cert.label_zh || '',
                    label_en: cert.label_en || ''
                  };
                }
              })
              .filter((cert: any) => cert.image);

            if (certificateData.length > 0) {
              setCertificates(certificateData);
            }
          }`
);

// 4. 创建新的证书展示section（3张循环轮播 + 移动端逐个展示）
const newCertSection = `      {/* Certificates Section - 3-item Carousel (Desktop) & Single Display (Mobile) */}
      <section className="py-20 md:py-28 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
        <div className="w-full max-w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-20 px-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">
              {language === 'zh' ? '资质保障' : 'CERTIFICATIONS'}
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.015em' }}
            >
              {language === 'zh' ? '源头工厂·资质保障' : 'Factory Direct, Quality Assured'}
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'zh' ? '自有工厂，专业认证，品质保证' : 'Own factory with professional certifications and quality assurance'}
            </p>
          </div>

          {certificates.length > 0 && (
            <>
              {/* Desktop: 3-Item Carousel */}
              <div className="hidden md:block relative px-6 overflow-hidden">
                <div className="max-w-[1200px] mx-auto">
                  <div className="relative h-[400px] md:h-[500px]">
                    {/* 显示3张证书的循环轮播 */}
                    <div className="flex gap-6 transition-transform duration-700 ease-in-out"
                         style={{
                           transform: \`translateX(-\${(currentCertificateIndex * 100) / 3}%)\`,
                         }}>
                      {/* 复制3次证书数组实现无缝循环 */}
                      {[...certificates, ...certificates, ...certificates].map((cert, idx) => (
                        <div key={idx} className="flex-shrink-0 w-1/3 px-3">
                          <div className="group relative h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden">
                            <img
                              src={cert.image}
                              alt={\`Certificate \${(idx % certificates.length) + 1}\`}
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
                      ))}
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

              {/* Mobile: Display All Certificates */}
              <div className="md:hidden px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {certificates.map((cert, index) => (
                    <div key={index} className="group relative bg-white rounded-lg shadow-md overflow-hidden">
                      <img
                        src={cert.image}
                        alt={\`Certificate \${index + 1}\`}
                        className="w-full h-64 object-contain p-4"
                      />
                      {/* 移动端也支持点击显示文字 */}
                      {(cert.label_zh || cert.label_en) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm font-medium">
                            {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>`;

// 5. 找到并替换证书section
const certStart = homepage.indexOf('{/* Certifications & Factory Section');
const certEnd = homepage.indexOf('</section>', certStart) + '</section>'.length;

if (certStart !== -1 && certEnd > certStart) {
  homepage = homepage.substring(0, certStart) + newCertSection + homepage.substring(certEnd);
} else {
  console.log('Warning: Could not find certificate section to replace');
}

// 保存文件
fs.writeFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', homepage);
console.log('✅ Certificate carousel updated successfully!');
console.log('  - Desktop: 3-item carousel with smooth transitions');
console.log('  - Mobile: Display all certificates in grid');
console.log('  - Added hover labels support (zh/en)');
console.log('  - 3-second auto-scroll');
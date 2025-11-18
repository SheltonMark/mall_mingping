const fs = require('fs');

let content = fs.readFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', 'utf-8');

const newCertSection = `      {/* Certificates Section - 3-item Carousel */}
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

          {/* 3-Item Carousel */}
          {certificates.length > 0 && (
            <div className="relative px-6 overflow-hidden">
              <div className="max-w-[1200px] mx-auto">
                <div className="relative h-[400px] md:h-[500px]">
                  {/* 显示3张证书的循环轮播 */}
                  <div
                    className="flex gap-6 absolute inset-0 transition-transform duration-700 ease-in-out"
                    style={{
                      transform: \`translateX(-\${currentCertificateIndex * (100 / 3)}%)\`,
                      width: \`\${certificates.length * (100 / 3)}%\`
                    }}
                  >
                    {[...certificates, ...certificates, ...certificates].map((cert, idx) => {
                      const actualIndex = idx % certificates.length;
                      return (
                        <div
                          key={idx}
                          className="flex-shrink-0"
                          style={{ width: \`\${100 / certificates.length / 3}%\` }}
                        >
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

// 找到证书section的开始和结束
const lines = content.split('\n');
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('Certifications & Factory Section') ||
      (lines[i].includes('section className="py-20 md:py-28 bg-white"') && i > 200)) {
    startLine = i;
  }
  if (startLine !== -1 && endLine === -1 && lines[i].trim() === '</section>' && i > startLine + 10) {
    endLine = i;
    break;
  }
}

if (startLine !== -1 && endLine !== -1) {
  console.log(`Found certificate section: lines ${startLine + 1} to ${endLine + 1}`);

  // 替换证书section
  const before = lines.slice(0, startLine).join('\n');
  const after = lines.slice(endLine + 1).join('\n');

  content = before + '\n' + newCertSection + '\n' + after;

  fs.writeFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', content);
  console.log('✅ Certificate section replaced successfully!');
} else {
  console.log('❌ Could not find certificate section boundaries');
  console.log('startLine:', startLine, 'endLine:', endLine);
}

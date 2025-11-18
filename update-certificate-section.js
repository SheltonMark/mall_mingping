const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修改标题 CERTIFICATIONS -> OUR CERTIFICATIONS
content = content.replace(
  `{language === 'zh' ? '资质保障' : 'CERTIFICATIONS'}`,
  `{language === 'zh' ? '资质保障' : 'OUR CERTIFICATIONS'}`
);

// 2. 替换证书显示部分，添加左右按钮
const oldCertSection = `          {certificates.length > 0 && (
            <>
              {/* Desktop: Certificate Display */}
              <div className="hidden md:block relative px-6">
                <div className="max-w-[1200px] mx-auto">
                  {certificates.length >= 3 ? (
                    // 3张或更多：使用轮播
                    <>
                      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
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

                      {/* Linear Progress Indicator - 只在轮播时显示 */}
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
                    </>
                  ) : (
                    // 少于3张：居中静态显示
                    <div className={\`flex justify-center gap-6 \${certificates.length === 1 ? 'max-w-md mx-auto' : 'max-w-3xl mx-auto'}\`}>
                      {certificates.map((cert, index) => (
                        <div key={index} className="group relative h-[400px] md:h-[500px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ flex: '1 1 0' }}>
                          <img
                            src={cert.image}
                            alt={\`Certificate \${index + 1}\`}
                            className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          />
                          {(cert.label_zh || cert.label_en) && (
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                              <p className="text-white text-center text-lg md:text-xl font-medium">
                                {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>`;

const newCertSection = `          {certificates.length > 0 && (
            <>
              {/* Desktop: Certificate Display */}
              <div className="hidden md:block relative px-6">
                <div className="max-w-[1400px] mx-auto relative">
                  {certificates.length >= 3 ? (
                    // 3张或更多：使用轮播，显示左右按钮（品牌色）
                    <>
                      {/* 左侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary hover:bg-primary/90 text-neutral-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                      </button>

                      {/* 证书轮播容器 */}
                      <div className="relative h-[300px] md:h-[350px] overflow-hidden mx-16">
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
                                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                />
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

                      {/* 右侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary hover:bg-primary/90 text-neutral-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={28} strokeWidth={2.5} />
                      </button>

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
                    </>
                  ) : (
                    // 少于3张：居中静态显示，显示淡色按钮
                    <>
                      {/* 左侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary/30 hover:bg-primary/40 text-neutral-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                      </button>

                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 mx-16 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>
                        {certificates.map((cert, index) => (
                          <div key={index} className="group relative h-[300px] md:h-[350px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ flex: '1 1 0' }}>
                            <img
                              src={cert.image}
                              alt={\`Certificate \${index + 1}\`}
                              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                            />
                            {(cert.label_zh || cert.label_en) && (
                              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                                <p className="text-white text-center text-lg md:text-xl font-medium">
                                  {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* 右侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary/30 hover:bg-primary/40 text-neutral-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={28} strokeWidth={2.5} />
                      </button>
                    </>
                  )}
                </div>
              </div>`;

if (content.includes(oldCertSection)) {
  content = content.replace(oldCertSection, newCertSection);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 证书模块更新成功：');
  console.log('   - 标题改为 OUR CERTIFICATIONS');
  console.log('   - 证书图片高度调整为 300-350px');
  console.log('   - 添加左右导航按钮');
  console.log('   - >=3张：品牌色按钮');
  console.log('   - <3张：淡色按钮 (30% opacity)');
} else {
  console.log('❌ 未找到目标代码，可能已经被修改过');
}

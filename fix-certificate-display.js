const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 找到证书显示部分并替换
const oldCode = `          {certificates.length > 0 && (
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
              </div>`;

const newCode = `          {certificates.length > 0 && (
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

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ 成功修改证书显示逻辑：');
  console.log('   - 3张或更多：使用轮播');
  console.log('   - 少于3张：居中静态显示，不重复');
} else {
  console.log('❌ 未找到目标代码');
}

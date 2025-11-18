const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修改轮播容器：改为w-[85%]居中，两侧自动留白
content = content.replace(
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[450px] md:h-[550px] overflow-hidden px-20">
                        <div className="flex gap-6 transition-transform duration-700 ease-in-out"
                             style={{
                               transform: \`translateX(-\${(currentCertificateIndex * 100) / 3}%)\`,
                             }}>
                          {/* 复制3次证书数组实现无缝循环 */}
                          {[...certificates, ...certificates, ...certificates].map((cert, idx) => (
                            <div key={idx} className="flex-shrink-0 w-1/3 px-3">`,
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[450px] md:h-[550px] overflow-hidden">
                        <div className="w-[85%] mx-auto h-full">
                          <div className="flex gap-6 transition-transform duration-700 ease-in-out h-full"
                               style={{
                                 transform: \`translateX(-\${(currentCertificateIndex * 100) / 3}%)\`,
                               }}>
                            {/* 复制3次证书数组实现无缝循环 */}
                            {[...certificates, ...certificates, ...certificates].map((cert, idx) => (
                              <div key={idx} className="flex-shrink-0 w-1/3 px-3">`
);

// 需要添加对应的闭合div
content = content.replace(
  `                          ))}
                        </div>
                      </div>

                      {/* 右侧按钮 */}`,
  `                          ))}
                          </div>
                        </div>
                      </div>

                      {/* 右侧按钮 */}`
);

// 修改静态显示容器：同样使用w-[85%]
content = content.replace(
  `                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 px-20 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>`,
  `                      {/* 证书静态显示 */}
                      <div className="w-[85%] mx-auto">
                        <div className={\`flex justify-center gap-6 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>`
);

// 添加对应的闭合div（静态显示部分）
content = content.replace(
  `                        ))}
                      </div>

                      {/* 右侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={40} strokeWidth={3} className="text-primary/30 hover:text-primary/40 transition-colors" />
                      </button>`,
  `                        ))}
                        </div>
                      </div>

                      {/* 右侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={40} strokeWidth={3} className="text-primary/30 hover:text-primary/40 transition-colors" />
                      </button>`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书区域宽度调整完成：');
console.log('   - 证书区域宽度缩小至85%');
console.log('   - 左右自动留出7.5%空白');
console.log('   - 箭头保持在容器边缘，不再覆盖证书');
console.log('   - 布局：左箭头 - 空白 - 证书1 - 证书2 - 证书3 - 空白 - 右箭头');

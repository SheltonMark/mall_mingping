const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修改>=3张证书时的左按钮样式（去掉圆形背景，保留品牌色箭头）
content = content.replace(
  `                      {/* 左侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary hover:bg-primary/90 text-neutral-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                      </button>`,
  `                      {/* 左侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />
                      </button>`
);

// 修改>=3张证书时的右按钮样式
content = content.replace(
  `                      {/* 右侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary hover:bg-primary/90 text-neutral-900 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={28} strokeWidth={2.5} />
                      </button>`,
  `                      {/* 右侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />
                      </button>`
);

// 修改<3张证书时的左按钮样式（淡色箭头）
content = content.replace(
  `                      {/* 左侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary/30 hover:bg-primary/40 text-neutral-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                      </button>`,
  `                      {/* 左侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={40} strokeWidth={3} className="text-primary/30 hover:text-primary/40 transition-colors" />
                      </button>`
);

// 修改<3张证书时的右按钮样式
content = content.replace(
  `                      {/* 右侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-primary/30 hover:bg-primary/40 text-neutral-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={28} strokeWidth={2.5} />
                      </button>`,
  `                      {/* 右侧按钮（淡色） */}
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

console.log('✅ 按钮样式简化完成：');
console.log('   - 去掉圆形背景');
console.log('   - 只保留 <> 箭头图标');
console.log('   - 箭头尺寸增大到 40px');
console.log('   - >=3张：品牌色箭头 (text-primary)');
console.log('   - <3张：30%透明度品牌色箭头 (text-primary/30)');

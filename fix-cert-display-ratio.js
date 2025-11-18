const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修改轮播容器：增加高度以显示完整竖版证书，调整左右padding避免被箭头覆盖
content = content.replace(
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[300px] md:h-[350px] overflow-hidden px-16">`,
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[450px] md:h-[550px] overflow-hidden px-20">`
);

// 2. 修改证书卡片：使用object-cover保持竖版比例
content = content.replace(
  `                                <img
                                  src={cert.image}
                                  alt={\`Certificate \${(idx % certificates.length) + 1}\`}
                                  className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                                />`,
  `                                <img
                                  src={cert.image}
                                  alt={\`Certificate \${(idx % certificates.length) + 1}\`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />`
);

// 3. 修改静态显示容器高度和padding
content = content.replace(
  `                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 px-16 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>
                        {certificates.map((cert, index) => (
                          <div key={index} className="group relative h-[300px] md:h-[350px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ flex: '1 1 0' }}>
                            <img
                              src={cert.image}
                              alt={\`Certificate \${index + 1}\`}
                              className="w-full h-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                            />`,
  `                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 px-20 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>
                        {certificates.map((cert, index) => (
                          <div key={index} className="group relative h-[450px] md:h-[550px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ flex: '1 1 0' }}>
                            <img
                              src={cert.image}
                              alt={\`Certificate \${index + 1}\`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书显示优化完成：');
console.log('   - 容器高度增加到 450-550px 以显示完整竖版证书');
console.log('   - 左右padding从 px-16 增加到 px-20，避免箭头覆盖');
console.log('   - 图片使用 object-cover 保持竖版比例');
console.log('   - 移除图片padding，让证书充满容器');

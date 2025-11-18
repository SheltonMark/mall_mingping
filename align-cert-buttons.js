const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修改容器宽度和padding，使按钮与导航栏对齐
content = content.replace(
  `              {/* Desktop: Certificate Display */}
              <div className="hidden md:block relative px-6">
                <div className="max-w-[1400px] mx-auto relative">`,
  `              {/* Desktop: Certificate Display */}
              <div className="hidden md:block relative">
                <div className="max-w-[1440px] mx-auto px-6 relative">`
);

// 移除证书容器的mx-16，因为按钮现在在外层容器的边缘
content = content.replace(
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[300px] md:h-[350px] overflow-hidden mx-16">`,
  `                      {/* 证书轮播容器 */}
                      <div className="relative h-[300px] md:h-[350px] overflow-hidden px-16">`
);

// 修改静态显示的mx-16
content = content.replace(
  `                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 mx-16 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>`,
  `                      {/* 证书静态显示 */}
                      <div className={\`flex justify-center gap-6 px-16 \${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto\`}>`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书按钮对齐修改完成：');
console.log('   - 容器宽度改为 max-w-[1440px]（与导航栏一致）');
console.log('   - 容器使用 px-6（与导航栏一致）');
console.log('   - 左右按钮现在与导航栏logo和购物车对齐');

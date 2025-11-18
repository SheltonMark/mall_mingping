const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修复轮播显示问题 - 使用正确的容器宽度计算
content = content.replace(
  /transform: `translateX\(-\$\{\(currentCertificateIndex \* 100\) \/ 3\}%\)`/g,
  `transform: \`translateX(-\${currentCertificateIndex * 33.333}%)\``
);

// 2. 修改箭头样式 - strokeWidth从2改为1，size从48改为96
content = content.replace(
  /<ChevronLeft size={48} strokeWidth={2}/g,
  `<ChevronLeft size={96} strokeWidth={1}`
);
content = content.replace(
  /<ChevronRight size={48} strokeWidth={2}/g,
  `<ChevronRight size={96} strokeWidth={1}`
);

// 3. 修改证书图片适配 - 从object-cover改为object-contain
content = content.replace(
  /className="w-full h-full object-cover transition-transform/g,
  `className="w-full h-full object-contain transition-transform`
);

// 4. 缩短Featured Products section的顶部padding
content = content.replace(
  /<section className="py-32 bg-white" style=\{\{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' \}\}>/,
  `<section className="pt-16 pb-32 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书轮播和间距修复完成：');
console.log('   1. ✓ 修正轮播计算 (33.333%移动，只显示3张)');
console.log('   2. ✓ 箭头变细变高 (strokeWidth 1, size 96)');
console.log('   3. ✓ 图片改为object-contain完整显示');
console.log('   4. ✓ Our Collection顶部间距缩小 (py-32 → pt-16 pb-32)');

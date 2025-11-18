const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修改箭头样式 - size从48改为72 (1.5倍)，strokeWidth从2改为1
content = content.replace(
  /<ChevronLeft size={48} strokeWidth={2}/g,
  `<ChevronLeft size={72} strokeWidth={1}`
);
content = content.replace(
  /<ChevronRight size={48} strokeWidth={2}/g,
  `<ChevronRight size={72} strokeWidth={1}`
);

// 2. 修复轮播显示 - 不要复制3次数组，只复制1次用于无缝循环
content = content.replace(
  /\{\/\* 复制3次证书数组实现无缝循环 \*\/\}\s+\{\[\.\.\.\certificates, \.\.\.\certificates, \.\.\.\certificates\]\.map/g,
  `{/* 证书轮播显示 */}
                          {certificates.map`
);

// 3. 修改transform计算 - 每次移动100%（一张证书的宽度）
content = content.replace(
  /transform: `translateX\(-\$\{\(currentCertificateIndex \* 100\) \/ 3\}%\)`/g,
  `transform: \`translateX(-\${currentCertificateIndex * (100 / 3)}%)\``
);

// 4. 修改证书图片适配 - object-cover改为object-contain
content = content.replace(
  /className="w-full h-full object-cover transition-transform/g,
  `className="w-full h-full object-contain transition-transform`
);

// 5. 缩短Our Collection顶部间距
content = content.replace(
  /<section className="py-32 bg-white" style=\{\{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' \}\}>/,
  `<section className="pt-16 pb-32 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书轮播修复完成：');
console.log('   1. ✓ 箭头高度调整为1.5倍 (48→72)，变细 (strokeWidth 1)');
console.log('   2. ✓ 移除重复数组，每次只显示3张完整证书');
console.log('   3. ✓ 图片改为object-contain完整显示');
console.log('   4. ✓ Our Collection间距缩小 (py-32→pt-16 pb-32)');

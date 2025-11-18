const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 取消自动轮播 - 删除useEffect中的自动滚动逻辑
const autoScrollPattern = /useEffect\(\(\) => \{[\s\S]*?if \(certificates\.length <= 1\) return;[\s\S]*?const interval = setInterval[\s\S]*?\}, \[certificates\.length\]\);/;
if (autoScrollPattern.test(content)) {
  content = content.replace(autoScrollPattern, '// 已取消证书自动轮播');
}

// 2. 修改指示条样式 - 变细，像线条
content = content.replace(
  /className={\`flex-1 h-1 rounded-sm transition-all duration-300/g,
  `className={\`flex-1 h-0.5 rounded-full transition-all duration-300`
);

// 3. 修改箭头样式 - 变细且大一点
content = content.replace(
  /<ChevronLeft size={40} strokeWidth={3}/g,
  `<ChevronLeft size={48} strokeWidth={2}`
);
content = content.replace(
  /<ChevronRight size={48} strokeWidth={2}/g,
  `<ChevronRight size={48} strokeWidth={2}`
);

// 4. 确保左右留白 - 将85%改为75%，留出更多空间
content = content.replace(
  /className="w-\[85%\] mx-auto/g,
  `className="w-[75%] mx-auto`
);

// 5. 添加悬停立体效果 - 增加阴影和transform
content = content.replace(
  /className="group relative h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden"/g,
  `className="group relative h-full bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:scale-105"`
);

// 6. 修改遮罩样式 - 改为底部渐变遮罩
content = content.replace(
  /<div className="absolute inset-0 bg-black\/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">/g,
  `<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-16 pb-6 px-6">`
);

// 修改文字样式 - 去掉居中对齐
content = content.replace(
  /<p className="text-white text-center text-lg md:text-xl font-medium">/g,
  `<p className="text-white text-left text-base md:text-lg font-medium"`
);

// 7. 缩小证书图片 - 高度减少1/3 (从450-550px到300-370px)
content = content.replace(
  /h-\[450px\] md:h-\[550px\]/g,
  `h-[300px] md:h-[370px]`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 证书模块优化完成：');
console.log('   1. ✓ 取消自动轮播');
console.log('   2. ✓ 指示条变细 (h-1 → h-0.5)');
console.log('   3. ✓ 箭头变细变大 (size 48, strokeWidth 2)');
console.log('   4. ✓ 左右留白增加 (85% → 75%)');
console.log('   5. ✓ 悬停立体效果 (shadow-2xl + translate-y + scale)');
console.log('   6. ✓ 底部渐变遮罩，文字左对齐');
console.log('   7. ✓ 证书图片缩小1/3 (450-550px → 300-370px)');

const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 修改左箭头 - size 40→72, strokeWidth 3→1
content = content.replace(
  `<ChevronLeft size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />`,
  `<ChevronLeft size={72} strokeWidth={1} className="text-primary hover:text-primary/80 transition-colors" />`
);

// 2. 修改右箭头 - size 40→72, strokeWidth 3→1
content = content.replace(
  `<ChevronRight size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />`,
  `<ChevronRight size={72} strokeWidth={1} className="text-primary hover:text-primary/80 transition-colors" />`
);

// 3. 移除3次复制，只保留1次
content = content.replace(
  `{/* 复制3次证书数组实现无缝循环 */}
                            {[...certificates, ...certificates, ...certificates].map((cert, idx) => (`,
  `{/* 证书轮播 */}
                            {certificates.map((cert, idx) => (`
);

// 4. 修改索引计算
content = content.replace(
  `alt={\`Certificate \${(idx % certificates.length) + 1}\`}`,
  `alt={\`Certificate \${idx + 1}\`}`
);

fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ 强制修复完成：');
console.log('   - 左右箭头: size 40→72, strokeWidth 3→1');
console.log('   - 移除3次数组复制，只显示一次certificates');
console.log('   - 修正索引计算');

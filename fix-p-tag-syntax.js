const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 修复错误的 <p> 标签语法
content = content.replace(
  /<p className="text-white text-left text-base md:text-lg font-medium"\s+\{language === 'zh' \? \(cert\.label_zh \|\| cert\.label_en\) : \(cert\.label_en \|\| cert\.label_zh\)\}\s+<\/p>/g,
  `<p className="text-white text-left text-base md:text-lg font-medium">
                                      {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                                    </p>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 修复了 <p> 标签语法错误');

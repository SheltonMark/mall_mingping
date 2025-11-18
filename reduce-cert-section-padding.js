const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 缩短证书section的padding，从 py-20 md:py-28 改为 py-12 md:py-16
content = content.replace(
  `      <section className="py-20 md:py-28 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>`,
  `      <section className="py-12 md:py-16 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 缩短了证书section的padding (py-20 md:py-28 → py-12 md:py-16)');
console.log('   现在 OUR CERTIFICATIONS 和 Our Collection 之间的距离更合理');

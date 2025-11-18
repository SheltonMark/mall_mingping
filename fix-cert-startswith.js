const fs = require('fs');

console.log('🔧 修复 admin/settings/page.tsx 中的 cert.image 错误...\n');

const filePath = 'd:/mast/web/code/frontend/src/app/admin/settings/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// 修复 Line 565: cert.image.startsWith 改为安全访问
const dangerousPattern = /cert\.image\.startsWith\('http'\) \? cert\.image/g;
const safeReplacement = "(cert.image || '').startsWith('http') ? cert.image";

const beforeCount = (content.match(dangerousPattern) || []).length;
content = content.replace(dangerousPattern, safeReplacement);
const afterCount = (content.match(dangerousPattern) || []).length;

console.log(`✅ 修复了 ${beforeCount - afterCount} 处 cert.image.startsWith 错误`);

// 备份原文件
fs.writeFileSync(filePath + '.backup', fs.readFileSync(filePath, 'utf-8'));
console.log(`✅ 原文件已备份到: ${filePath}.backup`);

// 保存修复后的文件
fs.writeFileSync(filePath, content);
console.log(`✅ 已保存修复后的文件\n`);

// 验证修复
console.log('🔍 验证修复结果:');
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('cert.image') && line.includes('.startsWith')) {
    const hasSafeAccess = line.includes("cert.image || ''") ||
                          line.includes('cert.image ||') ||
                          line.includes('cert?.image');
    console.log(`Line ${i + 1}: ${hasSafeAccess ? '✅ 安全' : '❌ 仍有问题'}`);
    console.log(`  ${line.trim()}`);
  }
});

console.log('\n✅ 修复完成！');

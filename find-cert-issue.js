const fs = require('fs');

console.log('🔍 详细检查证书渲染代码...\n');

const content = fs.readFileSync('d:/mast/web/code/frontend/src/app/admin/settings/page.tsx', 'utf-8');

// 找到所有包含 cert.image 的行
const lines = content.split('\n');
const certImageLines = [];

lines.forEach((line, i) => {
  if (line.includes('cert.image') || line.includes('cert?.image')) {
    certImageLines.push({
      num: i + 1,
      text: line.trim()
    });
  }
});

console.log(`找到 ${certImageLines.length} 行包含 cert.image:\n`);
certImageLines.forEach(l => {
  console.log(`Line ${l.num}: ${l.text}`);
});

console.log('\n' + '='.repeat(80));
console.log('检查每个 cert.image.startsWith 是否有安全检查:\n');

certImageLines.forEach(l => {
  if (l.text.includes('.startsWith')) {
    const hasSafeAccess = l.text.includes('cert?.image') ||
                          l.text.includes('cert.image ||') ||
                          l.text.includes('(cert.image || ');

    console.log(`Line ${l.num}: ${hasSafeAccess ? '✅' : '❌ 危险！'}`);
    console.log(`  ${l.text}`);

    if (!hasSafeAccess) {
      console.log(`  💡 建议修复为: ${l.text.replace('cert.image.startsWith', '(cert.image || "").startsWith')}`);
    }
    console.log();
  }
});

// 查找 map((cert, index) 的具体位置
console.log('='.repeat(80));
console.log('查找所有 certificates.map 的位置:\n');

const mapPattern = /\.map\(\s*\(\s*cert\s*,\s*index\s*\)/g;
let match;
while ((match = mapPattern.exec(content)) !== null) {
  const lineNum = content.substring(0, match.index).split('\n').length;
  const startContext = Math.max(0, match.index - 100);
  const endContext = Math.min(content.length, match.index + 300);
  const context = content.substring(startContext, endContext);

  console.log(`📍 Line ${lineNum}:`);
  console.log('Context:');
  console.log(context);
  console.log('\n' + '-'.repeat(80) + '\n');
}

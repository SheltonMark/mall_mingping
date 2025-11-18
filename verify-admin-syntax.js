const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证 admin/settings/page.tsx 语法...\n');

// 读取文件
const filePath = 'd:/mast/web/code/frontend/src/app/admin/settings/page.tsx';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

console.log(`📄 文件总行数: ${lines.length}\n`);

// 1. 检查括号匹配
let braceCount = 0;
let parenCount = 0;
let bracketCount = 0;
let braceErrors = [];
let parenErrors = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // 跳过注释和字符串内容（简单处理）
  const cleanLine = line.replace(/\/\/.*$/, '').replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').replace(/`[^`]*`/g, '');

  for (let char of cleanLine) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;

    if (braceCount < 0) braceErrors.push({ line: i + 1, text: line.trim() });
    if (parenCount < 0) parenErrors.push({ line: i + 1, text: line.trim() });
  }
}

console.log('📊 括号统计:');
console.log(`  大括号 {}: ${braceCount === 0 ? '✅ 匹配' : '❌ 不匹配 (差值: ' + braceCount + ')'}`);
console.log(`  小括号 (): ${parenCount === 0 ? '✅ 匹配' : '❌ 不匹配 (差值: ' + parenCount + ')'}`);
console.log(`  方括号 []: ${bracketCount === 0 ? '✅ 匹配' : '❌ 不匹配 (差值: ' + bracketCount + ')'}`);
console.log();

if (braceErrors.length > 0) {
  console.log('❌ 大括号错误位置:');
  braceErrors.slice(0, 5).forEach(err => {
    console.log(`  Line ${err.line}: ${err.text}`);
  });
  console.log();
}

// 2. 检查 HomepageTab 函数结构
const homepageTabStart = content.indexOf('function HomepageTab(');
const aboutTabStart = content.indexOf('function AboutTab(');

if (homepageTabStart === -1) {
  console.log('❌ 找不到 HomepageTab 函数');
} else {
  console.log(`✅ HomepageTab 函数开始于: ${content.substring(0, homepageTabStart).split('\n').length} 行`);
}

if (aboutTabStart === -1) {
  console.log('❌ 找不到 AboutTab 函数');
} else {
  console.log(`✅ AboutTab 函数开始于: ${content.substring(0, aboutTabStart).split('\n').length} 行`);
  console.log();
}

// 3. 检查 certificates 相关代码
console.log('🔍 检查 certificates 数据结构...');

// 检查 interface
const interfaceMatch = content.match(/certificates\?:\s*([^;]+);/);
if (interfaceMatch) {
  console.log(`✅ Interface 中的 certificates 类型: ${interfaceMatch[1].trim()}`);
} else {
  console.log('❌ 找不到 certificates 类型定义');
}

// 检查 map 调用
const mapMatches = content.match(/\(config\.certificates \|\| \[\]\)\.map\([^)]+\)/g);
if (mapMatches) {
  console.log(`✅ 找到 ${mapMatches.length} 处 certificates.map 调用`);
  mapMatches.forEach((match, i) => {
    console.log(`  ${i + 1}. ${match.substring(0, 60)}...`);
  });
} else {
  console.log('⚠️  没有找到 certificates.map 调用');
}
console.log();

// 4. 检查可能导致 'startsWith' 错误的代码
console.log('🔍 检查 .startsWith() 调用...');
const startsWithPattern = /(\w+)\.startsWith\(/g;
let match;
const startsWithCalls = [];

while ((match = startsWithPattern.exec(content)) !== null) {
  const lineNum = content.substring(0, match.index).split('\n').length;
  const varName = match[1];
  startsWithCalls.push({ line: lineNum, var: varName });
}

console.log(`找到 ${startsWithCalls.length} 处 .startsWith() 调用:`);
startsWithCalls.slice(0, 10).forEach(call => {
  console.log(`  Line ${call.line}: ${call.var}.startsWith(...)`);
});
console.log();

// 5. 具体检查证书渲染代码
console.log('🔍 检查证书渲染代码...');
const certRenderPattern = /\(config\.certificates \|\| \[\]\)\.map\(\(cert, index\)/g;
const certMatches = [];
while ((match = certRenderPattern.exec(content)) !== null) {
  const lineNum = content.substring(0, match.index).split('\n').length;
  const contextStart = Math.max(0, match.index - 200);
  const contextEnd = Math.min(content.length, match.index + 500);
  const context = content.substring(contextStart, contextEnd);

  // 检查是否访问 cert.image
  if (context.includes('cert.image')) {
    certMatches.push({
      line: lineNum,
      hasImageCheck: context.includes('cert.image.startsWith'),
      hasTypeCheck: context.includes('typeof cert') || context.includes('cert?.image'),
      context: context.substring(0, 200)
    });
  }
}

if (certMatches.length > 0) {
  console.log(`找到 ${certMatches.length} 处证书渲染代码:`);
  certMatches.forEach((m, i) => {
    console.log(`  ${i + 1}. Line ${m.line}`);
    console.log(`     - 有 image 检查: ${m.hasImageCheck ? '✅' : '❌'}`);
    console.log(`     - 有类型检查: ${m.hasTypeCheck ? '✅' : '❌'}`);
    if (!m.hasImageCheck || !m.hasTypeCheck) {
      console.log(`     ⚠️  可能导致错误！`);
      console.log(`     代码片段: ${m.context.substring(0, 100)}...`);
    }
  });
} else {
  console.log('⚠️  没有找到证书渲染代码');
}
console.log();

// 6. 生成修复建议
console.log('💡 修复建议:');
if (certMatches.some(m => !m.hasTypeCheck)) {
  console.log('  ❌ 证书数据访问缺少类型检查，需要添加:');
  console.log('     cert?.image?.startsWith() 或 (cert.image || "").startsWith()');
}
if (braceCount !== 0) {
  console.log(`  ❌ 大括号不匹配，差值: ${braceCount}`);
  console.log('     需要手动检查函数闭合');
}

console.log('\n✅ 验证完成！');

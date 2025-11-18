const fs = require('fs');

// 读取文件
let content = fs.readFileSync('src/app/admin/settings/page.tsx', 'utf-8');

// 找到updateCertificateLabel函数并修复
const fixedUpdateFunction = `  // 更新证书标签
  const updateCertificateLabel = (index: number, field: 'label_zh' | 'label_en', value: string) => {
    const newCerts = [...(config.certificates || [])];
    newCerts[index] = { ...newCerts[index], [field]: value };
    setConfig({ ...config, certificates: newCerts });
  };

  // 删除证书
  const handleDeleteCertificate = (index: number) => {
    const newCerts = (config.certificates || []).filter((_, i) => i !== index);
    setConfig({ ...config, certificates: newCerts });
    toast.success('证书已删除');
  };`;

// 找到并替换450-458行之间的内容
const lines = content.split('\n');
const before = lines.slice(0, 450).join('\n');
const after = lines.slice(458).join('\n');

content = before + '\n' + fixedUpdateFunction + '\n\n' + after;

// 保存
fs.writeFileSync('src/app/admin/settings/page.tsx', content);
console.log('✅ Fixed admin settings syntax');

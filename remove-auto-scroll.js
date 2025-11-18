const fs = require('fs');

const filePath = 'd:/mast/web/code/frontend/src/app/(frontend)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 精确删除自动轮播的useEffect代码块
content = content.replace(
  `  // Certificates自动轮播（3秒）
  // 已取消证书自动轮播

  // 证书自动轮播（3秒）
  useEffect(() => {
    if (certificates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCertificateIndex((prev) => (prev === certificates.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [certificates.length]);`,
  `  // 已取消证书自动轮播`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ 成功删除自动轮播代码');

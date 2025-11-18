const fs = require('fs');

let content = fs.readFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', 'utf-8');

// 1. 去掉默认产品数据和默认Hero图片，初始化为空数组
content = content.replace(
  /  \/\/ 默认产品数据[\s\S]*?  const \[featuredProducts, setFeaturedProducts\] = useState<FeaturedProduct\[\]>\(defaultProducts\)\n  const \[heroImages, setHeroImages\] = useState<string\[\]>\(\['https:\/\/lh3\.googleusercontent\.com[^']+'\]\)/,
  `  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])`
);

// 2. 修改featured_products加载逻辑，不使用defaultProducts作为fallback
content = content.replace(
  /          \/\/ 加载featured_products配置[\s\S]*?              \.filter\(\(p: FeaturedProduct\) => p\.image && p\.link\) \/\/ 至少要有图片和链接/,
  `          // 加载featured_products配置
          if (data.featured_products && Array.isArray(data.featured_products) && data.featured_products.length > 0) {
            // 只加载完整配置的产品（必须有图片和链接）
            const configuredProducts = data.featured_products
              .map((p: any) => {
                // 处理图片URL
                let imageUrl = p.image || '';
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = \`\${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}\${imageUrl}\`;
                }

                return {
                  title: p.title || '',
                  title_en: p.title_en || p.title || '',
                  description: p.description || '',
                  description_en: p.description_en || p.description || '',
                  image: imageUrl,
                  link: p.link || '#'
                }
              })
              .filter((p: FeaturedProduct) => p.image && p.link) // 至少要有图片和链接`
);

// 3. 去掉Hero左右按钮 (删除整个<>...</>包裹的按钮代码)
content = content.replace(
  /            \{\/\* Hero Left\/Right Navigation Buttons \*\/\}[\s\S]*?            <\/>\n\n/,
  ''
);

// 4. 为certificates添加自动轮播（3秒）
content = content.replace(
  /  \/\/ 从API加载首页配置\n  useEffect\(\(\) => \{/,
  `  // Certificates自动轮播（3秒）
  useEffect(() => {
    if (certificates.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentCertificateIndex((prev) => (prev === certificates.length - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [certificates.length]);

  // 从API加载首页配置
  useEffect(() => {`
);

// 5. 去掉证书区域的左右按钮（查找并删除证书的左右切换按钮）
// 首先读取证书区域的部分来确认结构
const certSectionMatch = content.match(/(section className="py-20 md:py-28 bg-white"[\s\S]*?\/\* Linear Progress Indicator \*\/)/);
if (certSectionMatch) {
  let certSection = certSectionMatch[0];

  // 删除证书左右按钮
  certSection = certSection.replace(
    /                \{\/\* Left Arrow \*\/\}[\s\S]*?                <\/button>\n                \{\/\* Right Arrow \*\/\}[\s\S]*?                <\/button>\n\n/,
    ''
  );

  content = content.replace(
    /(section className="py-20 md:py-28 bg-white"[\s\S]*?\/\* Linear Progress Indicator \*\/)/,
    certSection
  );
}

// 6. 确保Hero容器保留pt-20（检查是否存在）
if (!content.includes('<div className="pt-20 pb-12 md:pb-16 bg-white">')) {
  console.log('⚠️  Warning: pt-20 not found in Hero container!');
  // 尝试修复
  content = content.replace(
    /<div className="pb-12 md:pb-16 bg-white">/,
    '<div className="pt-20 pb-12 md:pb-16 bg-white">'
  );
}

fs.writeFileSync('d:/mast/web/code/frontend/src/app/(frontend)/page.tsx', content);
console.log('✅ Homepage fixed successfully!');
console.log('  - Removed default products and hero images');
console.log('  - Removed Hero left/right buttons');
console.log('  - Removed certificates left/right buttons');
console.log('  - Added 3-second auto-scroll for certificates');
console.log('  - Ensured pt-20 spacing for Hero');

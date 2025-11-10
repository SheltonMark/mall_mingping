const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkUnconfiguredColors() {
  console.log('=== 检查未配置的产品配色 ===\n');

  const products = await prisma.productSku.findMany({
    where: {
      additionalAttributes: { not: null }
    }
  });

  console.log(`总共 ${products.length} 个产品\n`);

  let unconfiguredCount = 0;
  const unconfiguredProducts = [];

  for (const product of products) {
    if (!product.additionalAttributes || !Array.isArray(product.additionalAttributes)) {
      continue;
    }

    let hasUnconfigured = false;
    const details = [];

    for (const attr of product.additionalAttributes) {
      if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
        for (const scheme of attr.colorSchemes) {
          if (scheme.colors && Array.isArray(scheme.colors)) {
            for (const colorPart of scheme.colors) {
              if (!colorPart.color ||
                  colorPart.color === '未配置' ||
                  colorPart.color.trim() === '') {
                hasUnconfigured = true;
                details.push({
                  componentCode: attr.componentCode,
                  schemeName: scheme.schemeName,
                  part: colorPart.part,
                  currentColor: colorPart.color || '(空)',
                  hexColor: colorPart.hexColor || '(空)'
                });
              }
            }
          }
        }
      }
    }

    if (hasUnconfigured) {
      unconfiguredCount++;
      unconfiguredProducts.push({
        productCode: product.productCode,
        details
      });

      console.log(`❌ ${product.productCode}`);
      details.forEach(d => {
        console.log(`   组件${d.componentCode} - ${d.schemeName} - ${d.part}: "${d.currentColor}" (${d.hexColor})`);
      });
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`统计结果:`);
  console.log(`  有未配置颜色: ${unconfiguredCount} 个产品`);
  console.log(`  配置完整: ${products.length - unconfiguredCount} 个产品`);
  console.log(`  总计: ${products.length} 个产品`);

  await prisma.$disconnect();
}

checkUnconfiguredColors().catch(console.error);

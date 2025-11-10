const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查所有组件的Parts配置 ===\n');

  const components = await prisma.component.findMany({
    orderBy: { code: 'asc' }
  });

  console.log(`总共有 ${components.length} 个组件\n`);

  components.forEach(comp => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`代码: ${comp.code}`);
    console.log(`中文名: ${comp.nameZh}`);
    console.log(`英文名: ${comp.nameEn}`);
    console.log(`描述: ${comp.description || '无'}`);

    if (comp.parts && Array.isArray(comp.parts) && comp.parts.length > 0) {
      console.log(`部件数量: ${comp.parts.length}`);
      comp.parts.forEach((part, index) => {
        console.log(`  ${index + 1}. ${part.nameZh} / ${part.nameEn}`);
      });
    } else {
      console.log(`部件数量: 0 (未配置)`);
    }
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // 现在检查产品的additionalAttributes
  console.log('=== 检查产品配色中的部件 ===\n');

  const products = await prisma.productSku.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' }
  });

  for (const product of products) {
    console.log(`产品: ${product.productCode} - ${product.productName}`);

    if (product.additionalAttributes && Array.isArray(product.additionalAttributes)) {
      product.additionalAttributes.forEach((attr) => {
        console.log(`  组件: ${attr.componentCode}`);
        if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
          attr.colorSchemes.forEach((scheme, schemeIdx) => {
            console.log(`    方案${schemeIdx + 1}: ${scheme.name}`);
            if (scheme.colors && Array.isArray(scheme.colors)) {
              scheme.colors.forEach((color) => {
                console.log(`      - ${color.part}: ${color.color}`);
              });
            }
          });
        }
      });
    }
    console.log('');
  }

  await prisma.$disconnect();
}

main().catch(console.error);

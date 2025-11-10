const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkProductComponents() {
  console.log('=== 检查产品的productSpec与additionalAttributes的组件代码是否匹配 ===\n');

  // 获取所有组件配置
  const components = await prisma.component.findMany();
  const componentMap = new Map();
  components.forEach(c => {
    componentMap.set(c.code, {
      nameZh: c.nameZh,
      nameEn: c.nameEn,
      parts: c.parts || []
    });
  });

  // 获取所有产品
  const products = await prisma.productSku.findMany({
    where: {
      productSpec: { not: null },
      additionalAttributes: { not: null }
    },
    take: 5
  });

  for (const product of products) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`产品: ${product.productCode} - ${product.productName}\n`);

    // 检查productSpec中的组件代码
    if (product.productSpec && Array.isArray(product.productSpec)) {
      console.log('【组件管理 - productSpec】:');
      product.productSpec.forEach((spec, idx) => {
        const component = componentMap.get(spec.code);
        console.log(`  ${idx + 1}. 组件${spec.code}: ${spec.name} (${component ? component.nameZh : '未找到组件配置'})`);
        if (component && component.parts.length > 0) {
          console.log(`     部件: ${component.parts.map(p => p.nameZh).join(', ')}`);
        }
      });
    }

    console.log('');

    // 检查additionalAttributes中的组件代码
    if (product.additionalAttributes && Array.isArray(product.additionalAttributes)) {
      console.log('【配色管理 - additionalAttributes】:');
      product.additionalAttributes.forEach((attr, idx) => {
        const component = componentMap.get(attr.componentCode);
        console.log(`  ${idx + 1}. 组件${attr.componentCode}: ${component ? component.nameZh : '未找到组件配置'}`);

        // 显示第一个配色方案的部件
        if (attr.colorSchemes && attr.colorSchemes[0] && attr.colorSchemes[0].colors) {
          const parts = attr.colorSchemes[0].colors.map(c => c.part).join(', ');
          console.log(`     配色方案中的部件: ${parts}`);
        }
      });
    }

    console.log('');

    // 检查是否匹配
    const specCodes = product.productSpec ? product.productSpec.map(s => s.code).sort() : [];
    const attrCodes = product.additionalAttributes ? product.additionalAttributes.map(a => a.componentCode).sort() : [];

    if (JSON.stringify(specCodes) !== JSON.stringify(attrCodes)) {
      console.log('⚠️  警告: 组件管理和配色管理的组件代码不一致!');
      console.log(`   组件管理: [${specCodes.join(', ')}]`);
      console.log(`   配色管理: [${attrCodes.join(', ')}]`);
    } else {
      console.log('✅ 组件代码一致');
    }

    console.log('');
  }

  await prisma.$disconnect();
}

checkProductComponents().catch(console.error);

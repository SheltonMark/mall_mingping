const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function fixProductSpecNames() {
  console.log('=== 修复产品productSpec中的组件名称 ===\n');

  // 1. 获取所有组件配置
  const components = await prisma.component.findMany();
  const componentMap = new Map();
  components.forEach(c => {
    componentMap.set(c.code, {
      nameZh: c.nameZh,
      nameEn: c.nameEn
    });
  });

  console.log(`已加载 ${componentMap.size} 个组件配置\n`);

  // 2. 获取所有产品
  const products = await prisma.productSku.findMany({
    where: {
      productSpec: { not: null }
    }
  });

  console.log(`找到 ${products.length} 个产品\n`);

  let fixedCount = 0;

  for (const product of products) {
    if (!product.productSpec || !Array.isArray(product.productSpec)) {
      continue;
    }

    let needsUpdate = false;
    const updatedSpec = product.productSpec.map(spec => {
      const component = componentMap.get(spec.code);

      if (component && spec.name !== component.nameZh) {
        console.log(`  ❌ ${product.productCode} - 组件${spec.code}:`);
        console.log(`     当前名称: "${spec.name}"`);
        console.log(`     正确名称: "${component.nameZh}"`);
        needsUpdate = true;

        return {
          ...spec,
          name: component.nameZh,
          nameEn: component.nameEn
        };
      }

      return spec;
    });

    if (needsUpdate) {
      await prisma.productSku.update({
        where: { id: product.id },
        data: {
          productSpec: updatedSpec
        }
      });
      fixedCount++;
      console.log(`  ✅ 已修复\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`修复完成!`);
  console.log(`  修复: ${fixedCount} 个产品`);
  console.log(`  总计: ${products.length} 个产品`);

  await prisma.$disconnect();
}

fixProductSpecNames().catch(console.error);

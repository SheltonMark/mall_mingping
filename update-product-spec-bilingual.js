const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function updateProductSpecBilingual() {
  console.log('=== 更新产品规格描述为双语格式 ===\n');

  // 1. 加载所有组件配置
  const components = await prisma.component.findMany({
    select: {
      code: true,
      nameZh: true,
      nameEn: true,
      description: true
    }
  });

  console.log(`加载了 ${components.length} 个组件配置\n`);

  // 创建组件映射表
  const componentMap = new Map();
  components.forEach(comp => {
    componentMap.set(comp.code, {
      nameZh: comp.nameZh,
      nameEn: comp.nameEn,
      description: comp.description || '' // 双语格式的规格描述
    });
  });

  // 2. 加载所有产品
  const products = await prisma.productSku.findMany({
    where: {
      productSpec: { not: null }
    }
  });

  console.log(`总共 ${products.length} 个产品需要检查\n`);

  let updatedCount = 0;
  let totalSpecsUpdated = 0;

  // 3. 更新每个产品的 productSpec
  for (const product of products) {
    if (!product.productSpec || !Array.isArray(product.productSpec)) {
      continue;
    }

    let needsUpdate = false;
    const updatedProductSpec = product.productSpec.map(specItem => {
      const componentInfo = componentMap.get(specItem.code);

      if (!componentInfo) {
        console.log(`  ⚠️  ${product.productCode} - 未找到组件 ${specItem.code}`);
        return specItem;
      }

      // 检查 spec 是否需要更新
      const currentSpec = specItem.spec || '';
      const targetSpec = componentInfo.description || '';

      // 如果当前 spec 不是双语格式，或者与组件配置不一致
      if (currentSpec !== targetSpec) {
        needsUpdate = true;
        totalSpecsUpdated++;

        console.log(`  ✓ ${product.productCode} - [${specItem.code}] ${componentInfo.nameZh}`);
        console.log(`    "${currentSpec}" → "${targetSpec}"`);

        return {
          ...specItem,
          spec: targetSpec
        };
      }

      return specItem;
    });

    // 4. 如果需要更新，保存到数据库
    if (needsUpdate) {
      await prisma.productSku.update({
        where: { id: product.id },
        data: {
          productSpec: updatedProductSpec
        }
      });
      updatedCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`更新完成!`);
  console.log(`  更新产品数: ${updatedCount} 个`);
  console.log(`  更新规格项: ${totalSpecsUpdated} 个`);
  console.log(`  总产品数: ${products.length} 个`);

  await prisma.$disconnect();
}

updateProductSpecBilingual().catch(console.error);

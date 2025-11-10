const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function fixProductParts() {
  console.log('=== 修复产品配色中的部件名称 ===\n');

  // 1. 获取所有组件及其parts配置
  const components = await prisma.component.findMany();
  const componentPartsMap = new Map();

  components.forEach(comp => {
    if (comp.parts && Array.isArray(comp.parts)) {
      componentPartsMap.set(comp.code, comp.parts);
    }
  });

  console.log(`已加载 ${componentPartsMap.size} 个组件的parts配置\n`);

  // 2. 获取所有产品
  const products = await prisma.productSku.findMany();
  console.log(`找到 ${products.length} 个产品\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    if (!product.additionalAttributes || !Array.isArray(product.additionalAttributes)) {
      skippedCount++;
      continue;
    }

    let needsUpdate = false;
    const updatedAttributes = product.additionalAttributes.map(attr => {
      const componentCode = attr.componentCode;
      const componentParts = componentPartsMap.get(componentCode);

      if (!componentParts || !attr.colorSchemes) {
        return attr;
      }

      const updatedSchemes = attr.colorSchemes.map(scheme => {
        if (!scheme.colors || !Array.isArray(scheme.colors)) {
          return scheme;
        }

        // 检查当前配色方案中的part数量是否与组件parts配置一致
        const currentPartNames = scheme.colors.map(c => c.part);
        const expectedPartNames = componentParts.map(p => p.nameZh);

        // 如果数量不一致或名称不匹配,需要修复
        if (currentPartNames.length !== expectedPartNames.length ||
            !currentPartNames.every((name, idx) => name === expectedPartNames[idx])) {

          needsUpdate = true;
          console.log(`  ❌ ${product.productCode} - 组件${componentCode}:`);
          console.log(`     当前parts: [${currentPartNames.join(', ')}]`);
          console.log(`     应该是: [${expectedPartNames.join(', ')}]`);

          // 修复策略:
          // - 如果part数量匹配但名称不对,替换名称
          // - 如果part数量不匹配,保留颜色但更新part名称
          const updatedColors = componentParts.map((part, idx) => {
            const existingColor = scheme.colors[idx];
            return {
              part: part.nameZh, // 更新为正确的part名称
              color: existingColor ? existingColor.color : '未配置',
              hexColor: existingColor ? existingColor.hexColor : '#FFFFFF'
            };
          });

          return {
            ...scheme,
            colors: updatedColors
          };
        }

        return scheme;
      });

      return {
        ...attr,
        colorSchemes: updatedSchemes
      };
    });

    if (needsUpdate) {
      await prisma.productSku.update({
        where: { id: product.id },
        data: {
          additionalAttributes: updatedAttributes
        }
      });
      fixedCount++;
      console.log(`  ✅ 已修复\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`修复完成!`);
  console.log(`  修复: ${fixedCount} 个产品`);
  console.log(`  跳过: ${skippedCount} 个产品(无配色数据)`);
  console.log(`  总计: ${products.length} 个产品`);

  await prisma.$disconnect();
}

fixProductParts().catch(console.error);

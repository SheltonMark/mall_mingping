import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateComponentsWithParts() {
  console.log('=== Updating Components with Parts Data ===\n');

  try {
    // 1. 获取所有 SKU 并提取部件信息
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productCode: true,
        additionalAttributes: true,
      },
    });

    console.log(`Analyzing ${skus.length} SKUs for part data...\n`);

    // 2. 按组件代码收集所有部件（去重）
    const componentPartsMap = new Map<string, Set<string>>();

    for (const sku of skus) {
      if (!sku.additionalAttributes) continue;

      try {
        const attrs = typeof sku.additionalAttributes === 'string'
          ? JSON.parse(sku.additionalAttributes)
          : sku.additionalAttributes;

        if (!Array.isArray(attrs)) continue;

        for (const attr of attrs) {
          const componentCode = attr.componentCode;
          if (!componentCode) continue;

          if (!componentPartsMap.has(componentCode)) {
            componentPartsMap.set(componentCode, new Set());
          }

          const partsSet = componentPartsMap.get(componentCode)!;

          // 处理配色方案中的部件
          if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
            for (const scheme of attr.colorSchemes) {
              if (scheme.colors && Array.isArray(scheme.colors)) {
                for (const colorPart of scheme.colors) {
                  if (colorPart.part) {
                    partsSet.add(colorPart.part);
                  }
                }
              }
            }
          }
          // 处理旧格式
          else if (attr.colors && Array.isArray(attr.colors)) {
            for (const colorPart of attr.colors) {
              if (colorPart.part) {
                partsSet.add(colorPart.part);
              }
            }
          }
        }
      } catch (e) {
        console.error(`Failed to parse additionalAttributes for SKU ${sku.productCode}:`, e);
      }
    }

    // 3. 显示发现的部件
    console.log('=== Parts Found by Component ===\n');
    for (const [code, parts] of componentPartsMap.entries()) {
      console.log(`[${code}]: ${parts.size} unique parts`);
      console.log(`  ${Array.from(parts).join(', ')}`);
      console.log('');
    }

    // 4. 更新组件表
    console.log('=== Updating Component Database ===\n');

    for (const [code, partsSet] of componentPartsMap.entries()) {
      const parts = Array.from(partsSet).map(part => ({
        nameZh: part,
        nameEn: part, // 默认使用中文，需要后续手动更新
      }));

      try {
        const component = await prisma.component.findUnique({
          where: { code },
        });

        if (!component) {
          console.log(`  ⚠ Component [${code}] not found in database, skipping...`);
          continue;
        }

        await prisma.component.update({
          where: { code },
          data: { parts },
        });

        console.log(`  ✓ Updated [${code}] ${component.nameZh} with ${parts.length} parts`);
      } catch (e: any) {
        console.error(`  ✗ Failed to update [${code}]:`, e.message);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Components updated: ${componentPartsMap.size}`);
    console.log('\nNote: Part English names need to be manually updated in Component Configuration UI');
    console.log('Format: { nameZh: "杆身", nameEn: "Pole Body" }');

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行更新
updateComponentsWithParts()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

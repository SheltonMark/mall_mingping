import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAllComponentsAndParts() {
  console.log('=== Analyzing ALL Components and Parts from Database ===\n');

  try {
    // 获取所有 SKU
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productCode: true,
        productName: true,
        productSpec: true,
        additionalAttributes: true,
      },
    });

    console.log(`Found ${skus.length} SKUs to analyze\n`);

    // 收集所有组件和部件信息
    const componentsMap = new Map<string, {
      code: string;
      nameZh: string;
      nameEn: string;
      parts: Set<string>;
      usedInProducts: string[];
    }>();

    for (const sku of skus) {
      // 1. 从 productSpec 获取组件基本信息
      if (sku.productSpec) {
        try {
          const specs = typeof sku.productSpec === 'string'
            ? JSON.parse(sku.productSpec)
            : sku.productSpec;

          if (Array.isArray(specs)) {
            for (const spec of specs) {
              if (spec.code && spec.name) {
                if (!componentsMap.has(spec.code)) {
                  componentsMap.set(spec.code, {
                    code: spec.code,
                    nameZh: spec.name,
                    nameEn: spec.name_en || spec.nameEn || spec.name,
                    parts: new Set(),
                    usedInProducts: [],
                  });
                }
                const comp = componentsMap.get(spec.code)!;
                if (!comp.usedInProducts.includes(sku.productCode)) {
                  comp.usedInProducts.push(sku.productCode);
                }

                // 添加 parts
                if (spec.parts && Array.isArray(spec.parts)) {
                  spec.parts.forEach((part: string) => comp.parts.add(part));
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to parse productSpec for SKU ${sku.productCode}:`, e);
        }
      }

      // 2. 从 additionalAttributes 获取部件信息
      if (sku.additionalAttributes) {
        try {
          const attrs = typeof sku.additionalAttributes === 'string'
            ? JSON.parse(sku.additionalAttributes)
            : sku.additionalAttributes;

          if (Array.isArray(attrs)) {
            for (const attr of attrs) {
              const componentCode = attr.componentCode;
              if (!componentCode) continue;

              // 确保组件存在
              if (!componentsMap.has(componentCode)) {
                componentsMap.set(componentCode, {
                  code: componentCode,
                  nameZh: componentCode,
                  nameEn: componentCode,
                  parts: new Set(),
                  usedInProducts: [],
                });
              }

              const comp = componentsMap.get(componentCode)!;

              // 处理配色方案中的部件
              if (attr.colorSchemes && Array.isArray(attr.colorSchemes)) {
                for (const scheme of attr.colorSchemes) {
                  if (scheme.colors && Array.isArray(scheme.colors)) {
                    for (const colorPart of scheme.colors) {
                      if (colorPart.part) {
                        comp.parts.add(colorPart.part);
                      }
                    }
                  }
                }
              }
              // 处理旧格式
              else if (attr.colors && Array.isArray(attr.colors)) {
                for (const colorPart of attr.colors) {
                  if (colorPart.part) {
                    comp.parts.add(colorPart.part);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error(`Failed to parse additionalAttributes for SKU ${sku.productCode}:`, e);
        }
      }
    }

    // 3. 显示分析结果
    console.log('=== Components and Parts Analysis ===\n');
    const sortedComponents = Array.from(componentsMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    sortedComponents.forEach(comp => {
      console.log(`[${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
      console.log(`  Used in ${comp.usedInProducts.length} products`);
      console.log(`  Parts (${comp.parts.size}): ${Array.from(comp.parts).join(', ')}`);
      console.log('');
    });

    // 4. 检查数据库中的组件
    console.log('\n=== Checking Component Database ===\n');
    const existingComponents = await prisma.component.findMany({
      select: { code: true, nameZh: true, nameEn: true },
      orderBy: { code: 'asc' },
    });

    console.log(`Components in database: ${existingComponents.length}`);
    existingComponents.forEach(comp => {
      console.log(`  ✓ [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
    });

    // 5. 找出缺失的组件
    const existingCodes = new Set(existingComponents.map(c => c.code));
    const missingComponents = sortedComponents.filter(c => !existingCodes.has(c.code));

    if (missingComponents.length > 0) {
      console.log(`\n=== Missing Components (${missingComponents.length}) ===\n`);
      missingComponents.forEach(comp => {
        console.log(`  ✗ [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
        console.log(`    Parts: ${Array.from(comp.parts).join(', ')}`);
        console.log(`    Used in: ${comp.usedInProducts.join(', ')}`);
        console.log('');
      });

      // 6. 迁移缺失的组件
      console.log('=== Migrating Missing Components ===\n');
      for (const comp of missingComponents) {
        try {
          await prisma.component.create({
            data: {
              code: comp.code,
              nameZh: comp.nameZh,
              nameEn: comp.nameEn,
              description: `Parts: ${Array.from(comp.parts).join(', ')}`,
              sortOrder: 0,
              isActive: true,
            },
          });
          console.log(`  ✓ Migrated: [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
        } catch (e: any) {
          console.error(`  ✗ Failed to migrate [${comp.code}]:`, e.message);
        }
      }
    } else {
      console.log(`\n✓ All components are already in the database!`);
    }

    console.log('\n=== Summary ===');
    console.log(`Total unique components found: ${componentsMap.size}`);
    console.log(`Already in database: ${existingComponents.length}`);
    console.log(`Newly migrated: ${missingComponents.length}`);

  } catch (error) {
    console.error('Analysis failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行分析和迁移
analyzeAllComponentsAndParts()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

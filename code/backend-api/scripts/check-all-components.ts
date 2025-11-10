import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllComponents() {
  console.log('Checking all components in product database...\n');

  try {
    // 1. 从所有 SKU 中提取组件数据
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productCode: true,
        productName: true,
        productSpec: true,
      },
    });

    console.log(`Found ${skus.length} SKUs to analyze\n`);

    // 2. 收集所有唯一的组件
    const componentsMap = new Map<string, {
      code: string;
      nameZh: string;
      nameEn: string;
      usedInProducts: string[];
    }>();

    for (const sku of skus) {
      if (!sku.productSpec) continue;

      try {
        const specs = typeof sku.productSpec === 'string'
          ? JSON.parse(sku.productSpec)
          : sku.productSpec;

        if (!Array.isArray(specs)) continue;

        for (const spec of specs) {
          if (spec.code && spec.name) {
            const key = spec.code;
            if (!componentsMap.has(key)) {
              componentsMap.set(key, {
                code: spec.code,
                nameZh: spec.name,
                nameEn: spec.name_en || spec.nameEn || spec.name,
                usedInProducts: [sku.productCode],
              });
            } else {
              const existing = componentsMap.get(key)!;
              if (!existing.usedInProducts.includes(sku.productCode)) {
                existing.usedInProducts.push(sku.productCode);
              }
            }
          }
        }
      } catch (e) {
        console.error(`Failed to parse productSpec for SKU ${sku.id}:`, e);
      }
    }

    console.log('=== All Components Found in Products ===\n');
    const sortedComponents = Array.from(componentsMap.values()).sort((a, b) =>
      a.code.localeCompare(b.code)
    );

    sortedComponents.forEach(comp => {
      console.log(`[${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
      console.log(`  Used in ${comp.usedInProducts.length} products: ${comp.usedInProducts.join(', ')}`);
      console.log('');
    });

    // 3. 检查哪些组件已经在数据库中
    console.log('\n=== Checking Component Database ===\n');
    const existingComponents = await prisma.component.findMany({
      select: { code: true, nameZh: true, nameEn: true },
    });

    console.log(`Components in database: ${existingComponents.length}`);
    existingComponents.forEach(comp => {
      console.log(`  ✓ [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
    });

    // 4. 找出缺失的组件
    const existingCodes = new Set(existingComponents.map(c => c.code));
    const missingComponents = sortedComponents.filter(c => !existingCodes.has(c.code));

    if (missingComponents.length > 0) {
      console.log(`\n=== Missing Components (Need to Migrate) ===\n`);
      missingComponents.forEach(comp => {
        console.log(`  ✗ [${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
        console.log(`    Used in: ${comp.usedInProducts.join(', ')}`);
      });

      // 5. 迁移缺失的组件
      console.log(`\n=== Migrating ${missingComponents.length} Missing Components ===\n`);
      for (const comp of missingComponents) {
        try {
          await prisma.component.create({
            data: {
              code: comp.code,
              nameZh: comp.nameZh,
              nameEn: comp.nameEn,
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
    console.error('Check failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行检查和迁移
checkAllComponents()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

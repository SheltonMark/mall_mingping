import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateComponents() {
  console.log('Starting component migration...');

  try {
    // 1. 从所有 SKU 中提取组件数据
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productSpec: true,
      },
    });

    console.log(`Found ${skus.length} SKUs to process`);

    // 2. 收集所有唯一的组件
    const componentsMap = new Map<string, { code: string; nameZh: string; nameEn: string }>();

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
                nameEn: spec.name_en || spec.nameEn || spec.name, // 尝试多个可能的英文字段
              });
            }
          }
        }
      } catch (e) {
        console.error(`Failed to parse productSpec for SKU ${sku.id}:`, e);
      }
    }

    console.log(`Found ${componentsMap.size} unique components`);

    // 3. 插入到组件配置表
    let insertedCount = 0;
    let skippedCount = 0;

    for (const [code, component] of componentsMap.entries()) {
      try {
        // 检查是否已存在
        const existing = await prisma.component.findUnique({
          where: { code: component.code },
        });

        if (existing) {
          console.log(`Component ${code} already exists, skipping...`);
          skippedCount++;
          continue;
        }

        // 插入新组件
        await prisma.component.create({
          data: {
            code: component.code,
            nameZh: component.nameZh,
            nameEn: component.nameEn,
            sortOrder: 0,
            isActive: true,
          },
        });

        console.log(`✓ Inserted component: [${code}] ${component.nameZh} / ${component.nameEn}`);
        insertedCount++;
      } catch (e: any) {
        console.error(`Failed to insert component ${code}:`, e.message);
      }
    }

    console.log('\n=== Migration Summary ===');
    console.log(`Total unique components found: ${componentsMap.size}`);
    console.log(`Successfully inserted: ${insertedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
    console.log('Migration completed!');

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行迁移
migrateComponents()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

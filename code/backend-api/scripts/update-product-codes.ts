import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateProductCodes() {
  console.log('Starting product code update...');

  try {
    // 1. 获取所有 SKU
    const skus = await prisma.productSku.findMany({
      select: {
        id: true,
        productCode: true,
        productName: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`Found ${skus.length} SKUs to update`);

    // 2. 为每个SKU生成新的品号
    let counter = 1;
    const updates: Array<{ id: string; oldCode: string; newCode: string }> = [];

    for (const sku of skus) {
      // 生成新品号格式: C04.01.0001, C04.01.0002, etc.
      const categoryCode = 'C04'; // 清洁用品类别
      const subCategory = '01'; // 子类别
      const sequence = counter.toString().padStart(4, '0');
      const newCode = `${categoryCode}.${subCategory}.${sequence}`;

      updates.push({
        id: sku.id,
        oldCode: sku.productCode,
        newCode: newCode,
      });

      counter++;
    }

    // 3. 显示计划的更新
    console.log('\n=== Planned Updates ===');
    updates.forEach(update => {
      console.log(`${update.oldCode} → ${update.newCode}`);
    });

    // 4. 执行更新
    console.log('\n=== Executing Updates ===');
    for (const update of updates) {
      await prisma.productSku.update({
        where: { id: update.id },
        data: { productCode: update.newCode },
      });
      console.log(`✓ Updated: ${update.oldCode} → ${update.newCode}`);
    }

    console.log('\n=== Update Summary ===');
    console.log(`Total SKUs updated: ${updates.length}`);
    console.log('All product codes have been updated successfully!');

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行更新
updateProductCodes()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

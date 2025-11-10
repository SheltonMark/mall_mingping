import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function dumpProductData() {
  try {
    const skus = await prisma.productSku.findMany({
      select: {
        productCode: true,
        productName: true,
        productSpec: true,
        additionalAttributes: true,
      },
      take: 2, // Just get 2 products to examine
    });

    console.log('=== Product Data Sample ===\n');

    skus.forEach((sku, index) => {
      console.log(`\n--- Product ${index + 1}: ${sku.productCode} ---`);
      console.log(`Name: ${sku.productName}`);

      console.log(`\nproductSpec:`);
      console.log(JSON.stringify(sku.productSpec, null, 2));

      console.log(`\nadditionalAttributes:`);
      console.log(JSON.stringify(sku.additionalAttributes, null, 2));
      console.log('\n' + '='.repeat(80));
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

dumpProductData();

const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkProductSpecData() {
  console.log('=== 检查产品的productSpec数据 ===\n');

  const product = await prisma.productSku.findFirst({
    where: {
      productSpec: { not: null }
    }
  });

  if (!product) {
    console.log('没有找到产品');
    await prisma.$disconnect();
    return;
  }

  console.log(`产品: ${product.productCode}`);
  console.log('productSpec:');
  console.log(JSON.stringify(product.productSpec, null, 2));

  await prisma.$disconnect();
}

checkProductSpecData().catch(console.error);

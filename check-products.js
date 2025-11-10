const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./code/backend-api/prisma/dev.db'
    }
  }
});

async function main() {
  const count = await prisma.productGroup.count();
  console.log('Total ProductGroups:', count);

  const products = await prisma.productGroup.findMany({
    take: 5,
    select: {
      id: true,
      productNumber: true,
      productName: true,
      visibilityTier: true,
      isPublished: true
    }
  });

  console.log('Sample products:', JSON.stringify(products, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  console.log('开始导出数据...');

  const data = {
    admins: await prisma.admin.findMany(),
    salespersons: await prisma.salesperson.findMany(),
    customers: await prisma.customer.findMany(),
    categories: await prisma.category.findMany(),
    productGroups: await prisma.productGroup.findMany(),
    productSkus: await prisma.productSku.findMany(),
    systemConfigs: await prisma.systemConfig.findMany(),
    // 订单相关
    orders: await prisma.order.findMany(),
    orderItems: await prisma.orderItem.findMany(),
    orderCustomParams: await prisma.orderCustomParam.findMany(),
    orderParamConfigs: await prisma.orderParamConfig.findMany(),
    // 其他
    components: await prisma.component.findMany(),
    homepageFeatured: await prisma.homepageFeatured.findMany(),
    certifications: await prisma.certification.findMany(),
    subscriptions: await prisma.subscription.findMany(),
    partnershipApplications: await prisma.partnershipApplication.findMany(),
    cartItems: await prisma.cartItem.findMany(),
  };

  // 统计
  for (const [key, value] of Object.entries(data)) {
    console.log(`  ${key}: ${value.length} 条记录`);
  }

  fs.writeFileSync('data-export.json', JSON.stringify(data, null, 2));
  console.log('\n数据已导出到 data-export.json');

  await prisma.$disconnect();
}

exportData().catch(console.error);

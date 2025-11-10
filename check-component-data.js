const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 检查Component数据 ===\n');

  const components = await prisma.component.findMany({
    where: {
      code: { in: ['A', 'B', 'C'] }
    },
    orderBy: { code: 'asc' }
  });

  components.forEach(comp => {
    console.log(`代码: ${comp.code}`);
    console.log(`中文名: ${comp.nameZh}`);
    console.log(`英文名: ${comp.nameEn}`);
    console.log(`Parts字段类型: ${typeof comp.parts}`);
    console.log(`Parts内容: ${JSON.stringify(comp.parts, null, 2)}`);
    console.log('---\n');
  });

  await prisma.$disconnect();
}

main().catch(console.error);

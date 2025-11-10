const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function checkComponentsData() {
  console.log('=== 检查组件配置数据 ===\n');

  const components = await prisma.component.findMany({
    orderBy: { code: 'asc' }
  });

  console.log(`总共 ${components.length} 个组件\n`);

  for (const comp of components) {
    console.log(`[${comp.code}] ${comp.nameZh} / ${comp.nameEn}`);
    console.log(`  描述: ${comp.description || '(无)'}`);
    console.log(`  排序: ${comp.sortOrder}`);

    if (comp.parts && Array.isArray(comp.parts)) {
      console.log(`  部件 (${comp.parts.length}个):`);
      comp.parts.forEach((part, idx) => {
        console.log(`    ${idx + 1}. ${part.nameZh} / ${part.nameEn || '(缺少英文)'}`);
      });
    } else {
      console.log(`  部件: (无)`);
    }
    console.log('');
  }

  await prisma.$disconnect();
}

checkComponentsData().catch(console.error);

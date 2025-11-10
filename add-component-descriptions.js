const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

// 规格描述模板 (双语格式)
const specDescriptions = [
  '标准规格/Standard Spec',
  '加长款/Extended Version',
  '加厚款/Thickened Version',
  '豪华版/Deluxe Edition',
  '经济型/Economy Type',
  '专业级/Professional Grade',
  '家用型/Household Type',
  '商用型/Commercial Type'
];

// 随机选择一个规格描述
function getRandomSpec() {
  return specDescriptions[Math.floor(Math.random() * specDescriptions.length)];
}

async function addComponentDescriptions() {
  console.log('=== 为组件添加双语规格描述 ===\n');

  const components = await prisma.component.findMany({
    orderBy: { code: 'asc' }
  });

  console.log(`总共 ${components.length} 个组件\n`);

  let updatedCount = 0;

  for (const comp of components) {
    // 如果已经有description，跳过
    if (comp.description && comp.description.trim() !== '') {
      console.log(`⏭️  [${comp.code}] ${comp.nameZh} - 已有描述: "${comp.description}"`);
      continue;
    }

    const randomSpec = getRandomSpec();

    await prisma.component.update({
      where: { id: comp.id },
      data: {
        description: randomSpec
      }
    });

    updatedCount++;
    console.log(`✅ [${comp.code}] ${comp.nameZh} - 添加描述: "${randomSpec}"`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`完成!`);
  console.log(`  添加描述: ${updatedCount} 个组件`);
  console.log(`  跳过: ${components.length - updatedCount} 个组件(已有描述)`);
  console.log(`  总计: ${components.length} 个组件`);

  await prisma.$disconnect();
}

addComponentDescriptions().catch(console.error);

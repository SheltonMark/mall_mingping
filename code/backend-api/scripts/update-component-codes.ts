import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateComponentCodes() {
  console.log('=== Updating Component Codes to A, B, C, D... format ===\n');

  try {
    // 获取所有组件，按sortOrder排序
    const components = await prisma.component.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    console.log(`Found ${components.length} components\n`);

    // 生成字母代码: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U...
    const generateCode = (index: number): string => {
      if (index < 26) {
        return String.fromCharCode(65 + index); // A-Z
      } else {
        // AA, AB, AC... (如果超过26个)
        const first = Math.floor(index / 26) - 1;
        const second = index % 26;
        return String.fromCharCode(65 + first) + String.fromCharCode(65 + second);
      }
    };

    console.log('=== Updating Codes ===\n');

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const newCode = generateCode(i);

      try {
        await prisma.component.update({
          where: { id: component.id },
          data: { code: newCode },
        });
        console.log(`  ✓ [${component.code}] → [${newCode}] ${component.nameZh}`);
      } catch (e: any) {
        console.error(`  ✗ Failed to update ${component.nameZh}:`, e.message);
      }
    }

    console.log('\n=== Update Complete ===');
    console.log(`Updated ${components.length} component codes`);

  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateComponentCodes()
  .then(() => {
    console.log('\nScript finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

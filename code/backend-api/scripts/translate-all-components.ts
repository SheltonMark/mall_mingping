import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 组件翻译映射
const componentTranslations: Record<string, string> = {
  '布料': 'Fabric',
  '掸头': 'Duster Head',
  '底座': 'Base',
  '杆件': 'Rod',
  '杆身': 'Pole Body',
  '工具头': 'Tool Head',
  '刮条': 'Scraper',
  '海绵': 'Sponge',
  '连接杆': 'Connecting Rod',
  '抹布': 'Cloth',
  '配件': 'Accessory',
  '喷壶': 'Spray Bottle',
  '伸缩杆': 'Telescopic Rod',
  '收纳盒': 'Storage Box',
  '手柄': 'Handle',
  '梳头': 'Comb Head',
  '刷头': 'Brush Head',
  '桶体': 'Bucket Body',
  '拖把头': 'Mop Head',
  '纤维布': 'Fiber Cloth',
  '主体': 'Main Body',
};

// 部件翻译映射
const partTranslations: Record<string, string> = {
  // 布料相关
  '布料': 'Fabric',
  '布料2': 'Fabric 2',

  // 杆相关
  '掸头': 'Duster Head',
  '底座': 'Base',
  '杆件': 'Rod',
  '杆身': 'Pole Body',
  '杆身2': 'Pole Body 2',
  '伸缩杆': 'Telescopic Rod',

  // 工具头相关
  '工具头': 'Tool Head',
  '工具头2': 'Tool Head 2',

  // 清洁工具
  '刮条': 'Scraper',
  '刷头': 'Brush Head',
  '海绵': 'Sponge',
  '抹布': 'Cloth',
  '纤维布': 'Fiber Cloth',
  '纤维布2': 'Fiber Cloth 2',

  // 手柄相关
  '手柄': 'Handle',
  '手柄2': 'Handle 2',
  '连接杆': 'Connecting Rod',

  // 拖把相关
  '拖把头': 'Mop Head',

  // 配件
  '配件': 'Accessory',
  '配件2': 'Accessory 2',

  // 喷壶相关
  '喷壶': 'Spray Bottle',
  '喷壶2': 'Spray Bottle 2',

  // 收纳
  '收纳盒': 'Storage Box',

  // 梳头
  '梳头': 'Comb Head',

  // 桶体
  '桶体': 'Bucket Body',

  // 主体
  '主体': 'Main Body',
};

async function translateAllComponents() {
  console.log('=== Translating All Components and Parts ===\n');

  try {
    const components = await prisma.component.findMany({
      orderBy: { code: 'asc' },
    });

    console.log(`Found ${components.length} components to translate\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const component of components) {
      const nameZh = component.nameZh;
      const nameEn = componentTranslations[nameZh];

      if (!nameEn) {
        console.log(`  ⚠ Skipping [${component.code}] ${nameZh} - no translation found`);
        skippedCount++;
        continue;
      }

      // 翻译部件
      let translatedParts: Array<{ nameZh: string; nameEn: string }> | null = null;

      if (component.parts && Array.isArray(component.parts)) {
        translatedParts = (component.parts as any[]).map((part) => {
          const partNameZh = part.nameZh;
          const partNameEn = partTranslations[partNameZh] || partNameZh;

          return {
            nameZh: partNameZh,
            nameEn: partNameEn,
          };
        });
      }

      // 更新组件
      await prisma.component.update({
        where: { id: component.id },
        data: {
          nameEn: nameEn,
          parts: translatedParts || undefined,
        },
      });

      console.log(`  ✓ [${component.code}] ${nameZh} → ${nameEn}`);
      if (translatedParts && translatedParts.length > 0) {
        translatedParts.forEach((part) => {
          console.log(`      • ${part.nameZh} → ${part.nameEn}`);
        });
      }
      console.log('');

      updatedCount++;
    }

    console.log('=== Translation Summary ===');
    console.log(`Total components: ${components.length}`);
    console.log(`Successfully translated: ${updatedCount}`);
    console.log(`Skipped (no translation): ${skippedCount}`);

    // 验证翻译结果
    console.log('\n=== Verification ===');
    const verifyComponents = await prisma.component.findMany({
      orderBy: { code: 'asc' },
    });

    console.log('\nAll Components with Translations:');
    verifyComponents.forEach((comp) => {
      const parts = comp.parts as any[] | null;
      const partsCount = parts ? parts.length : 0;
      console.log(`[${comp.code}] ${comp.nameZh} / ${comp.nameEn} (${partsCount} parts)`);
    });

  } catch (error) {
    console.error('Translation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

translateAllComponents()
  .then(() => {
    console.log('\n✓ Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('✗ Script failed:', error);
    process.exit(1);
  });

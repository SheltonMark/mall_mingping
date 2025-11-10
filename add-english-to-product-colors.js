const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

// 颜色中英文对照表
const colorTranslations = {
  // 基础颜色
  '黑色': 'Black',
  '白色': 'White',
  '灰色': 'Gray',
  '红色': 'Red',
  '蓝色': 'Blue',
  '绿色': 'Green',
  '黄色': 'Yellow',
  '橙色': 'Orange',
  '紫色': 'Purple',
  '粉色': 'Pink',
  '棕色': 'Brown',
  '米色': 'Beige',
  '银色': 'Silver',
  '金色': 'Gold',

  // 灰色系列
  '浅灰': 'Light Gray',
  '深灰': 'Dark Gray',
  '冷灰': 'Cool Gray',
  '暖灰': 'Warm Gray',
  '3C冷灰': '3C Cool Gray',
  '磨砂黑': 'Matte Black',
  '经典黑': 'Classic Black',

  // 其他常用颜色
  '透明': 'Transparent',
  '未配置': 'Not Configured'
};

// 智能翻译颜色名称
function translateColor(chineseColor) {
  if (!chineseColor || chineseColor.trim() === '') {
    return 'Not Configured';
  }

  // 如果已经是双语格式，直接返回
  if (chineseColor.includes('/')) {
    return chineseColor;
  }

  // 精确匹配
  if (colorTranslations[chineseColor]) {
    return `${chineseColor}/${colorTranslations[chineseColor]}`;
  }

  // 模糊匹配
  for (const [zh, en] of Object.entries(colorTranslations)) {
    if (chineseColor.includes(zh)) {
      const suffix = chineseColor.replace(zh, '').trim();
      if (suffix) {
        return `${chineseColor}/${en} ${suffix}`;
      }
      return `${chineseColor}/${en}`;
    }
  }

  // 如果没有匹配到，返回原值加上拼音或通用英文
  return `${chineseColor}/Custom Color`;
}

async function addEnglishToProductColors() {
  console.log('=== 为产品配色添加英文翻译 ===\n');

  const products = await prisma.productSku.findMany({
    where: {
      additionalAttributes: { not: null }
    }
  });

  console.log(`总共 ${products.length} 个产品\n`);

  let updatedCount = 0;
  let totalTranslated = 0;

  for (const product of products) {
    if (!product.additionalAttributes || !Array.isArray(product.additionalAttributes)) {
      continue;
    }

    let needsUpdate = false;
    const updatedAttributes = product.additionalAttributes.map(attr => {
      if (!attr.colorSchemes || !Array.isArray(attr.colorSchemes)) {
        return attr;
      }

      const updatedSchemes = attr.colorSchemes.map(scheme => {
        if (!scheme.colors || !Array.isArray(scheme.colors)) {
          return scheme;
        }

        const updatedColors = scheme.colors.map(colorPart => {
          // 检查是否需要添加英文
          if (colorPart.color && !colorPart.color.includes('/')) {
            needsUpdate = true;
            totalTranslated++;

            const bilingualColor = translateColor(colorPart.color);

            console.log(`  ✓ ${product.productCode} - 组件${attr.componentCode}`);
            console.log(`    ${colorPart.part}: "${colorPart.color}" → "${bilingualColor}"`);

            return {
              ...colorPart,
              color: bilingualColor
            };
          }

          return colorPart;
        });

        return {
          ...scheme,
          colors: updatedColors
        };
      });

      return {
        ...attr,
        colorSchemes: updatedSchemes
      };
    });

    if (needsUpdate) {
      await prisma.productSku.update({
        where: { id: product.id },
        data: {
          additionalAttributes: updatedAttributes
        }
      });
      updatedCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`翻译完成!`);
  console.log(`  更新产品数: ${updatedCount} 个`);
  console.log(`  翻译颜色项: ${totalTranslated} 个`);
  console.log(`  总产品数: ${products.length} 个`);

  await prisma.$disconnect();
}

addEnglishToProductColors().catch(console.error);

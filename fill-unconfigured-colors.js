const { PrismaClient } = require('./code/backend-api/node_modules/@prisma/client');
const prisma = new PrismaClient();

// 默认颜色配置 - 根据部件名称智能匹配
const defaultColors = {
  // 布料相关
  '布料': { color: '米色/Beige', hexColor: '#F5F5DC' },
  '布料2': { color: '浅灰/Light Gray', hexColor: '#D3D3D3' },

  // 掸头相关
  '掸头': { color: '灰色/Gray', hexColor: '#808080' },

  // 底座相关
  '底座': { color: '红色/Red', hexColor: '#FF0000' },

  // 杆件相关
  '杆件': { color: '灰色/Gray', hexColor: '#808080' },
  '杆身': { color: '银色/Silver', hexColor: '#C0C0C0' },
  '连接杆': { color: '黑色/Black', hexColor: '#000000' },

  // 手柄相关
  '手柄': { color: '黑色/Black', hexColor: '#000000' },

  // 刷头相关
  '刷头': { color: '白色/White', hexColor: '#FFFFFF' },

  // 拖把头相关
  '拖把头': { color: '蓝色/Blue', hexColor: '#3498DB' },

  // 喷头相关
  '喷头': { color: '银色/Silver', hexColor: '#C0C0C0' },

  // 其他
  '通用': { color: '中性灰/Neutral Gray', hexColor: '#999999' }
};

// 获取部件的默认颜色
function getDefaultColor(partName) {
  // 首先尝试精确匹配
  if (defaultColors[partName]) {
    return defaultColors[partName];
  }

  // 然后尝试模糊匹配
  for (const [key, value] of Object.entries(defaultColors)) {
    if (partName.includes(key) || key.includes(partName)) {
      return value;
    }
  }

  // 如果都没匹配到，返回通用颜色
  return defaultColors['通用'];
}

async function fillUnconfiguredColors() {
  console.log('=== 填充未配置的产品配色 ===\n');

  const products = await prisma.productSku.findMany({
    where: {
      additionalAttributes: { not: null }
    }
  });

  console.log(`总共 ${products.length} 个产品\n`);

  let fixedCount = 0;
  let totalFixed = 0;

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
          // 检查是否需要修复
          if (!colorPart.color ||
              colorPart.color === '未配置' ||
              colorPart.color.trim() === '') {

            needsUpdate = true;
            totalFixed++;

            const defaultColor = getDefaultColor(colorPart.part);

            console.log(`  ✓ ${product.productCode} - 组件${attr.componentCode}`);
            console.log(`    ${colorPart.part}: "${colorPart.color || '(空)'}" → "${defaultColor.color}"`);

            return {
              ...colorPart,
              color: defaultColor.color,
              hexColor: defaultColor.hexColor
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
      fixedCount++;
      console.log('');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`修复完成!`);
  console.log(`  修复产品数: ${fixedCount} 个`);
  console.log(`  修复配色项: ${totalFixed} 个`);
  console.log(`  总产品数: ${products.length} 个`);

  await prisma.$disconnect();
}

fillUnconfiguredColors().catch(console.error);

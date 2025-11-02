/**
 * 潘通色卡（Pantone Color）转换工具
 * 包含常用的潘通C系列（涂料色）颜色数据
 */

interface PantoneColor {
  code: string;        // 潘通色号，如 "10C", "225C"
  name: string;        // 颜色名称
  hex: string;         // HEX 颜色值
  rgb: {
    r: number;
    g: number;
    b: number;
  };
}

/**
 * 潘通C系列颜色数据库（部分常用颜色）
 * 数据来源：Pantone Color Bridge Coated
 */
export const PANTONE_COLORS: Record<string, PantoneColor> = {
  // 冷灰系列 (Cool Gray)
  '1C': {
    code: '1C',
    name: 'Cool Gray 1 C',
    hex: '#D9D9D6',
    rgb: { r: 217, g: 217, b: 214 }
  },
  '2C': {
    code: '2C',
    name: 'Cool Gray 2 C',
    hex: '#D0D0CE',
    rgb: { r: 208, g: 208, b: 206 }
  },
  '3C': {
    code: '3C',
    name: 'Cool Gray 3 C',
    hex: '#C8C9C7',
    rgb: { r: 200, g: 201, b: 199 }
  },
  '4C': {
    code: '4C',
    name: 'Cool Gray 4 C',
    hex: '#BBBCBC',
    rgb: { r: 187, g: 188, b: 188 }
  },
  '5C': {
    code: '5C',
    name: 'Cool Gray 5 C',
    hex: '#B1B3B3',
    rgb: { r: 177, g: 179, b: 179 }
  },
  '6C': {
    code: '6C',
    name: 'Cool Gray 6 C',
    hex: '#A7A8AA',
    rgb: { r: 167, g: 168, b: 170 }
  },
  '7C': {
    code: '7C',
    name: 'Cool Gray 7 C',
    hex: '#97999B',
    rgb: { r: 151, g: 153, b: 155 }
  },
  '8C': {
    code: '8C',
    name: 'Cool Gray 8 C',
    hex: '#888B8D',
    rgb: { r: 136, g: 139, b: 141 }
  },
  '9C': {
    code: '9C',
    name: 'Cool Gray 9 C',
    hex: '#75787B',
    rgb: { r: 117, g: 120, b: 123 }
  },
  '10C': {
    code: '10C',
    name: 'Cool Gray 10 C',
    hex: '#63666A',
    rgb: { r: 99, g: 102, b: 106 }
  },
  '11C': {
    code: '11C',
    name: 'Cool Gray 11 C',
    hex: '#53565A',
    rgb: { r: 83, g: 86, b: 90 }
  },
  '110C': {
    code: '110C',
    name: 'Pantone 110 C',
    hex: '#DADD98',
    rgb: { r: 218, g: 221, b: 152 }
  },

  // 玫红/粉红系列 (Pink/Magenta)
  '219C': {
    code: '219C',
    name: 'Pantone 219 C',
    hex: '#F8BBD0',
    rgb: { r: 248, g: 187, b: 208 }
  },
  '225C': {
    code: '225C',
    name: 'Pantone 225 C',
    hex: '#FFB3D9',
    rgb: { r: 255, g: 179, b: 217 }
  },
  '226C': {
    code: '226C',
    name: 'Pantone 226 C',
    hex: '#F999CD',
    rgb: { r: 249, g: 153, b: 205 }
  },
  '227C': {
    code: '227C',
    name: 'Pantone 227 C',
    hex: '#EC008C',
    rgb: { r: 236, g: 0, b: 140 }
  },

  // 红色系列
  '185C': {
    code: '185C',
    name: 'Pantone 185 C',
    hex: '#E4002B',
    rgb: { r: 228, g: 0, b: 43 }
  },
  '186C': {
    code: '186C',
    name: 'Pantone 186 C',
    hex: '#C8102E',
    rgb: { r: 200, g: 16, b: 46 }
  },
  '187C': {
    code: '187C',
    name: 'Pantone 187 C',
    hex: '#A6192E',
    rgb: { r: 166, g: 25, b: 46 }
  },

  // 橙色系列
  '021C': {
    code: '021C',
    name: 'Pantone 021 C',
    hex: '#FE5000',
    rgb: { r: 254, g: 80, b: 0 }
  },
  '1505C': {
    code: '1505C',
    name: 'Pantone 1505 C',
    hex: '#FF6900',
    rgb: { r: 255, g: 105, b: 0 }
  },

  // 黄色系列
  'YELLOWC': {
    code: 'YELLOWC',
    name: 'Pantone Yellow C',
    hex: '#FEDD00',
    rgb: { r: 254, g: 221, b: 0 }
  },
  '102C': {
    code: '102C',
    name: 'Pantone 102 C',
    hex: '#F9E814',
    rgb: { r: 249, g: 232, b: 20 }
  },

  // 绿色系列
  '354C': {
    code: '354C',
    name: 'Pantone 354 C',
    hex: '#00B140',
    rgb: { r: 0, g: 177, b: 64 }
  },
  '355C': {
    code: '355C',
    name: 'Pantone 355 C',
    hex: '#009639',
    rgb: { r: 0, g: 150, b: 57 }
  },

  // 蓝色系列
  '217C': {
    code: '217C',
    name: 'Pantone 217 C',
    hex: '#DA1884',
    rgb: { r: 218, g: 24, b: 132 }
  },
  '285C': {
    code: '285C',
    name: 'Pantone 285 C',
    hex: '#0084CA',
    rgb: { r: 0, g: 132, b: 202 }
  },
  '286C': {
    code: '286C',
    name: 'Pantone 286 C',
    hex: '#0033A0',
    rgb: { r: 0, g: 51, b: 160 }
  },
  '2995C': {
    code: '2995C',
    name: 'Pantone 2995 C',
    hex: '#00A3E0',
    rgb: { r: 0, g: 163, b: 224 }
  },

  // 紫色系列
  '266C': {
    code: '266C',
    name: 'Pantone 266 C',
    hex: '#7B3294',
    rgb: { r: 123, g: 50, b: 148 }
  },
  '2685C': {
    code: '2685C',
    name: 'Pantone 2685 C',
    hex: '#9678D3',
    rgb: { r: 150, g: 120, b: 211 }
  },

  // 黑白系列
  'BLACKC': {
    code: 'BLACKC',
    name: 'Pantone Black C',
    hex: '#2D2926',
    rgb: { r: 45, g: 41, b: 38 }
  },
  'WHITEC': {
    code: 'WHITEC',
    name: 'Pantone White',
    hex: '#FFFFFF',
    rgb: { r: 255, g: 255, b: 255 }
  },

  // 金银色系列
  '871C': {
    code: '871C',
    name: 'Pantone 871 C (Gold)',
    hex: '#85754E',
    rgb: { r: 133, g: 117, b: 78 }
  },
  '877C': {
    code: '877C',
    name: 'Pantone 877 C (Silver)',
    hex: '#85878B',
    rgb: { r: 133, g: 135, b: 139 }
  }
};

/**
 * 根据潘通色号获取颜色信息
 * @param code 潘通色号，如 "10C", "225C", "Cool Gray 10 C"
 * @returns 颜色信息对象，如果找不到返回 null
 */
export function getPantoneColor(code: string): PantoneColor | null {
  // 标准化输入
  const normalizedCode = code.toUpperCase().trim();

  // 直接匹配
  if (PANTONE_COLORS[normalizedCode]) {
    return PANTONE_COLORS[normalizedCode];
  }

  // 尝试提取数字部分匹配（如 "Cool Gray 10 C" -> "10C"）
  const numberMatch = normalizedCode.match(/(\d+)C?$/);
  if (numberMatch) {
    const numberCode = `${numberMatch[1]}C`;
    if (PANTONE_COLORS[numberCode]) {
      return PANTONE_COLORS[numberCode];
    }
  }

  // 尝试匹配颜色名称
  for (const [key, color] of Object.entries(PANTONE_COLORS)) {
    if (color.name.toUpperCase().includes(normalizedCode)) {
      return color;
    }
  }

  return null;
}

/**
 * 将RGB转换为HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * 将HEX转换为RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * 从Excel颜色格式中提取材质和颜色信息
 * @param colorPart Excel格式颜色部分，如 "喷塑3C冷灰", "塑件10C冷灰", "塑件217C蓝", "口袋布白色"
 * @returns { material: string, pantoneCode: string, description: string, hex: string }
 *
 * @example
 * parseColorPart("喷塑3C冷灰")
 * // => { material: "喷塑", pantoneCode: "3C", description: "冷灰", hex: "#C8C9C7" }
 *
 * parseColorPart("塑件217C蓝")
 * // => { material: "塑件", pantoneCode: "217C", description: "蓝", hex: "#..." }
 *
 * parseColorPart("口袋布白色")
 * // => { material: "口袋布", pantoneCode: "", description: "白色", hex: "#FFFFFF" }
 */
export function parseColorPart(colorPart: string): {
  material: string;
  pantoneCode: string;
  description: string;
  hex: string;
} {
  const normalized = colorPart.trim();

  // 正则匹配1: 材质名称 + 潘通色号 + 中文描述
  // 例如: "喷塑3C冷灰" -> 材质:"喷塑", 色号:"3C", 描述:"冷灰"
  const matchWithPantone = normalized.match(/^([^0-9]+?)(\d{1,3}C)(.*)$/i);

  if (matchWithPantone) {
    const material = matchWithPantone[1].trim();
    const pantoneCode = matchWithPantone[2].toUpperCase();
    const description = matchWithPantone[3].trim();
    const hex = colorDescriptionToHex(pantoneCode) || '#CCCCCC';

    return { material, pantoneCode, description, hex };
  }

  // 正则匹配2: 材质名称 + 中文颜色名称（无潘通色号）
  // 例如: "口袋布白色" -> 材质:"口袋布", 颜色:"白色"
  // 常见材质关键词: 塑件、喷塑、雪尼尔、口袋布、TPR刮条、金属等
  const materialKeywords = ['塑件', '喷塑', '雪尼尔', '口袋布', 'TPR刮条', '刮条', '金属', '布料', '海绵', '橡胶', '硅胶'];

  for (const keyword of materialKeywords) {
    if (normalized.startsWith(keyword)) {
      const material = keyword;
      const colorName = normalized.substring(keyword.length).trim();
      const hex = colorDescriptionToHex(colorName) || '#CCCCCC';

      return {
        material,
        pantoneCode: '',
        description: colorName,
        hex
      };
    }
  }

  // 如果以上都不匹配，尝试提取潘通色号
  const pantoneMatch = normalized.match(/(\d{1,3}C)/i);
  if (pantoneMatch) {
    const pantoneCode = pantoneMatch[1].toUpperCase();
    const hex = colorDescriptionToHex(pantoneCode) || '#CCCCCC';
    return {
      material: '默认',
      pantoneCode,
      description: normalized,
      hex
    };
  }

  // 完全解析失败，尝试从整个字符串获取颜色
  const hex = colorDescriptionToHex(normalized) || '#CCCCCC';
  return {
    material: '默认',
    pantoneCode: '',
    description: normalized,
    hex
  };
}

/**
 * 获取所有可用的潘通色号列表
 */
export function getAllPantoneCodes(): string[] {
  return Object.keys(PANTONE_COLORS);
}

/**
 * 按类别获取颜色
 */
export function getPantoneColorsByCategory(): Record<string, PantoneColor[]> {
  return {
    '冷灰系列 (Cool Gray)': Object.values(PANTONE_COLORS).filter(c => c.name.includes('Cool Gray')),
    '粉红/玫红系列 (Pink)': Object.values(PANTONE_COLORS).filter(c => c.code.startsWith('2') && ['219C', '225C', '226C', '227C'].includes(c.code)),
    '红色系列 (Red)': Object.values(PANTONE_COLORS).filter(c => ['185C', '186C', '187C'].includes(c.code)),
    '橙色系列 (Orange)': Object.values(PANTONE_COLORS).filter(c => ['021C', '1505C'].includes(c.code)),
    '黄色系列 (Yellow)': Object.values(PANTONE_COLORS).filter(c => ['YELLOWC', '102C'].includes(c.code)),
    '绿色系列 (Green)': Object.values(PANTONE_COLORS).filter(c => ['354C', '355C'].includes(c.code)),
    '蓝色系列 (Blue)': Object.values(PANTONE_COLORS).filter(c => ['285C', '286C', '2995C'].includes(c.code)),
    '紫色系列 (Purple)': Object.values(PANTONE_COLORS).filter(c => ['266C', '2685C'].includes(c.code)),
    '其他 (Others)': Object.values(PANTONE_COLORS).filter(c => ['BLACKC', 'WHITEC', '871C', '877C'].includes(c.code)),
  };
}

/**
 * 中文颜色名称到HEX的映射
 */
const CHINESE_COLOR_MAP: Record<string, string> = {
  '白色': '#FFFFFF',
  '黑色': '#000000',
  '红色': '#E4002B',
  '蓝色': '#0084CA',
  '绿色': '#00B140',
  '黄色': '#FEDD00',
  '橙色': '#FF6900',
  '紫色': '#7B3294',
  '粉色': '#FFB3D9',
  '灰色': '#888B8D',
  '银色': '#85878B',
  '金色': '#85754E',
};

/**
 * 颜色描述转换为HEX
 * 支持多种输入格式：
 * - 潘通色号: "10C", "225C", "217C", "Cool Gray 10 C"
 * - Excel格式: "喷塑3C冷灰", "塑件10C冷灰", "塑件217C蓝"
 * - HEX: "#FF0000", "FF0000"
 * - RGB: "rgb(255, 0, 0)"
 * - 中文颜色: "白色", "黑色", "蓝色"
 */
export function colorDescriptionToHex(description: string): string | null {
  const normalized = description.trim();

  // 1. 检查是否是HEX格式
  if (/^#?[0-9A-Fa-f]{6}$/.test(normalized)) {
    return normalized.startsWith('#') ? normalized.toUpperCase() : `#${normalized.toUpperCase()}`;
  }

  // 2. 检查是否是RGB格式
  const rgbMatch = normalized.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    return rgbToHex(parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3]));
  }

  // 3. Excel格式解析: "喷塑3C冷灰", "塑件10C冷灰", "塑件217C蓝"
  // 提取潘通色号: 1-3位数字 + C (如: 3C, 10C, 110C, 217C)
  const pantoneCodeMatch = normalized.match(/(\d{1,3}C)/i);
  if (pantoneCodeMatch) {
    const pantoneCode = pantoneCodeMatch[1].toUpperCase();
    const pantone = getPantoneColor(pantoneCode);
    if (pantone) return pantone.hex;
  }

  // 4. 尝试中文描述转换
  // "冷灰10" -> "10C"
  const chineseMatch = normalized.match(/冷灰\s*(\d+)/);
  if (chineseMatch) {
    const pantone = getPantoneColor(`${chineseMatch[1]}C`);
    if (pantone) return pantone.hex;
  }

  // "玫红225" -> "225C"
  const pinkMatch = normalized.match(/玫红\s*(\d+)/);
  if (pinkMatch) {
    const pantone = getPantoneColor(`${pinkMatch[1]}C`);
    if (pantone) return pantone.hex;
  }

  // 5. 纯中文颜色名称
  if (CHINESE_COLOR_MAP[normalized]) {
    return CHINESE_COLOR_MAP[normalized];
  }

  // 6. 直接尝试潘通色号
  const pantone = getPantoneColor(normalized);
  if (pantone) return pantone.hex;

  return null;
}

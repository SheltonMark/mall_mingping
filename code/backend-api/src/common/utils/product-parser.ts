/**
 * 货品规格和附加属性解析工具
 *
 * Excel填写规则：
 * 1. 货品规格格式： [部件编号] 部件名称 | 规格 | 说明
 * 2. 附加属性格式： [部件编号] 材质1:颜色1 + 材质2:颜色2
 */

export interface ComponentSpec {
  code: string;           // 部件编号 (如: A, B, C)
  name: string;           // 部件名称 (如: 伸缩铁杆)
  spec: string;           // 规格 (如: φ19/22*0.27mm*1200mm)
  description: string;    // 说明 (如: 意标螺纹)
}

export interface ColorPart {
  part: string;           // 材质部位 (如: 喷塑, 塑件)
  color: string;          // 颜色 (如: 3C冷灰, 10C冷灰)
}

export interface ColorOption {
  id: string;             // 方案ID (如: option1, option2)
  colors: ColorPart[];    // 颜色组合
}

export interface ComponentColor {
  componentCode: string;  // 部件编号 (对应ComponentSpec.code)
  colorOptions: ColorOption[];  // 多个颜色方案 (支持 | 分隔)
}

/**
 * 解析货品规格
 * @param rawSpec 原始规格文本
 * @returns 解析后的部件规格数组
 *
 * @example
 * 输入:
 * "[A] 伸缩铁杆 | φ19/22*0.27mm*1200mm | 意标螺纹
 *  [B] 拖把 | 39*9cm | 四孔面板+雪尼尔拖把布头"
 *
 * 输出:
 * [
 *   { code: 'A', name: '伸缩铁杆', spec: 'φ19/22*0.27mm*1200mm', description: '意标螺纹' },
 *   { code: 'B', name: '拖把', spec: '39*9cm', description: '四孔面板+雪尼尔拖把布头' }
 * ]
 */
export function parseProductSpec(rawSpec: string | null | undefined): ComponentSpec[] {
  if (!rawSpec || typeof rawSpec !== 'string' || rawSpec.trim() === '') {
    return [];
  }

  // 按换行符分割（支持 \n, \r\n 或 <br>）
  const lines = rawSpec
    .split(/\n|<br\s*\/?>/i)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const results: ComponentSpec[] = [];

  for (const line of lines) {
    // 正则匹配：[编号] 名称 | 规格 | 说明
    const fullMatch = line.match(/\[([A-Z0-9]+)\]\s*([^|]+)\s*\|\s*([^|]*)\s*\|\s*(.*)$/);

    if (fullMatch) {
      results.push({
        code: fullMatch[1].trim(),
        name: fullMatch[2].trim(),
        spec: fullMatch[3].trim(),
        description: fullMatch[4].trim()
      });
      continue;
    }

    // 简化格式：[编号] 名称 | 规格
    const mediumMatch = line.match(/\[([A-Z0-9]+)\]\s*([^|]+)\s*\|\s*(.*)$/);

    if (mediumMatch) {
      results.push({
        code: mediumMatch[1].trim(),
        name: mediumMatch[2].trim(),
        spec: mediumMatch[3].trim(),
        description: ''
      });
      continue;
    }

    // 最简格式：[编号] 名称
    const simpleMatch = line.match(/\[([A-Z0-9]+)\]\s*(.+)$/);

    if (simpleMatch) {
      results.push({
        code: simpleMatch[1].trim(),
        name: simpleMatch[2].trim(),
        spec: '',
        description: ''
      });
    }
  }

  return results;
}

/**
 * 解析附加属性（颜色）- 支持多颜色方案
 * @param rawAttrs 原始属性文本
 * @returns 解析后的颜色属性数组
 *
 * @example
 * 输入 (多颜色方案):
 * "[A] 喷塑:3C冷灰+塑件:10C冷灰 | 喷塑:黑色+塑件:白色 | 喷塑:蓝色+塑件:白色
 *  [B] 塑件:10C冷灰+雪尼尔:10C冷灰+口袋布:白色 | 塑件:白色+雪尼尔:蓝色+口袋布:白色"
 *
 * 输出:
 * [
 *   {
 *     componentCode: 'A',
 *     colorOptions: [
 *       {
 *         id: 'option1',
 *         colors: [
 *           { part: '喷塑', color: '3C冷灰' },
 *           { part: '塑件', color: '10C冷灰' }
 *         ]
 *       },
 *       {
 *         id: 'option2',
 *         colors: [
 *           { part: '喷塑', color: '黑色' },
 *           { part: '塑件', color: '白色' }
 *         ]
 *       }
 *     ]
 *   }
 * ]
 */
export function parseColorAttributes(rawAttrs: string | null | undefined): ComponentColor[] {
  if (!rawAttrs || typeof rawAttrs !== 'string' || rawAttrs.trim() === '') {
    return [];
  }

  // 按换行符分割
  const lines = rawAttrs
    .split(/\n|<br\s*\/?>/i)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const results: ComponentColor[] = [];

  for (const line of lines) {
    // 正则匹配：[编号] 颜色方案1 | 颜色方案2 | ...
    const match = line.match(/\[([A-Z0-9]+)\]\s*(.+)$/);

    if (!match) continue;

    const componentCode = match[1].trim();
    const optionsStr = match[2].trim();

    // 按 | 分割多个颜色方案
    const optionStrings = optionsStr
      .split('|')
      .map(opt => opt.trim())
      .filter(opt => opt.length > 0);

    const colorOptions: ColorOption[] = optionStrings.map((optionStr, index) => {
      // 按 + 分割颜色组合（支持中英文加号和空格）
      const colors: ColorPart[] = optionStr
        .split(/\s*[+\+]\s*/)
        .map(item => item.trim())
        .filter(item => item.length > 0)
        .map(item => {
          // 按 : 分割材质和颜色（格式：材质:颜色）
          const parts = item.split(':').map(p => p.trim());

          if (parts.length >= 2) {
            // 格式: 材质:颜色 (例如：喷塑:3C冷灰)
            return {
              part: parts[0],
              color: parts.slice(1).join(':') // 处理包含多个冒号的情况
            };
          }

          // 如果没有冒号，整个当作颜色，材质为"默认"
          return {
            part: '默认',
            color: item
          };
        });

      return {
        id: `option${index + 1}`,
        colors
      };
    });

    if (colorOptions.length > 0) {
      results.push({
        componentCode,
        colorOptions
      });
    }
  }

  return results;
}

/**
 * 验证颜色属性的部件编号是否都存在于规格中
 * @param specs 部件规格数组
 * @param colors 颜色属性数组
 * @returns 不存在的部件编号列表
 */
export function validateComponentCodes(
  specs: ComponentSpec[],
  colors: ComponentColor[]
): string[] {
  const specCodes = new Set(specs.map(s => s.code));
  const invalidCodes: string[] = [];

  for (const colorItem of colors) {
    if (!specCodes.has(colorItem.componentCode)) {
      invalidCodes.push(colorItem.componentCode);
    }
  }

  return invalidCodes;
}

/**
 * 从品名中提取套装类型
 * @param productName 品名 (如: MP007-清洁四件套)
 * @returns 套装类型 (如: 四件套) 或 null
 */
export function extractSetType(productName: string): string | null {
  if (!productName) return null;

  const match = productName.match(/(二件套|三件套|四件套|五件套|六件套|七件套|八件套|九件套|十件套)/);
  return match ? match[1] : null;
}

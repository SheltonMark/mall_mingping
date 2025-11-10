/**
 * i18n 辅助函数
 * 用于处理组件名称、配色方案名称的中英文显示
 */

export type Language = 'zh' | 'en'

/**
 * 解析双语文本
 * 格式: "中文|English" 或 "中文/English" 或 "中文" (如果没有分隔符,返回原文本)
 * @param text 双语文本
 * @param language 目标语言
 * @returns 对应语言的文本
 */
export function parseBilingualText(text: string | undefined | null, language: Language): string {
  if (!text) return ''

  // 支持 | 和 / 两种分隔符
  if (text.includes('|')) {
    const [zh, en] = text.split('|').map(s => s.trim())
    return language === 'zh' ? (zh || text) : (en || zh || text)
  }

  if (text.includes('/')) {
    const [zh, en] = text.split('/').map(s => s.trim())
    return language === 'zh' ? (zh || text) : (en || zh || text)
  }

  // 否则直接返回原文本
  return text
}

/**
 * 获取组件的显示名称
 * 支持从数据中的 name_en 字段或 name 字段中的双语格式提取
 */
export function getComponentName(
  component: { name: string; name_en?: string },
  language: Language
): string {
  // 优先使用独立的英文字段
  if (language === 'en' && component.name_en) {
    return component.name_en
  }

  // 否则尝试从 name 字段解析双语格式
  return parseBilingualText(component.name, language)
}

/**
 * 获取配色方案的显示名称
 */
export function getSchemeName(
  scheme: { name: string; name_en?: string },
  language: Language
): string {
  // 优先使用独立的英文字段
  if (language === 'en' && scheme.name_en) {
    return scheme.name_en
  }

  // 否则尝试从 name 字段解析双语格式
  return parseBilingualText(scheme.name, language)
}

/**
 * 获取部件的显示名称
 */
export function getPartName(
  part: { part: string; part_en?: string },
  language: Language
): string {
  // 优先使用独立的英文字段
  if (language === 'en' && part.part_en) {
    return part.part_en
  }

  // 否则尝试从 part 字段解析双语格式
  return parseBilingualText(part.part, language)
}

'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface ComponentPart {
  nameZh: string
  nameEn: string
}

interface ComponentConfig {
  id: string
  code: string
  nameZh: string
  nameEn: string
  parts: ComponentPart[]
}

interface ColorPart {
  part: string // 部件中文名
  color: string // 颜色名称
  hexColor: string // 16进制颜色值
}

interface ColorScheme {
  schemeName: string
  colors: ColorPart[]
}

interface ComponentColorSchemes {
  componentCode: string
  schemes: ColorScheme[]
}

interface ColorSchemeManagerProps {
  selectedComponents: string[] // 已选中的组件代码列表
  colorSchemes: ComponentColorSchemes[] // 当前配色方案
  onChange: (schemes: ComponentColorSchemes[]) => void
  onValidate?: (isValid: boolean) => void // 验证回调
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ColorSchemeManager({
  selectedComponents,
  colorSchemes,
  onChange,
  onValidate
}: ColorSchemeManagerProps) {
  const [componentsConfig, setComponentsConfig] = useState<ComponentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingScheme, setEditingScheme] = useState<{
    componentCode: string
    schemeIndex: number | null // null表示新增
    scheme: ColorScheme
  } | null>(null)
  const [currentStep, setCurrentStep] = useState(0)

  // 加载组件配置
  useEffect(() => {
    loadComponentsConfig()
  }, [])

  // 当组件配置或选中组件变化时，验证和同步配色方案
  useEffect(() => {
    if (componentsConfig.length > 0) {
      syncColorSchemes()
    }
  }, [selectedComponents, componentsConfig])

  const loadComponentsConfig = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('admin_token')
      const response = await fetch(`${API_URL}/admin/components?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setComponentsConfig(data.components || [])
      }
    } catch (error) {
      console.error('Failed to load components config:', error)
    } finally {
      setLoading(false)
    }
  }

  // 同步配色方案 - 确保所有选中的组件都有配色方案条目
  const syncColorSchemes = () => {
    const newSchemes = [...colorSchemes]
    let updated = false

    // 添加新选中的组件
    selectedComponents.forEach(componentCode => {
      if (!newSchemes.find(cs => cs.componentCode === componentCode)) {
        newSchemes.push({
          componentCode,
          schemes: []
        })
        updated = true
      }
    })

    // 移除未选中的组件
    const filteredSchemes = newSchemes.filter(cs =>
      selectedComponents.includes(cs.componentCode)
    )

    if (updated || filteredSchemes.length !== newSchemes.length) {
      onChange(filteredSchemes)
      validateAllSchemes(filteredSchemes)
    }
  }

  // 验证所有配色方案
  const validateAllSchemes = (schemes: ComponentColorSchemes[]) => {
    if (!onValidate) return

    // 检查每个选中的组件是否至少有一个完整配置的方案
    const isValid = selectedComponents.every(componentCode => {
      const componentSchemes = schemes.find(cs => cs.componentCode === componentCode)
      return componentSchemes && componentSchemes.schemes.length > 0
    })

    onValidate(isValid)
  }

  // 获取组件配置信息
  const getComponentConfig = (componentCode: string): ComponentConfig | undefined => {
    return componentsConfig.find(c => c.code === componentCode)
  }

  // 开始添加/编辑配色方案
  const handleAddScheme = (componentCode: string) => {
    const config = getComponentConfig(componentCode)
    if (!config || !config.parts || config.parts.length === 0) {
      alert('该组件没有配置部件信息，请先在组件配置中添加部件')
      return
    }

    // 初始化配色方案 - 自动创建所有部件的配色项
    const colors: ColorPart[] = config.parts.map(part => ({
      part: part.nameZh,
      color: '未配置',
      hexColor: '#FFFFFF'
    }))

    setEditingScheme({
      componentCode,
      schemeIndex: null,
      scheme: {
        schemeName: `方案${(colorSchemes.find(cs => cs.componentCode === componentCode)?.schemes.length || 0) + 1}`,
        colors
      }
    })
    setCurrentStep(0)
  }

  const handleEditScheme = (componentCode: string, schemeIndex: number) => {
    const componentSchemes = colorSchemes.find(cs => cs.componentCode === componentCode)
    if (!componentSchemes || !componentSchemes.schemes[schemeIndex]) return

    const scheme = componentSchemes.schemes[schemeIndex]

    // 确保方案包含所有当前组件的部件
    const config = getComponentConfig(componentCode)
    if (config && config.parts) {
      const updatedColors = config.parts.map(part => {
        const existing = scheme.colors.find(c => c.part === part.nameZh)
        return existing || {
          part: part.nameZh,
          color: '未配置',
          hexColor: '#FFFFFF'
        }
      })

      setEditingScheme({
        componentCode,
        schemeIndex,
        scheme: {
          ...scheme,
          colors: updatedColors
        }
      })
    } else {
      setEditingScheme({
        componentCode,
        schemeIndex,
        scheme: { ...scheme }
      })
    }
    setCurrentStep(0)
  }

  const handleDeleteScheme = (componentCode: string, schemeIndex: number) => {
    if (!confirm('确定要删除这个配色方案吗？')) return

    const newSchemes = colorSchemes.map(cs => {
      if (cs.componentCode === componentCode) {
        return {
          ...cs,
          schemes: cs.schemes.filter((_, idx) => idx !== schemeIndex)
        }
      }
      return cs
    })

    onChange(newSchemes)
    validateAllSchemes(newSchemes)
  }

  const handleSaveScheme = () => {
    if (!editingScheme) return

    // 验证：所有部件都必须配置
    const hasUnconfigured = editingScheme.scheme.colors.some(
      c => !c.color || c.color === '未配置' || c.color.trim() === ''
    )

    if (hasUnconfigured) {
      alert('请配置所有部件的颜色，不能有未配置的部件')
      return
    }

    if (!editingScheme.scheme.schemeName.trim()) {
      alert('请输入方案名称')
      return
    }

    const newSchemes = colorSchemes.map(cs => {
      if (cs.componentCode === editingScheme.componentCode) {
        const schemes = [...cs.schemes]
        if (editingScheme.schemeIndex !== null) {
          // 编辑现有方案
          schemes[editingScheme.schemeIndex] = editingScheme.scheme
        } else {
          // 添加新方案
          schemes.push(editingScheme.scheme)
        }
        return { ...cs, schemes }
      }
      return cs
    })

    onChange(newSchemes)
    validateAllSchemes(newSchemes)
    setEditingScheme(null)
    setCurrentStep(0)
  }

  const updateCurrentStepColor = (field: 'color' | 'hexColor', value: string) => {
    if (!editingScheme) return

    const newColors = [...editingScheme.scheme.colors]
    newColors[currentStep] = {
      ...newColors[currentStep],
      [field]: value
    }

    setEditingScheme({
      ...editingScheme,
      scheme: {
        ...editingScheme.scheme,
        colors: newColors
      }
    })
  }

  const handleNextStep = () => {
    if (editingScheme && currentStep < editingScheme.scheme.colors.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">加载组件配置中...</div>
  }

  if (selectedComponents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        请先在"组件管理"中选择至少一个组件
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {selectedComponents.map(componentCode => {
        const config = getComponentConfig(componentCode)
        const componentSchemes = colorSchemes.find(cs => cs.componentCode === componentCode)

        if (!config) {
          return (
            <div key={componentCode} className="border-2 border-red-200 rounded-xl p-6 bg-red-50">
              <div className="text-red-600">
                组件 {componentCode} 配置未找到，请检查组件配置
              </div>
            </div>
          )
        }

        if (!config.parts || config.parts.length === 0) {
          return (
            <div key={componentCode} className="border-2 border-yellow-200 rounded-xl p-6 bg-yellow-50">
              <div className="text-yellow-700">
                组件 [{componentCode}] {config.nameZh} 还没有配置部件信息，请先在组件配置中添加部件
              </div>
            </div>
          )
        }

        return (
          <div key={componentCode} className="border-2 border-gray-200 rounded-xl p-6">
            {/* 组件标题 */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                [{componentCode}] {config.nameZh}
              </h3>
              <button
                type="button"
                onClick={() => handleAddScheme(componentCode)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-sm font-medium"
              >
                <Plus size={16} />
                添加配色方案
              </button>
            </div>

            <div className="text-sm text-gray-500 mb-4">
              规格: {config.parts.map(p => p.nameZh).join(' + ')}
            </div>

            {/* 配色方案列表 */}
            {!componentSchemes || componentSchemes.schemes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                暂无配色方案，点击"添加配色方案"开始配置
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {componentSchemes.schemes.map((scheme, schemeIdx) => (
                  <div
                    key={schemeIdx}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900">{scheme.schemeName}</h4>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditScheme(componentCode, schemeIdx)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="编辑"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteScheme(componentCode, schemeIdx)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-all"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {scheme.colors.map((colorPart, colorIdx) => (
                        <div key={colorIdx} className="flex items-center gap-2 text-xs">
                          <div
                            className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: colorPart.hexColor }}
                          />
                          <span className="text-gray-700 flex-1">
                            {colorPart.part}: <span className="text-gray-900 font-medium">{colorPart.color}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* 配色方案编辑模态框 */}
      {editingScheme && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 标题栏 */}
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">
                {editingScheme.schemeIndex !== null ? '编辑配色方案' : '添加配色方案'}
              </h3>
              <div className="mt-2 text-sm text-gray-600">
                [{editingScheme.componentCode}] {getComponentConfig(editingScheme.componentCode)?.nameZh}
              </div>
            </div>

            {/* 方案名称 */}
            <div className="p-6 border-b border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">方案名称 *</label>
              <input
                type="text"
                value={editingScheme.scheme.schemeName}
                onChange={(e) => setEditingScheme({
                  ...editingScheme,
                  scheme: { ...editingScheme.scheme, schemeName: e.target.value }
                })}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="如: 方案1"
              />
            </div>

            {/* 步骤指示器 */}
            <div className="p-6 pb-0">
              <div className="flex items-center justify-center mb-6">
                <div className="px-6 py-3 bg-primary text-white rounded-lg font-bold text-lg">
                  步骤 {currentStep + 1} / {editingScheme.scheme.colors.length}
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mb-6">
                配置：{editingScheme.scheme.colors[currentStep].part}
              </div>
            </div>

            {/* 当前步骤配色 */}
            <div className="p-6 space-y-4">
              {editingScheme.scheme.colors[currentStep] && (
                <>
                  {/* 颜色名称 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      颜色名称 *
                      <span className="text-xs text-gray-500 ml-2">
                        (请输入中英文格式, 如: 红色/red)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editingScheme.scheme.colors[currentStep].color}
                      onChange={(e) => updateCurrentStepColor('color', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="如: 3C冷灰/Cool Gray, 经典黑/Classic Black"
                    />
                    <div className="mt-2 text-xs text-gray-500">
                      提示: 使用"中文/English"格式可持双语显示
                    </div>
                  </div>

                  {/* 色号 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">色号 *</label>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={editingScheme.scheme.colors[currentStep].hexColor}
                          onChange={(e) => updateCurrentStepColor('hexColor', e.target.value)}
                          className="w-full px-4 py-2.5 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                          placeholder="#000000"
                          maxLength={7}
                        />
                        <div
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: editingScheme.scheme.colors[currentStep].hexColor }}
                        />
                      </div>
                      <input
                        type="color"
                        value={editingScheme.scheme.colors[currentStep].hexColor}
                        onChange={(e) => updateCurrentStepColor('hexColor', e.target.value)}
                        className="w-16 h-11 rounded border-2 border-gray-300 cursor-pointer"
                        title="选择颜色"
                      />
                    </div>
                  </div>

                  {/* 快速选色板 */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">快速选择</label>
                    <div className="grid grid-cols-8 gap-2">
                      {[
                        { name: '黑色', hex: '#000000' },
                        { name: '白色', hex: '#FFFFFF' },
                        { name: '冷灰', hex: '#3C3C3C' },
                        { name: '暖灰', hex: '#6B6B6B' },
                        { name: '银色', hex: '#C0C0C0' },
                        { name: '金色', hex: '#FFD700' },
                        { name: '红色', hex: '#E74C3C' },
                        { name: '蓝色', hex: '#3498DB' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => {
                            updateCurrentStepColor('hexColor', preset.hex)
                            if (!editingScheme.scheme.colors[currentStep].color ||
                                editingScheme.scheme.colors[currentStep].color === '未配置') {
                              updateCurrentStepColor('color', preset.name)
                            }
                          }}
                          className="w-full aspect-square rounded-lg border-2 border-gray-300 hover:border-primary hover:scale-110 transition-all"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 步骤导航按钮 */}
            <div className="p-6 pt-0 flex gap-3">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
                上一步
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                disabled={currentStep === editingScheme.scheme.colors.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
                <ChevronRight size={18} />
              </button>
            </div>

            {/* 底部按钮 */}
            <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => {
                  setEditingScheme(null)
                  setCurrentStep(0)
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveScheme}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium"
              >
                完成配置 ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

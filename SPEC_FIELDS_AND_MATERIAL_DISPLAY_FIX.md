# 规格字段和颜色显示优化总结

## 📋 修改内容

### 1. 规格字段在前端正确显示

#### 规格选择器 (Line 413-424)
已正确使用以下字段：

```typescript
{/* 规格标题 (优先使用title，fallback到productName) */}
<div className="font-semibold text-gray-900">
  {sku.title || sku.productName}
</div>

{/* 规格副标题 (可选) */}
{sku.subtitle && (
  <div className="text-sm text-gray-600 mt-1">{sku.subtitle}</div>
)}

{/* 产品参数 (从specification字段获取) */}
{sku.specification && (
  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{sku.specification}</div>
)}
```

#### 产品参数视图 (Line 293-297)
修改后正确显示产品参数：

```typescript
{selectedSku.specification && (
  <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
    <span className="font-semibold">产品参数:</span>
    <div className="whitespace-pre-line">{selectedSku.specification}</div>
  </div>
)}
```

**修改前**: 检查 `selectedSku.productSpec` (错误字段)
**修改后**: 检查 `selectedSku.specification` (正确字段)

### 2. 材质名称显示位置优化

#### 修改前 (Line 468-521 旧版本):
```
[A] 拖把杆
  🔵🔵        🔴🔴
  喷塑 塑件   喷塑 塑件
```
材质名称显示在每个颜色圆圈下方

#### 修改后 (Line 458-521):
```
[A] 拖把杆 (喷塑 + 塑件)  ✓
  🔵🔵  🔴🔴
```
材质名称显示在部件标题右侧

#### 实现细节:

```typescript
{/* 部件标题行：部件代码 + 部件名称 + 材质组合 + 选中标记 */}
<div className="flex items-center gap-2">
  <span className="px-2 py-1 bg-primary/10 text-primary font-bold text-xs rounded">
    [{component.componentCode}]
  </span>
  <span className="font-semibold text-gray-800">{component.componentName}</span>

  {/* 材质组合显示 - 从第一个颜色方案中提取并去重 */}
  {component.colorSchemes.length > 0 && component.colorSchemes[0].length > 0 && (
    <span className="text-xs text-gray-500">
      (
      {component.colorSchemes[0].map((colorPart, idx) => {
        const parsed = parseColorPart(colorPart.trim())
        return parsed.material
      }).filter((m, idx, arr) => arr.indexOf(m) === idx).join(' + ')}
      )
    </span>
  )}

  {isSelected && (
    <Check size={18} className="text-green-600 ml-auto" />
  )}
</div>

{/* 颜色方案按钮 - 只显示颜色圆圈，无材质名称 */}
<div className="flex flex-wrap gap-3">
  {component.colorSchemes.map((scheme, schemeIndex) => (
    <button key={schemeIndex} onClick={() => handleColorSchemeSelect(componentIndex, schemeIndex)}>
      <div className="flex gap-1.5">
        {scheme.map((colorPart, partIndex) => {
          const parsed = parseColorPart(colorPart.trim())
          return (
            <div
              className="w-6 h-6 rounded-full shadow-sm"  {/* 圆圈大小从5x5增加到6x6 */}
              style={{ backgroundColor: parsed.hex }}
              title={`${parsed.material} ${parsed.pantoneCode} ${parsed.description}`.trim()}
            />
          )
        })}
      </div>
    </button>
  ))}
</div>
```

#### 关键改进:

1. **材质去重**: 使用 `.filter((m, idx, arr) => arr.indexOf(m) === idx)` 去除重复材质
   - 示例: `["喷塑", "塑件", "喷塑", "塑件"]` → `["喷塑", "塑件"]`

2. **材质组合**: 使用 `.join(' + ')` 连接多个材质
   - 示例: `["喷塑", "塑件"]` → `"喷塑 + 塑件"`

3. **圆圈尺寸**: 从 `w-5 h-5` (20px) 增加到 `w-6 h-6` (24px)，视觉更清晰

4. **Tooltip保留**: 鼠标悬停仍显示完整信息 `"喷塑 3C 冷灰"`

## 🎨 前端显示效果

### 规格选择器:
```
┌─────────────────────────────────────────────┐
│ 选择规格 *                                   │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐     │
│ │ 清洁四件套                          │ ¥98 │ ← 规格标题 (title || productName)
│ │ 六件全能清洁套装                    │     │ ← 规格副标题 (subtitle)
│ │ φ22*1200mm, 伸缩杆...              │     │ ← 产品参数 (specification)
│ └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

### 颜色选择器:
```
┌─────────────────────────────────────────────┐
│ 选择颜色                                     │
├─────────────────────────────────────────────┤
│ [A] 拖把杆 (喷塑 + 塑件)              ✓     │ ← 材质显示在这里
│                                             │
│   🔵🔵    🔴🔴    ⚪⚪                      │ ← 只显示颜色圆圈
│                                             │
│ [B] 刷头 (塑件)                             │
│                                             │
│   🟢    🟡    🔴                           │
│                                             │
└─────────────────────────────────────────────┘
```

### 产品参数视图:
```
┌─────────────────────────────────────────────┐
│ 产品参数                                     │
├─────────────────────────────────────────────┤
│ 产品系列:    MF007                          │
│ 分类:        清洁工具 / Cleaning Tools      │
│ 品号:        C10.01.0013                    │
│ 品名:        MF007-清洁四件套               │
│ 产品参数:    φ22*1200mm, 伸缩杆            │ ← 使用 specification 字段
│              4孔面板，雪尼尔布料             │
└─────────────────────────────────────────────┘
```

## 📊 数据流

### 后台配置 → 前端显示:

```
后台产品编辑页:
  规格标题:     "清洁四件套"         → 前端规格选择器第一行
  规格副标题:   "六件全能清洁套装"    → 前端规格选择器第二行
  产品参数:     "φ22*1200mm..."     → 前端规格选择器第三行 + 参数视图

Excel导入:
  附加属性（颜色）: "[A] 拖把杆 φ19/22*0.27mm*1200mm 喷塑3C冷灰+塑件10C冷灰 | 喷塑10C冷灰+塑件217C蓝"
    ↓ 解析
  ComponentColor: {
    componentCode: "A",
    componentName: "拖把杆",
    colorSchemes: [
      ["喷塑3C冷灰", "塑件10C冷灰"],
      ["喷塑10C冷灰", "塑件217C蓝"]
    ]
  }
    ↓ 提取材质
  材质列表: ["喷塑", "塑件", "喷塑", "塑件"]
    ↓ 去重
  唯一材质: ["喷塑", "塑件"]
    ↓ 组合
  前端显示: "[A] 拖把杆 (喷塑 + 塑件)"
```

## ✅ 验证清单

- [x] 规格标题 (`title`) 在规格选择器正确显示
- [x] 规格副标题 (`subtitle`) 在规格选择器正确显示
- [x] 产品参数 (`specification`) 在规格选择器正确显示
- [x] 产品参数 (`specification`) 在参数视图正确显示
- [x] 材质名称显示在部件标题右侧（如 "[A] 拖把杆 (喷塑 + 塑件)"）
- [x] 颜色圆圈下方不显示材质名称
- [x] 材质名称自动去重
- [x] 多个材质用 " + " 连接
- [x] 颜色圆圈尺寸增加到 6x6
- [x] Tooltip保留完整颜色信息

## 📝 文件变更

**修改文件**: [products/[id]/page.tsx](code/frontend/src/app/(frontend)/products/[id]/page.tsx)

**变更位置**:
1. Line 293-297: 产品参数视图字段修正
   - `selectedSku.productSpec` → `selectedSku.specification`

2. Line 458-521: 颜色选择器材质显示优化
   - 材质名称移至部件标题右侧
   - 实现材质去重和组合
   - 移除颜色圆圈下方的材质名称
   - 圆圈尺寸 w-5 h-5 → w-6 h-6

## 🧪 测试示例

### 示例1: 多材质组合
```
输入: [A] 拖把杆 喷塑3C冷灰+塑件10C冷灰 | 喷塑白色+塑件黑色
显示: [A] 拖把杆 (喷塑 + 塑件)
      🔵🔵  ⚪⚫
```

### 示例2: 单一材质
```
输入: [B] 刷头 塑件白色 | 塑件黑色
显示: [B] 刷头 (塑件)
      ⚪  ⚫
```

### 示例3: 复杂材质组合
```
输入: [C] 底座 喷塑3C冷灰+塑件白色+TPR刮条黑色
显示: [C] 底座 (喷塑 + 塑件 + TPR刮条)
      🔵⚪⚫
```

---

**修改完成时间**: 2025-11-02
**修改人员**: Claude Code
**测试状态**: ✅ 编译通过，等待用户验收

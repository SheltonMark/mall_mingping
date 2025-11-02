# 后台 ↔ 前端 参数映射表

## 📊 数据流向图

```
Excel导入 → 后端API → 数据库 → 前端API → 前端页面显示
```

---

## 1️⃣ 分类 (Category)

### 后台管理 → 数据库
| 后台字段 | 数据库字段 | 类型 | 说明 |
|---------|-----------|------|------|
| 分类代码 | `categoryCode` | String | 如: MF, TB |
| 中文名称 | `nameZh` | String | 如: MF类 |
| 英文名称 | `nameEn` | String | 如: MF Series |
| 状态 | `status` | Enum | active/inactive |

### 前端显示位置
| 显示位置 | 使用的字段 | 文件路径 |
|---------|-----------|---------|
| 产品列表页 - 分类标签 | `category.nameZh` | `/products/page.tsx` |
| 产品详情页 - 分类徽章 | `category.code` (翻译key) | `/products/[id]/page.tsx:392` |
| 产品详情页 - 参数列表 | `category.nameZh + nameEn` | `/products/[id]/page.tsx:281` |

### 测试项
- [ ] Excel导入时自动创建分类 (如MF, TB)
- [ ] 分类在产品列表页正确显示
- [ ] 分类标签在详情页正确显示
- [ ] 翻译key正确工作 (t(`category.${code}`))

---

## 2️⃣ 产品组 (Product Group)

### 后台管理 → 数据库
| 后台字段 | 数据库字段 | 类型 | 说明 |
|---------|-----------|------|------|
| 产品组代码 | `prefix` | String | 如: MF007, TB001 |
| 中文名称 | `groupNameZh` | String | 如: MF007-清洁四件套 |
| 英文名称 | `groupNameEn` | String | 可选 |
| 中文描述 | `descriptionZh` | String | 可选 |
| 英文描述 | `descriptionEn` | String | 可选 |
| 主图片 | `mainImage` | String | URL |
| 共享视频 | `sharedVideo` | String | YouTube URL |
| 排序 | `sortOrder` | Int | 默认0 |
| 是否发布 | `isPublished` | Boolean | true/false |
| 状态 | `status` | Enum | active/inactive |

### 前端显示位置
| 显示位置 | 使用的字段 | 文件路径 |
|---------|-----------|---------|
| 产品列表页 - 卡片标题 | `groupNameZh` | `/products/page.tsx` |
| 产品列表页 - 英文副标题 | `groupNameEn` | `/products/page.tsx` |
| 产品列表页 - 卡片图片 | `mainImage` | `/products/page.tsx` |
| 产品详情页 - 页面标题 | `groupNameZh + groupNameEn` | `/products/[id]/page.tsx:376-380` |
| 产品详情页 - 描述文字 | `descriptionZh` | `/products/[id]/page.tsx:382` |
| 产品详情页 - 视频播放 | `sharedVideo` | `/products/[id]/page.tsx:252` |
| 产品详情页 - 系列代码 | `prefix` | `/products/[id]/page.tsx:277` |

### 测试项
- [ ] Excel导入时自动创建产品组 (MF007, TB001)
- [ ] 产品组在列表页正确显示
- [ ] 产品组标题/描述在详情页正确显示
- [ ] 视频链接正确嵌入和播放
- [ ] isPublished=false的产品组在后台可见，前台不可见
- [ ] isPublished=true的产品组在前台可见

---

## 3️⃣ 产品SKU (Product SKU)

### Excel导入 → 数据库
| Excel列名 | 数据库字段 | 类型 | 解析逻辑 |
|----------|-----------|------|---------|
| **品号** | `productCode` | String | 直接存储 (如: C10.01.0013) |
| **品名** | `productName` | String | 直接存储 (如: MF007-清洁四件套) |
| 品名 (前缀提取) | `productGroupId` | 外键 | 从品名提取前缀 (MF007) → 关联产品组 |
| **货品规格** | `productSpec` | JSON | 解析为部件数组 (见下方详细解析) |
| **附加属性(颜色)** | `additionalAttributes` | JSON | 解析为部件颜色数组 (见下方详细解析) |
| 价格 | `price` | Decimal | 可选，默认0 |
| 库存 | `stock` | Int | 可选，默认0 |
| 图片 | `images` | JSON | 可选，JSON数组 |
| 主图 | `mainImage` | String | 可选，URL |
| 状态 | `status` | Enum | 默认ACTIVE |

### 前端显示位置
| 显示位置 | 使用的字段 | 文件路径 |
|---------|-----------|---------|
| 产品详情页 - **品号徽章** ✨ | `productCode` | `/products/[id]/page.tsx:398` |
| 产品详情页 - 规格选择器 | `productName + productCode` | `/products/[id]/page.tsx:423-424` |
| 产品详情页 - 价格显示 | `price` | `/products/[id]/page.tsx:402` |
| 产品详情页 - 参数表 | `productCode + productName + specification + price` | `/products/[id]/page.tsx:286-301` |
| 购物车 | `productCode (sku)` | `/cart/page.tsx` |
| 订单确认页 | `productCode` | `/order-confirmation/page.tsx` |

### 测试项
- [ ] 品号正确显示在详情页
- [ ] 切换不同规格时，品号动态更新 ✨
- [ ] 价格显示正确
- [ ] SKU代码正确传递到购物车
- [ ] 订单中SKU代码正确保存

---

## 4️⃣ 货品规格 (Product Specification)

### Excel格式 → 数据库JSON
```
Excel原始格式:
[A] 伸缩杆 | Φ19/22*0.27mm*1200mm | 意标螺纹
[B] 拖把 | 33*9cm | 四孔面板+雪尼尔拖把抽头
[C] 刷刷 | 标准 | 两用版刷头

↓ 解析为JSON (productSpec)

{
  "A": {
    "name": "伸缩杆",
    "dimensions": "Φ19/22*0.27mm*1200mm",
    "details": "意标螺纹"
  },
  "B": {
    "name": "拖把",
    "dimensions": "33*9cm",
    "details": "四孔面板+雪尼尔拖把抽头"
  },
  "C": {
    "name": "刷刷",
    "dimensions": "标准",
    "details": "两用版刷头"
  }
}
```

### 前端显示位置
| 显示位置 | 使用方式 | 文件路径 |
|---------|---------|---------|
| 产品详情页 - 规格说明 | `specification` 字段 (文本格式) | `/products/[id]/page.tsx:295` |
| 订单导出Excel | `productSpec` JSON → 格式化输出 | 后端导出逻辑 |

### 测试项
- [ ] Excel导入时规格正确解析
- [ ] 规格在详情页正确显示
- [ ] 订单导出时规格格式正确

---

## 5️⃣ 附加属性-颜色 (Additional Attributes - Colors)

### Excel格式 → 数据库JSON → 前端颜色选择器

```
Excel原始格式:
[A] 喷塑:3C/冷灰 + 塑件:10C/冷灰
[B] 塑件:10C/冷灰 + 雪尼尔:110C/冷灰 + 口袋布:白色
[C] 塑件:10C/冷灰 + TPR刮条:黑色

↓ 解析逻辑 (parseComponentColors)

[
  {
    "componentCode": "A",
    "componentName": "喷塑",
    "colorSchemes": [
      ["喷塑:3C/冷灰", "塑件:10C/冷灰"]
    ]
  },
  {
    "componentCode": "B",
    "componentName": "塑件",
    "colorSchemes": [
      ["塑件:10C/冷灰", "雪尼尔:110C/冷灰", "口袋布:白色"]
    ]
  },
  ...
]

↓ 前端渲染为颜色圆圈选择器

🔵🔘 (每个颜色为一个圆圈，点击选择)
```

### 前端显示位置
| 显示位置 | 使用方式 | 文件路径 |
|---------|---------|---------|
| 产品详情页 - 颜色选择器 | `parseComponentColors()` 解析 | `/products/[id]/page.tsx:21-51` |
| 产品详情页 - 颜色圆圈 | 颜色名 → Hex转换 | `/products/[id]/page.tsx:493-510` |
| 购物车 - 颜色组合 | `colorCombination` 对象 | `/cart/page.tsx` |
| 订单确认 - 颜色描述 | 格式化颜色组合字符串 | `/order-confirmation/page.tsx` |

### 颜色映射逻辑
```typescript
// 颜色名称 → Hex代码
const colorMap = {
  '3C冷灰': '#9CA3AF',
  '10C冷灰': '#D1D5DB',
  '110C冷灰': '#F3F4F6',
  '蓝色': '#3B82F6',
  '白色': '#FFFFFF',
  '黑色': '#1F2937',
  ...
}
```

### 测试项
- [ ] Excel导入时颜色属性正确解析
- [ ] 颜色选择器正确显示（部件A、B、C...）
- [ ] 颜色圆圈正确渲染（Hex颜色正确）
- [ ] 选择颜色后，状态正确更新
- [ ] Apple风格渐进式选择正常工作（选A后显示B）
- [ ] 颜色组合正确传递到购物车
- [ ] 订单中颜色组合正确保存和显示

---

## 6️⃣ 图片和视频 (Images & Videos)

### 数据库 → 前端
| 后台字段 | 前端显示 | 文件路径 |
|---------|---------|---------|
| SKU.images (JSON数组) | 图集模式 - 主图+缩略图 | `/products/[id]/page.tsx:243-331` |
| SKU.mainImage | 默认图片（如无images） | `/products/[id]/page.tsx:215` |
| ProductGroup.mainImage | 产品组默认图 | `/products/[id]/page.tsx:215` |
| ProductGroup.sharedVideo | 视频模式 - YouTube嵌入 | `/products/[id]/page.tsx:252-256` |

### 测试项
- [ ] SKU图片正确显示（最多5张）
- [ ] 缩略图切换正常工作
- [ ] 视频链接正确嵌入
- [ ] 图集/视频/参数切换正常

---

## 7️⃣ 购物车和订单 (Cart & Orders)

### 购物车数据结构
```typescript
{
  skuId: string,           // SKU ID
  sku: string,             // 品号 (productCode) ✨
  groupName: string,       // 产品组名称
  colorCombination: {      // 颜色组合
    A: ["喷塑:3C/冷灰", "塑件:10C/冷灰"],
    B: ["塑件:10C/冷灰", ...],
  },
  quantity: number,        // 数量
  price: number,           // 单价
  mainImage: string        // 图片
}
```

### 测试项
- [ ] 加入购物车时，品号正确传递
- [ ] 购物车中品号正确显示
- [ ] 颜色组合正确保存到购物车
- [ ] 订单确认页显示完整信息
- [ ] 订单提交后，后端正确保存所有字段
- [ ] 订单导出Excel包含所有必要信息

---

## 🧪 测试清单

### 阶段1: Excel导入测试
1. [ ] 使用 `产品导入模板_最终版.xlsx` 导入
2. [ ] 确认3个SKU全部导入成功
3. [ ] 确认分类自动创建 (MF, TB)
4. [ ] 确认产品组自动创建 (MF007, TB001)
5. [ ] 确认前缀从品名正确提取

### 阶段2: 后台管理测试
1. [ ] 后台产品列表显示所有产品组（包括MF007）
2. [ ] 搜索功能正常工作
3. [ ] 产品详情页显示所有字段
4. [ ] 编辑产品功能正常
5. [ ] 发布/取消发布功能正常

### 阶段3: 前台展示测试
1. [ ] 产品列表页显示已发布产品
2. [ ] 产品详情页正确显示
3. [ ] **品号显示** - 选择规格后显示，切换规格时更新 ✨
4. [ ] 价格正确显示
5. [ ] 规格选择器正常工作
6. [ ] 颜色选择器正常工作（部件A→B→C渐进式）
7. [ ] 图片切换正常
8. [ ] 视频播放正常

### 阶段4: 购物流程测试
1. [ ] 加入购物车功能正常
2. [ ] 购物车显示完整信息（品号、颜色组合）
3. [ ] 修改数量功能正常
4. [ ] 移除商品功能正常
5. [ ] 结账流程正常
6. [ ] 订单确认页显示完整信息
7. [ ] 订单提交成功
8. [ ] 订单导出Excel格式正确

---

## 📝 当前状态

✅ **已完成**:
- 品号显示功能添加到产品详情页
- 后台分页限制修复 (limit=1000)
- Excel模板移除"状态"列
- 前缀提取逻辑修复（从品名提取）

⏳ **待测试**:
- 完整的端到端参数联调
- 各个测试项逐一验证

---

## 🚀 下一步行动

1. 刷新前端页面，测试品号显示功能
2. 按照测试清单依次测试每个阶段
3. 记录发现的问题
4. 修复问题并重新测试

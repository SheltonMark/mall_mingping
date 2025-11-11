# LEMOPX 前端快速开始指南

## 🚀 快速启动

### 1. 安装依赖
```bash
cd code/frontend
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── page.tsx               # 首页 (/)
│   ├── layout.tsx             # 根布局 (包含Navbar)
│   ├── products/
│   │   ├── page.tsx          # 产品列表 (/products)
│   │   └── [id]/page.tsx     # 产品详情 (/products/[id])
│   ├── cart/page.tsx         # 购物车 (/cart)
│   └── checkout/page.tsx     # 订单创建 (/checkout)
│
├── components/
│   └── layout/Navbar.tsx      # 统一导航栏
│
├── lib/
│   └── mockData.ts            # Mock数据
│
└── types/
    └── index.ts               # TypeScript类型定义
```

## 🎨 核心功能演示

### 1. 产品颜色选择器
- 访问任意产品详情页
- 点击不同颜色圆圈选择组件颜色
- 实时显示对应的 SKU 品号
- 价格自动更新

### 2. 产品组展示逻辑
- 产品列表页显示产品组（合并相同组件的SKU）
- 每个产品组展示所有可选颜色
- 显示该组有多少种配色组合

### 3. 购物车
- 显示每个商品的完整配色信息
- 显示对应的SKU品号
- 支持数量调整和删除

## 🔧 关键代码位置

### 颜色选择逻辑
**文件**: `src/app/products/[id]/page.tsx`
```typescript
// 选择颜色时触发
const handleColorSelect = (component: string, colorName: string) => {
  setSelectedColors((prev) => ({
    ...prev,
    [component]: colorName,
  }))
}

// 根据颜色组合查找SKU
useEffect(() => {
  if (productGroup && Object.keys(selectedColors).length > 0) {
    const sku = findSKUByColors(productGroup, selectedColors)
    setCurrentSKU(sku)
  }
}, [selectedColors, productGroup])
```

### 数据结构
**文件**: `src/types/index.ts`
- `ProductGroup`: 产品组（合并相同组件的产品）
- `ProductSKU`: SKU变体（不同配色=不同品号）
- `CartItem`: 购物车项目

### Mock 数据
**文件**: `src/lib/mockData.ts`
- 包含 3 个产品组示例
- 每个产品组有多个 SKU 变体
- 演示不同的颜色组合

## 🎯 品牌设计系统

### 颜色
- **主色**: `#BDB76B` (primary)
- **深主色**: `#A0A05A` (primary-dark)
- **次要色**: `#8B8970`
- **强调色**: `#FFD700`

### 使用示例
```tsx
<button className="bg-primary hover:bg-primary-dark text-white">
  按钮
</button>
```

### 动画
```tsx
<div className="animate-fade-in-up">淡入上升</div>
<div className="animate-swoop-in">俯冲进入</div>
```

### 悬浮效果
```tsx
<div className="hover:-translate-y-2 transition-transform duration-300">
  悬浮卡片
</div>
```

## 📝 添加新产品（Mock数据）

编辑 `src/lib/mockData.ts`：

```typescript
{
  id: 'group-4',
  groupName: '新产品名称',
  categoryId: 'cat-1',
  description: '产品描述',
  baseComponents: ['组件1', '组件2'],
  availableColors: {
    组件1: [
      { id: 'color-1', name: '红色', hex: '#FF0000' },
      { id: 'color-2', name: '蓝色', hex: '#0000FF' },
    ],
    组件2: [
      { id: 'color-3', name: '白色', hex: '#FFFFFF' },
    ],
  },
  skus: [
    {
      id: 'sku-8',
      sku: 'PROD-RED-WHT',
      groupId: 'group-4',
      name: '新产品名称',
      mainImage: '/images/product.jpg',
      detailImages: [],
      price: 99.00,
      colorCombination: {
        组件1: { name: '红色', hex: '#FF0000' },
        组件2: { name: '白色', hex: '#FFFFFF' },
      },
      status: 'active',
    },
    // 添加更多 SKU 变体...
  ],
  sortOrder: 4,
  status: 'active',
}
```

## 🐛 常见问题

### Q: 颜色选择后没有显示 SKU？
A: 确保 Mock 数据中存在对应的颜色组合。如果没有匹配的 SKU，会显示"该配色暂无货"。

### Q: 如何添加新页面？
A: 在 `src/app/` 下创建新文件夹和 `page.tsx`，Next.js 会自动路由。

### Q: 如何修改导航栏？
A: 编辑 `src/components/layout/Navbar.tsx`

## 🔜 即将开发

- [ ] 订单管理页面
- [ ] 购物车状态管理（Zustand）
- [ ] 业务员登录
- [ ] 后台管理系统

## 📚 相关文档

- [需求文档](../../PRD/REQUIREMENTS.md)
- [项目状态](../../PROJECT-STATUS.md)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**最后更新**: 2025-10-25

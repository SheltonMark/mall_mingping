# LEMOPX 订单管理系统 - 前端演示

这是一个可供演示的前端页面，基于组件化设计，展示了产品列表、产品详情（含组件颜色选择器）等核心功能。

## 🎨 设计特点

### 主题色
- 主色: `#BDB76B` (Dark Khaki)
- 辅助色: `#8B8970`
- 强调色: `#FFD700`

### 字体
- Space Grotesk (Google Fonts)

## 🚀 快速开始

### 1. 安装依赖

```bash
cd code/frontend
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
src/
├── app/                    # Next.js 应用页面
│   ├── page.tsx           # 首页（入口页）
│   ├── products/          # 产品模块
│   │   ├── page.tsx       # 产品列表页
│   │   └── [id]/
│   │       └── page.tsx   # 产品详情页 ⭐核心功能
│   └── globals.css        # 全局样式
├── components/            # 组件库
│   ├── common/           # 通用组件
│   │   ├── Button.tsx    # 按钮组件
│   │   ├── Card.tsx      # 卡片组件
│   │   ├── Input.tsx     # 输入框组件
│   │   └── ColorPicker.tsx  # 颜色选择器 ⭐
│   └── product/          # 产品相关组件
│       ├── ProductCard.tsx      # 产品卡片
│       └── ComponentSelector.tsx # 组件配置选择器 ⭐核心
├── types/                # TypeScript 类型定义
│   └── index.ts
└── lib/                  # 工具函数
    └── mockData.ts       # 模拟数据

```

## ✨ 核心功能展示

### 1. 产品列表页 (`/products`)
- ✅ 产品网格展示
- ✅ 分类筛选
- ✅ 价格排序
- ✅ 显示所有组件的颜色圆圈
- ✅ 快速添加按钮

### 2. 产品详情页 (`/products/[id]`) ⭐核心
- ✅ 产品图片展示（主图+缩略图）
- ✅ **组件化颜色选择器**（核心功能）
  - 每个组件单独选择颜色
  - 实时显示选择状态
  - 颜色圆圈+对勾标识
  - 必须选择所有组件才能下单
- ✅ 数量选择器（+/-按钮）
- ✅ 实时计算小计
- ✅ 产品描述和特性展示
- ✅ 响应式设计

### 3. 组件化设计亮点

#### ColorPicker 组件
```tsx
<ColorPicker
  colors={component.colors}
  selectedColorId={selectedColors[component.id]}
  onSelect={(colorId) => handleColorSelect(component.id, colorId)}
/>
```

#### ComponentSelector 组件
- 自动渲染所有组件
- 步骤式选择界面（1️⃣ 2️⃣ 3️⃣）
- 已选择状态提示（✓）
- 智能验证（未完成选择时禁用按钮）

## 📦 Mock 数据

当前包含3个演示产品：

1. **LEMOPX Elite Mop 精英拖把套装** - 多组件产品
   - 拖把杆（4种颜色）
   - 拖把头（2种颜色）
   - 抹布（4种颜色）
   - 价格：$39.99

2. **LEMOPX 超细纤维抹布** - 单组件产品
   - 抹布（4种颜色）
   - 价格：$4.99

3. **LEMOPX Pro Mop 专业拖把** - 多组件产品
   - 拖把杆（2种颜色）
   - 拖把头（2种颜色）
   - 价格：$59.99

## 🎯 下一步开发

- [ ] 购物车功能
- [ ] 结账流程
- [ ] 后台管理系统
- [ ] 订单管理
- [ ] 用户管理
- [ ] 真实API集成

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks (未来可添加 Zustand)
- **UI组件**: 自定义组件库

## 📱 响应式支持

- ✅ 桌面端（1920px+）
- ✅ 平板端（768px - 1024px）
- ✅ 移动端（< 768px）

## 💡 设计理念

1. **组件化优先** - 所有UI元素都是可复用组件
2. **类型安全** - 完整的TypeScript类型定义
3. **用户体验** - 清晰的视觉反馈和引导
4. **灵活扩展** - 易于添加新功能和组件
5. **符合需求** - 严格按照PRD文档设计

---

**版本**: 1.0.0 (演示版)
**更新时间**: 2024-10-25

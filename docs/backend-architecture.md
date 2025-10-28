# 后台管理系统架构设计

## 🎯 系统模块概览

### 1️⃣ **业务员管理模块** (Salesperson Management)

```
功能清单:
├── 业务员列表
│   ├── 中文姓名
│   ├── 英文姓名
│   ├── 账号ID
│   ├── 入职时间
│   ├── 联系方式 (邮箱/电话)
│   ├── 客户数量统计
│   ├── 订单数量统计
│   └── 销售额统计
│
├── 新增/编辑业务员
│   ├── 基本信息录入
│   ├── 账号权限设置
│   └── 密码管理
│
└── 业务员详情
    ├── 个人信息
    ├── 名下客户列表
    ├── 订单历史记录
    └── 业绩统计图表
```

**数据表设计:**
```typescript
interface Salesperson {
  id: string
  accountId: string          // 账号ID (如: 3579)
  chineseName: string        // 中文名 (如: 倩倩)
  englishName: string        // 英文名 (如: Qianqian)
  email: string
  phone: string
  hireDate: string           // 入职时间
  avatar?: string
  createdAt: string
  updatedAt: string
}
```

---

### 2️⃣ **订单管理模块** (Order Management)

```
功能清单:
├── 订单列表
│   ├── 订单筛选 (按状态/日期/业务员/客户)
│   ├── 订单搜索
│   ├── 订单状态管理 (意向单/正式单)
│   ├── 批量操作
│   └── 排序功能
│
├── 订单详情/编辑
│   ├── 订单基本信息
│   ├── 客户信息
│   ├── 产品列表
│   ├── 订单参数管理 ⭐
│   │   ├── 纸卡编码
│   │   ├── 外箱编码
│   │   ├── 箱规
│   │   └── 自定义参数字段
│   └── 订单备注
│
├── 订单导出 ⭐
│   ├── 单个订单导出 Excel
│   ├── 批量导出
│   ├── 导出模板配置
│   └── 导出格式自定义
│
└── 订单参数配置 ⭐
    ├── 参数字段管理
    │   ├── 字段名称 (中/英)
    │   ├── 字段类型 (文本/数字/日期/下拉)
    │   ├── 是否必填
    │   └── 显示顺序
    └── 预设参数模板
```

**关键功能设计:**
```typescript
// 订单参数配置
interface OrderParameterConfig {
  id: string
  fieldName: string          // 字段英文名
  fieldNameZh: string        // 字段中文名
  fieldType: 'text' | 'number' | 'date' | 'select' | 'textarea'
  isRequired: boolean
  defaultValue?: string
  options?: string[]         // 下拉选项
  displayOrder: number
  isActive: boolean
}
```

---

### 3️⃣ **品号管理模块** (Product Code Management) ⭐新名称

```
功能清单:
├── 品号列表
│   ├── 分类筛选
│   ├── 材料筛选
│   ├── 上架状态筛选
│   ├── 搜索功能
│   └── 批量操作
│
├── ERP导入功能 ⭐
│   ├── Excel模板下载
│   ├── 文件上传解析
│   ├── 数据预览确认
│   ├── 导入结果报告
│   └── 错误处理
│
├── 品号新增/编辑
│   ├── 基本信息
│   │   ├── 商品组名称 (中/英)
│   │   ├── 商品描述 (中/英)
│   │   ├── 分类 (需提供中英文)
│   │   ├── 材料 (需提供中英文)
│   │   └── 标签
│   │
│   ├── SKU管理
│   │   ├── 品号编码 (Product Code) ⭐
│   │   ├── 颜色组合
│   │   ├── 价格编辑 ⭐
│   │   ├── 库存数量
│   │   ├── 图片上传
│   │   └── 规格参数
│   │
│   └── 上架管理 ⭐
│       ├── 上架/下架状态
│       ├── 定时上架
│       └── 前端显示控制
│
├── 分类管理 ⭐
│   ├── 新增分类 (需同时输入中英文)
│   ├── 分类列表 (显示中英文)
│   ├── 分类排序
│   └── 分类启用/禁用
│
└── 材料管理 ⭐
    ├── 新增材料 (需同时输入中英文)
    ├── 材料列表 (显示中英文)
    └── 材料启用/禁用
```

**ERP导入Excel格式:**
```
| 品号 | 商品组名称 | 商品名称(中) | 商品名称(英) | 分类中文 | 分类英文 | 材料中文 | 材料英文 | 价格 | 颜色-部件 | 图片URL |
|------|-----------|-------------|-------------|---------|---------|---------|---------|------|----------|---------|
| MOP-001 | 旋转拖把套装 | 旋转拖把套装 | Rotating Mop Set | 清洁工具 | Cleaning Tools | 塑料 | Plastic | 89.00 | 蓝-手柄,白-拖把头 | http://... |
```

**分类/材料数据结构:**
```typescript
interface Category {
  id: string
  nameZh: string           // 中文名称 ⭐
  nameEn: string           // 英文名称 ⭐
  parentId?: string
  sortOrder: number
  isActive: boolean
}

interface Material {
  id: string
  nameZh: string           // 中文名称 ⭐
  nameEn: string           // 英文名称 ⭐
  isActive: boolean
}
```

---

### 4️⃣ **客户管理模块** (Customer Management)

```
功能清单:
├── 客户列表
│   ├── 按业务员筛选
│   ├── 客户类型筛选 (新客户/老客户)
│   ├── 搜索功能
│   └── 批量导入/导出
│
├── 客户详情/编辑
│   ├── 基本信息
│   │   ├── 公司名称
│   │   ├── 联系人
│   │   ├── 邮箱/电话
│   │   └── 地址
│   │
│   ├── 业务信息
│   │   ├── 所属业务员
│   │   ├── 客户类型
│   │   ├── 客户标签
│   │   └── 客户等级
│   │
│   └── 关联数据
│       ├── 订单历史
│       ├── 交易统计
│       └── 沟通记录
│
└── 客户分配
    └── 业务员调整
```

---

### 5️⃣ **系统管理模块** (System Management)

```
功能清单:
├── 前端配置 ⭐
│   ├── 首页配置
│   │   ├── 轮播图管理 (图片/链接/排序)
│   │   ├── 热门产品配置
│   │   └── 推荐分类
│   │
│   ├── 关于我们页面 ⭐
│   │   ├── 公司介绍 (富文本编辑器,中/英)
│   │   ├── 发展历程
│   │   ├── 工厂图片轮播
│   │   ├── 统计数据 (30年经验等)
│   │   └── 联系方式
│   │
│   ├── 导航栏配置
│   ├── 页脚配置
│   └── SEO设置
│
├── 认证管理 ⭐ (新增)
│   ├── 资质证书管理
│   │   ├── 证书列表 (名称/类型/有效期/状态)
│   │   ├── 上传证书文件 (PDF/图片)
│   │   ├── 证书分类 (ISO认证/产品认证/专利证书/荣誉证书等)
│   │   ├── 证书预览/下载
│   │   ├── 过期提醒
│   │   └── 前端展示控制
│   │
│   ├── 工厂资质
│   │   ├── 营业执照
│   │   ├── 生产许可证
│   │   ├── 环保认证
│   │   ├── 质量认证 (ISO9001等)
│   │   └── 安全认证
│   │
│   └── 产品认证
│       ├── CE认证
│       ├── FDA认证
│       ├── SGS检测报告
│       ├── 专利证书
│       └── 其他国际认证
│
├── 管理员管理
│   ├── 管理员列表
│   ├── 角色权限管理
│   ├── 密码重置 ⭐
│   └── 操作日志
│
└── 系统设置
    ├── 公司信息
    ├── 货币设置
    ├── 邮件配置
    └── 文件存储配置
```

---

### 6️⃣ **订阅管理模块** (Subscription Management)

```
功能清单:
├── 订阅列表
│   ├── 邮箱列表
│   ├── 订阅时间
│   ├── 订阅来源
│   └── 状态管理
│
├── 邮件群发
│   ├── 邮件模板
│   ├── 收件人筛选
│   ├── 定时发送
│   └── 发送记录
│
└── 订阅统计
    └── 订阅增长趋势
```

---

### 7️⃣ **合作管理模块** (Partnership Management)

```
功能清单:
├── 合作申请列表
│   ├── 申请人信息
│   ├── 公司信息
│   ├── 留言内容
│   ├── 申请时间
│   └── 处理状态
│
├── 申请处理
│   ├── 查看详情
│   ├── 状态变更 (待处理/已联系/已合作/已拒绝)
│   ├── 备注记录
│   └── 转为正式客户
│
└── 统计分析
    └── 申请来源分析
```

---

## 🏗️ 技术架构建议

### 后端技术栈推荐: **Node.js + NestJS**

```
✅ 推荐理由:
- 与前端同语言,团队学习成本低
- TypeScript全栈,代码复用
- 生态丰富,社区活跃
- 适合中小型项目快速迭代

📦 技术栈:
├── NestJS (后端框架)
├── TypeORM / Prisma (ORM)
├── MySQL / PostgreSQL (关系数据库)
├── Redis (缓存)
├── JWT (身份认证)
├── Multer (文件上传)
├── ExcelJS (Excel处理)
├── Bull (任务队列)
└── Socket.IO (实时通信,可选)
```

---

## 📊 核心数据库表设计

```sql
-- 业务员表
CREATE TABLE salespersons (
  id VARCHAR(36) PRIMARY KEY,
  account_id VARCHAR(20) UNIQUE NOT NULL,
  chinese_name VARCHAR(50) NOT NULL,
  english_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  hire_date DATE NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 客户表
CREATE TABLE customers (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  salesperson_id VARCHAR(36),
  customer_type ENUM('new', 'old') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (salesperson_id) REFERENCES salespersons(id)
);

-- 订单表
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  salesperson_id VARCHAR(36) NOT NULL,
  customer_type ENUM('new', 'old') NOT NULL,
  order_type ENUM('formal', 'intention') NOT NULL,
  order_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (salesperson_id) REFERENCES salespersons(id)
);

-- 订单自定义参数表
CREATE TABLE order_custom_params (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  param_key VARCHAR(50) NOT NULL,
  param_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 商品组表
CREATE TABLE product_groups (
  id VARCHAR(36) PRIMARY KEY,
  group_name_zh VARCHAR(200) NOT NULL,
  group_name_en VARCHAR(200) NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  category_id VARCHAR(36),
  is_published BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- 品号SKU表 (Product Code)
CREATE TABLE product_skus (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  product_code VARCHAR(50) UNIQUE NOT NULL, -- 品号 ⭐
  price DECIMAL(10, 2) NOT NULL,
  stock INT DEFAULT 0,
  color_combination JSON,
  main_image VARCHAR(255),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (group_id) REFERENCES product_groups(id) ON DELETE CASCADE
);

-- 分类表
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  name_zh VARCHAR(100) NOT NULL, -- 中文名 ⭐
  name_en VARCHAR(100) NOT NULL, -- 英文名 ⭐
  parent_id VARCHAR(36),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 材料表
CREATE TABLE materials (
  id VARCHAR(36) PRIMARY KEY,
  name_zh VARCHAR(100) NOT NULL, -- 中文名 ⭐
  name_en VARCHAR(100) NOT NULL, -- 英文名 ⭐
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 订单参数配置表
CREATE TABLE order_param_configs (
  id VARCHAR(36) PRIMARY KEY,
  field_name VARCHAR(50) UNIQUE NOT NULL,
  field_name_zh VARCHAR(100) NOT NULL,
  field_type ENUM('text', 'number', 'date', 'select', 'textarea') NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  default_value VARCHAR(255),
  options JSON, -- For select type
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 系统配置表
CREATE TABLE system_configs (
  id VARCHAR(36) PRIMARY KEY,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value LONGTEXT,
  config_type VARCHAR(20), -- json, text, number
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 订阅表
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  source VARCHAR(50), -- footer, popup, etc
  status ENUM('active', 'unsubscribed') DEFAULT 'active',
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 合作申请表
CREATE TABLE partnership_applications (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  message TEXT,
  status ENUM('pending', 'contacted', 'partnered', 'rejected') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 资质认证表 ⭐ (新增)
CREATE TABLE certifications (
  id VARCHAR(36) PRIMARY KEY,
  name_zh VARCHAR(200) NOT NULL,           -- 证书名称(中文)
  name_en VARCHAR(200) NOT NULL,           -- 证书名称(英文)
  category ENUM('factory', 'product', 'patent', 'honor', 'other') NOT NULL, -- 证书分类
  certificate_type VARCHAR(100),           -- 具体类型 (ISO9001, CE, FDA等)
  file_url VARCHAR(255) NOT NULL,          -- 文件URL (PDF/图片)
  file_type VARCHAR(20),                   -- 文件类型 (pdf, jpg, png)
  thumbnail_url VARCHAR(255),              -- 缩略图
  issue_date DATE,                         -- 颁发日期
  expiry_date DATE,                        -- 有效期至
  issuing_authority VARCHAR(200),          -- 颁发机构
  certificate_number VARCHAR(100),         -- 证书编号
  description_zh TEXT,                     -- 证书描述(中文)
  description_en TEXT,                     -- 证书描述(英文)
  display_order INT DEFAULT 0,             -- 显示顺序
  is_active BOOLEAN DEFAULT TRUE,          -- 是否启用
  show_on_frontend BOOLEAN DEFAULT FALSE,  -- 是否在前端展示
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🎨 后台UI设计方案

### 推荐: **Ant Design Pro (React + TypeScript)**

**页面布局:**
```
┌──────────────────────────────────────────────────┐
│  [Logo]  LEMOPX 后台管理   [中/EN]  [倩倩 ▼]     │
├─────────┬────────────────────────────────────────┤
│         │  首页 > 业务员管理                      │
│ 📊 仪表盘 │ ─────────────────────────────────────  │
│         │                                        │
│ 👥 业务员 │   [+ 新增业务员]  [🔍 搜索...]         │
│         │                                        │
│ 📦 订单  │   ┌────────────────────────────────┐ │
│         │   │ 表格数据区域                    │ │
│ 🏷️ 品号  │   │ ID | 中文名 | 英文名 | 账号...  │ │
│         │   └────────────────────────────────┘ │
│ 👤 客户  │                                        │
│         │   [分页] 1 2 3 ... 10                  │
│ 📧 订阅  │                                        │
│         │                                        │
│ 🤝 合作  │                                        │
│         │                                        │
│ ⚙️ 系统  │                                        │
│         │                                        │
└─────────┴────────────────────────────────────────┘
```

---

## 🚀 开发优先级

**Phase 1 - 核心功能 (2-3周)**
1. ✅ 登录认证
2. ✅ 业务员管理 (CRUD)
3. ✅ 订单管理 (CRUD)
4. ✅ 品号管理 (CRUD)
5. ✅ 客户管理 (CRUD)

**Phase 2 - 高级功能 (2-3周)**
1. ✅ ERP Excel导入
2. ✅ 订单导出Excel
3. ✅ 订单参数配置
4. ✅ 品号价格批量编辑
5. ✅ 上架管理

**Phase 3 - 系统配置 (1-2周)**
1. ✅ 首页配置
2. ✅ 关于我们配置
3. ✅ 订阅管理
4. ✅ 合作管理

**Phase 4 - 优化 (1周)**
1. ✅ 权限细化
2. ✅ 操作日志
3. ✅ 数据统计
4. ✅ 性能优化

---

## 💡 关键功能实现要点

### 1. 分类/材料管理

**新增分类表单:**
```typescript
interface CategoryForm {
  nameZh: string  // 中文名称 (必填)
  nameEn: string  // 英文名称 (必填)
  parentId?: string
  sortOrder: number
}

// 表单示例
{
  nameZh: "清洁工具",
  nameEn: "Cleaning Tools",
  sortOrder: 1
}
```

### 2. 订单参数动态配置

**管理员配置:**
```typescript
{
  fieldName: "card_code",
  fieldNameZh: "纸卡编码",
  fieldType: "text",
  isRequired: true,
  displayOrder: 1
}
```

**前端自动生成对应表单字段**

### 3. ERP Excel导入流程

```
1. 下载Excel模板 (含中英文列)
2. 填写数据
3. 上传文件
4. 解析验证
   ├── 格式校验
   ├── 数据类型校验
   ├── 必填项校验
   ├── 分类/材料自动创建
   └── 重复性校验
5. 预览导入数据
6. 确认导入
7. 显示结果报告
```

### 4. 认证管理功能 ⭐ (新增)

**数据结构:**
```typescript
interface Certification {
  id: string
  nameZh: string              // 证书名称(中文)
  nameEn: string              // 证书名称(英文)
  category: 'factory' | 'product' | 'patent' | 'honor' | 'other'
  certificateType: string     // ISO9001, CE, FDA等
  fileUrl: string             // 文件URL
  fileType: string            // pdf, jpg, png
  thumbnailUrl?: string       // 缩略图
  issueDate?: string          // 颁发日期
  expiryDate?: string         // 有效期至
  issuingAuthority?: string   // 颁发机构
  certificateNumber?: string  // 证书编号
  descriptionZh?: string      // 证书描述(中文)
  descriptionEn?: string      // 证书描述(英文)
  displayOrder: number        // 显示顺序
  isActive: boolean           // 是否启用
  showOnFrontend: boolean     // 是否在前端展示
}
```

**主要功能:**
1. **证书上传**
   - 支持PDF和图片格式 (jpg, png, pdf)
   - 自动生成缩略图
   - 文件大小限制 (建议5MB)
   - 文件存储 (OSS/本地)

2. **证书管理**
   - 证书列表 (分类筛选/搜索)
   - 新增/编辑/删除证书
   - 证书预览 (PDF在线预览)
   - 证书下载

3. **过期提醒**
   - 定时检查证书有效期
   - 提前30天提醒管理员
   - 邮件/站内消息通知

4. **前端展示控制**
   - 选择哪些证书在关于我们页面展示
   - 证书展示顺序可拖拽排序
   - 支持中英文切换显示

**证书分类:**
- `factory`: 工厂资质 (营业执照/生产许可证/环保认证/质量认证等)
- `product`: 产品认证 (CE/FDA/SGS等)
- `patent`: 专利证书
- `honor`: 荣誉证书
- `other`: 其他认证

---

## 📝 总结

### 关键变更:
1. ✅ **SKU编码** → **品号** (Product Code)
2. ✅ 去掉业务员**在职状态**
3. ✅ 分类/材料**新增时提供中英文**,不需要单独翻译模块
4. ✅ 统一翻译: 中文"品号" / 英文"Product Code"
5. ✅ 新增**认证管理**模块 (资质证书上传/管理/展示)

### 后台核心模块:
- 业务员管理
- 订单管理 (含参数配置/导出)
- 品号管理 (含ERP导入/上架管理)
- 客户管理
- 系统管理 (含前端配置/认证管理 ⭐)
- 订阅管理
- 合作管理

# 外网站点重构计划

**分支**: `feature/external-site`
**目标**: 将当前系统重构为外网展示型电商平台

---

## 一、功能清单对比

### 保留并完善的功能

| 功能模块 | 当前状态 | 需要修改 | 说明 |
|---------|---------|---------|------|
| 首页 (/) | ✅ 有国际化 | 无 | 保持不变 |
| 产品列表 (/products) | ✅ 有国际化 | 需检查游客是否可见价格 | 确保游客可见价格 |
| 产品详情 (/products/[id]) | ⚠️ 部分国际化 | 需检查并补充 | 组件颜色选择功能 |
| 购物车 (/cart) | ⚠️ 部分国际化 | 需补充国际化 | 登录用户可用 |
| 关于页 (/about) | ✅ 有国际化 | 无 | 保持不变 |

### 需要新增的功能

| 功能模块 | 文件路径 | 说明 |
|---------|---------|------|
| 客户注册页 | `/register` | 新建：客户注册（无需审核） |
| 客户登录页 | `/login` | 新建：邮箱+密码登录 |
| 订单表单提交页 | `/order-form` | 新建：购物车 → 填写信息 → 提交 |
| 个人中心 | `/account` | 新建：查看订单表单历史 |

### 需要删除的功能（内网专用）

| 功能模块 | 文件路径 | 删除原因 |
|---------|---------|---------|
| 订单确认页 | `/order-confirmation` | 内网业务员专用，外网不需要 |
| 订单查看页 | `/order-view` | 内网业务员专用 |
| 业务员个人中心 | `/profile` | 内网业务员专用 |
| 客户管理 | `/customer-management` | 内网业务员专用 |
| 客户建档 | `/customer-profile` | 内网业务员专用 |
| Checkout页 | `/checkout` | 支付功能，外网不需要 |
| 所有 `/admin` 路由 | `/admin/*` | 后台管理，外网不需要 |

---

## 二、数据库Schema变更

### 需要新增的表

#### 1. `order_forms` - 订单表单表
```sql
CREATE TABLE order_forms (
  id VARCHAR(191) PRIMARY KEY,
  customer_id VARCHAR(191) NOT NULL,
  form_number VARCHAR(50) UNIQUE NOT NULL,  -- 自动生成的表单编号

  -- 联系信息
  contact_name VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,

  -- 商品信息（JSON）
  items JSON NOT NULL,

  -- 金额
  total_amount DECIMAL(10,2) NOT NULL,

  -- 状态（固定为submitted）
  status ENUM('submitted') DEFAULT 'submitted',

  -- 时间戳
  submitted_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

**items JSON 结构示例**:
```json
[
  {
    "product_id": "123",
    "product_name": "Xbox Controller Pro",
    "product_code": "XB-001",
    "quantity": 2,
    "unit_price": 299.00,
    "configuration": {
      "base": { "color_id": "1", "color_name": "Black" },
      "grips": { "color_id": "5", "color_name": "Red" }
    }
  }
]
```

#### 2. `customers` 表修改
当前已有 `customers` 表，需要确认以下字段：
```sql
-- 现有字段检查
id
email           -- 需要 UNIQUE 约束
password_hash   -- 需要确认是否存在
company
contact_name
phone
address
status          -- 需要修改：外网客户默认为 'active'
created_at
updated_at
```

### 需要删除的表（保留在main分支，仅在外网数据库不创建）
- `sales_orders` - 销售订单表（内网专用）
- `salespersons` - 业务员表（内网专用）

---

## 三、API接口变更

### 后端需要新增的接口

#### 1. 客户认证相关
```
POST /api/auth/register          - 客户注册（无需审核，自动激活）
POST /api/auth/login             - 客户登录
POST /api/auth/logout            - 客户登出
GET  /api/auth/profile           - 获取当前客户信息
PUT  /api/auth/profile           - 更新客户信息
```

#### 2. 订单表单相关
```
POST /api/order-forms            - 提交订单表单
GET  /api/order-forms            - 获取当前客户的订单表单列表
GET  /api/order-forms/:id        - 获取订单表单详情
```

#### 3. 产品相关（已有，需确认）
```
GET  /api/products               - 获取产品列表（游客可访问）
GET  /api/products/:id           - 获取产品详情（游客可访问）
GET  /api/categories             - 获取分类列表（游客可访问）
```

### 需要删除的接口（内网专用）
```
POST /api/sales-orders/*
GET  /api/sales-orders/*
PUT  /api/sales-orders/*
DELETE /api/sales-orders/*
GET  /api/salespersons/*
```

---

## 四、前端页面重构步骤

### 阶段 1：清理不需要的页面和组件
- [ ] 删除 `app/(frontend)/checkout`
- [ ] 删除 `app/(frontend)/order-confirmation`
- [ ] 删除 `app/(frontend)/order-view`
- [ ] 删除 `app/(frontend)/profile`
- [ ] 删除 `app/(frontend)/customer-management`
- [ ] 删除 `app/(frontend)/customer-profile`
- [ ] 删除 `app/admin/*`（整个admin文件夹）

### 阶段 2：补充现有页面的国际化
- [ ] 产品详情页 (`products/[id]/page.tsx`)
- [ ] 购物车页 (`cart/page.tsx`)
- [ ] 检查首页、产品列表页、关于页

### 阶段 3：新增必要页面
- [ ] 创建 `/register` - 客户注册页
- [ ] 创建 `/login` - 客户登录页
- [ ] 创建 `/order-form` - 订单表单提交页
- [ ] 创建 `/account` - 个人中心（订单表单历史）

### 阶段 4：修改产品详情和购物车
- [ ] 确保游客可见价格
- [ ] 购物车"提交"按钮改为"提交订单表单"
- [ ] 跳转到 `/order-form` 页面

---

## 五、后端重构步骤

### 阶段 1：数据库Schema修改
- [ ] 创建新的Prisma Schema文件（基于现有schema）
- [ ] 添加 `order_forms` 表
- [ ] 修改 `customers` 表（添加约束）
- [ ] 移除内网专用表（`sales_orders`, `salespersons`）
- [ ] 运行数据库迁移

### 阶段 2：创建新的API模块
- [ ] `src/modules/auth` - 客户认证模块
  - `auth.controller.ts`
  - `auth.service.ts`
  - `jwt.strategy.ts`
- [ ] `src/modules/order-forms` - 订单表单模块
  - `order-forms.controller.ts`
  - `order-forms.service.ts`
- [ ] 修改 `src/modules/products` - 确保游客可访问

### 阶段 3：删除内网专用模块
- [ ] 删除 `src/modules/sales-orders`
- [ ] 删除 `src/modules/salespersons`
- [ ] 删除相关的认证守卫和装饰器

---

## 六、国际化补充清单

### 需要添加到 translations.ts 的新翻译键

```typescript
// 客户认证
'auth.register': 'Register'
'auth.register_title': 'Create Account'
'auth.login': 'Login'
'auth.login_title': 'Welcome Back'
'auth.email': 'Email'
'auth.password': 'Password'
'auth.confirm_password': 'Confirm Password'
'auth.company': 'Company Name'
'auth.contact_name': 'Contact Name'
'auth.phone': 'Phone'
'auth.address': 'Address'
'auth.register_button': 'Create Account'
'auth.login_button': 'Login'
'auth.already_have_account': 'Already have an account?'
'auth.dont_have_account': "Don't have an account?"
'auth.logout': 'Logout'

// 订单表单
'order_form.title': 'Submit Order Inquiry'
'order_form.contact_info': 'Contact Information'
'order_form.contact_name': 'Contact Name'
'order_form.phone': 'Phone'
'order_form.email': 'Email'
'order_form.address': 'Delivery Address'
'order_form.notes': 'Notes'
'order_form.notes_placeholder': 'Any special requirements...'
'order_form.products': 'Products'
'order_form.total_amount': 'Total Amount'
'order_form.submit': 'Submit Inquiry'
'order_form.submitting': 'Submitting...'
'order_form.success': 'Inquiry submitted successfully!'
'order_form.success_message': 'We have received your inquiry and will contact you soon.'

// 个人中心
'account.title': 'My Account'
'account.order_history': 'Order Inquiry History'
'account.form_number': 'Form Number'
'account.submitted_date': 'Submitted Date'
'account.total_amount': 'Total Amount'
'account.view_details': 'View Details'
'account.no_orders': 'No inquiries yet'
'account.start_shopping': 'Start Shopping'
```

---

## 七、测试清单

### 功能测试
- [ ] 游客可以浏览产品和查看价格
- [ ] 游客无法添加购物车
- [ ] 客户可以注册（自动激活）
- [ ] 客户可以登录
- [ ] 客户可以添加购物车
- [ ] 客户可以提交订单表单
- [ ] 客户可以查看订单表单历史
- [ ] 中英文切换正常

### 兼容性测试
- [ ] 桌面浏览器（Chrome, Firefox, Edge）
- [ ] 移动浏览器（iOS Safari, Android Chrome）

---

## 八、部署清单

### 外网服务器（阿里云）
- [ ] 拉取 `feature/external-site` 分支
- [ ] 创建独立数据库
- [ ] 运行数据库迁移
- [ ] 配置环境变量
- [ ] 构建前端和后端
- [ ] 启动服务（PM2）
- [ ] 配置Nginx
- [ ] 测试所有功能

### 内网服务器（客户公司）
- [ ] 保持 `main` 分支
- [ ] 部署完整功能版本
- [ ] 连接ERP数据库

---

## 九、预计时间

| 阶段 | 预计时间 | 说明 |
|------|---------|------|
| 数据库设计和迁移 | 1天 | Schema修改 + 迁移脚本 |
| 后端API开发 | 2-3天 | 认证模块 + 订单表单模块 |
| 前端页面清理 | 0.5天 | 删除不需要的页面 |
| 前端国际化补充 | 1天 | 补充缺失的翻译 |
| 新页面开发 | 2-3天 | 注册/登录/订单表单/个人中心 |
| 测试和修复 | 1-2天 | 功能测试 + Bug修复 |
| 部署和验收 | 1天 | 服务器部署 + 最终测试 |
| **总计** | **8-11天** | **约2周** |

---

## 十、下一步行动

**立即开始**：
1. ✅ 创建 `feature/external-site` 分支
2. ⏳ 删除不需要的前端页面
3. ⏳ 修改数据库Schema
4. ⏳ 补充前端国际化
5. ⏳ 开发后端API
6. ⏳ 开发新前端页面

**当前进度**：阶段1 - 清理不需要的页面
# LEMOPX Backend API

基于 NestJS + Prisma + MySQL 的后台管理系统 API

## 技术栈

- **框架**: NestJS 11
- **ORM**: Prisma 6
- **数据库**: MySQL
- **认证**: JWT
- **文件处理**: Multer + ExcelJS
- **语言**: TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

修改 `.env` 文件中的数据库连接信息：

```env
DATABASE_URL="mysql://username:password@localhost:3306/lemopx_db"
JWT_SECRET="your-super-secret-jwt-key"
```

### 3. 创建数据库

确保 MySQL 已安装并运行，然后创建数据库：

```bash
mysql -u root -p
CREATE DATABASE lemopx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 4. 运行数据库迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 创建数据库表
npx prisma db push

# 或者使用迁移
npx prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
npm run start:dev
```

服务器将在 http://localhost:3001/api 启动

## 可用脚本

```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产模式运行
npm run start:prod

# 运行测试
npm run test

# 查看数据库
npx prisma studio
```

## Prisma 常用命令

```bash
# 生成 Prisma Client (修改 schema 后必须运行)
npx prisma generate

# 同步数据库 (开发环境快速同步)
npx prisma db push

# 创建迁移 (生产环境推荐)
npx prisma migrate dev --name migration_name

# 应用迁移到生产环境
npx prisma migrate deploy

# 重置数据库 (⚠️ 会删除所有数据)
npx prisma migrate reset

# 打开 Prisma Studio 可视化管理数据库
npx prisma studio
```

## API 模块

### 1. 认证模块 (Auth)
- POST `/api/auth/login` - 登录
- POST `/api/auth/register` - 注册
- GET `/api/auth/profile` - 获取当前用户信息

### 2. 业务员管理 (Salesperson)
- GET `/api/salespersons` - 获取业务员列表
- GET `/api/salespersons/:id` - 获取业务员详情
- POST `/api/salespersons` - 创建业务员
- PATCH `/api/salespersons/:id` - 更新业务员
- DELETE `/api/salespersons/:id` - 删除业务员

### 3. 客户管理 (Customer)
- GET `/api/customers` - 获取客户列表
- GET `/api/customers/:id` - 获取客户详情
- POST `/api/customers` - 创建客户
- PATCH `/api/customers/:id` - 更新客户
- DELETE `/api/customers/:id` - 删除客户

### 4. 订单管理 (Order)
- GET `/api/orders` - 获取订单列表
- GET `/api/orders/:id` - 获取订单详情
- POST `/api/orders` - 创建订单
- PATCH `/api/orders/:id` - 更新订单
- DELETE `/api/orders/:id` - 删除订单
- GET `/api/orders/:id/export` - 导出订单Excel

### 5. 品号管理 (Product)
- GET `/api/products` - 获取品号列表
- GET `/api/products/:id` - 获取品号详情
- POST `/api/products` - 创建品号
- PATCH `/api/products/:id` - 更新品号
- DELETE `/api/products/:id` - 删除品号
- POST `/api/products/import` - ERP Excel批量导入

### 6. 分类管理 (Category)
- GET `/api/categories` - 获取分类列表
- POST `/api/categories` - 创建分类
- PATCH `/api/categories/:id` - 更新分类
- DELETE `/api/categories/:id` - 删除分类

### 7. 材料管理 (Material)
- GET `/api/materials` - 获取材料列表
- POST `/api/materials` - 创建材料
- PATCH `/api/materials/:id` - 更新材料
- DELETE `/api/materials/:id` - 删除材料

### 8. 认证管理 (Certification)
- GET `/api/certifications` - 获取认证列表
- POST `/api/certifications` - 上传认证
- PATCH `/api/certifications/:id` - 更新认证
- DELETE `/api/certifications/:id` - 删除认证

### 9. 系统配置 (System)
- GET `/api/system/config/:key` - 获取配置
- PUT `/api/system/config/:key` - 更新配置

### 10. 订阅管理 (Subscription)
- GET `/api/subscriptions` - 获取订阅列表
- POST `/api/subscriptions` - 创建订阅
- DELETE `/api/subscriptions/:id` - 取消订阅

### 11. 合作申请 (Partnership)
- GET `/api/partnerships` - 获取合作申请列表
- POST `/api/partnerships` - 创建合作申请
- PATCH `/api/partnerships/:id` - 更新申请状态

## 数据库模型

详见 `prisma/schema.prisma` 文件

核心表：
- admins - 管理员
- salespersons - 业务员
- customers - 客户
- orders - 订单
- order_items - 订单明细
- order_custom_params - 订单自定义参数
- order_param_configs - 订单参数配置
- categories - 分类
- materials - 材料
- product_groups - 商品组
- product_skus - 品号SKU
- certifications - 认证证书
- system_configs - 系统配置
- subscriptions - 订阅
- partnership_applications - 合作申请

## 开发规范

### 目录结构

```
src/
├── modules/           # 业务模块
│   ├── auth/         # 认证模块
│   ├── salesperson/  # 业务员模块
│   ├── customer/     # 客户模块
│   ├── order/        # 订单模块
│   ├── product/      # 品号模块
│   ├── certification/# 认证模块
│   ├── system/       # 系统配置模块
│   ├── subscription/ # 订阅模块
│   └── partnership/  # 合作申请模块
├── common/           # 公共模块
│   ├── guards/       # 守卫
│   ├── decorators/   # 装饰器
│   ├── filters/      # 异常过滤器
│   ├── interceptors/ # 拦截器
│   └── pipes/        # 管道
├── prisma.service.ts # Prisma服务
├── app.module.ts     # 主模块
└── main.ts          # 入口文件
```

## 注意事项

1. **环境变量**: 不要提交 `.env` 文件到 Git
2. **数据库迁移**: 修改 schema 后需要运行 `prisma generate` 和 `prisma db push`
3. **类型安全**: Prisma 提供完整的 TypeScript 类型支持
4. **认证**: 受保护的路由需要 JWT Token

## 故障排除

### 问题1: npm 安装依赖失败

由于您的系统 npm 可能存在问题，推荐使用 yarn 或 pnpm：

```bash
# 使用 yarn
npm install -g yarn
yarn install

# 或使用 pnpm
npm install -g pnpm
pnpm install
```

### 问题2: Prisma Client 找不到

运行以下命令重新生成：

```bash
npx prisma generate
```

### 问题3: 数据库连接失败

检查 `.env` 中的 `DATABASE_URL` 配置是否正确，确保 MySQL 服务正在运行。

## License

MIT

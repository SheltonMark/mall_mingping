# 部署配置说明

## 问题背景

之前代码中硬编码了 `localhost:3001`，这会导致部署到服务器后无法正常工作。现在已经全部修改为使用环境变量配置。

## 环境变量配置

### 1. 前端环境变量

#### 本地开发环境 (`.env.local`)
```bash
# 前端环境变量配置 - 本地开发环境
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### 生产环境 (`.env.production`)
```bash
# 前端环境变量配置 - 生产环境
# 部署时请根据实际情况修改
NEXT_PUBLIC_API_URL=https://www.lemopx.com/api
```

或者使用 IP 地址：
```bash
NEXT_PUBLIC_API_URL=http://your-server-ip:3001/api
```

### 2. 后端环境变量（后端已配置 CORS）

后端 `code/backend-api/src/main.ts` 中的 CORS 配置需要根据实际前端域名修改：

```typescript
app.enableCors({
  origin: 'http://localhost:3000', // ⚠️ 部署时改为实际前端地址
  credentials: true,
});
```

生产环境改为：
```typescript
app.enableCors({
  origin: 'https://www.lemopx.com', // 实际前端域名
  credentials: true,
});
```

## 部署步骤

### 前端部署

1. **创建 `.env.production` 文件**
```bash
cd code/frontend
cp .env.production.example .env.production
```

2. **修改 `.env.production` 中的 API 地址**
```bash
# 改为实际后端 API 地址
NEXT_PUBLIC_API_URL=https://www.lemopx.com/api
```

3. **构建前端**
```bash
pnpm run build
```

4. **启动前端**
```bash
pnpm start
```

### 后端部署

1. **修改 CORS 配置**
   - 编辑 `code/backend-api/src/main.ts`
   - 将 `origin` 改为实际前端域名

2. **构建并启动后端**
```bash
cd code/backend-api
pnpm install
pnpm run build
pnpm run start:prod
```

## 已修复的文件

### 1. 前端 API 配置文件

- ✅ `code/frontend/src/lib/adminApi.ts` - 管理后台 API
  - 第1-6行：使用环境变量配置 API_BASE_URL
  - 导出 `getServerUrl()` 函数用于图片等静态资源

- ✅ `code/frontend/src/lib/publicApi.ts` - 前台公开 API
  - 第6行：使用环境变量配置 API_BASE_URL
  - 第8-9行：导出 `getServerUrl()` 函数

### 2. 产品编辑页面

- ✅ `code/frontend/src/app/admin/products/[id]/page.tsx`
  - 第5行：导入 `getServerUrl` 函数
  - 第348行：图片显示使用 `getServerUrl()` 而不是硬编码 localhost
  - 第217行：修复 images 数据格式（传数组而不是字符串）
  - 第226行：修复 video 数据格式（传对象而不是字符串）

### 3. 数据格式修复

**问题**：后端 DTO 要求 `images` 和 `video` 字段为对象类型（`@IsObject()`），但前端传的是 JSON.stringify 后的字符串。

**修复**：
- `images`: 直接传数组 `images: images`
- `video`: 直接传对象 `updateData.video = { url: videoResult.url, type: videoFile.type }`

## 验证部署成功

1. **检查前端能否访问**
   - 访问前端地址，检查页面是否正常显示

2. **检查 API 连接**
   - 打开浏览器控制台 (F12)
   - 查看 Network 标签
   - 确认 API 请求地址是否正确

3. **检查图片显示**
   - 访问产品详情页面
   - 确认图片能否正常加载
   - 检查图片 URL 是否使用了正确的服务器地址

4. **测试保存功能**
   - 登录管理后台
   - 编辑产品规格
   - 上传图片并保存
   - 确认保存成功且图片显示正常

## 常见问题

### Q: 前端页面能访问，但 API 调用失败？
A: 检查以下几点：
1. `.env.production` 中的 `NEXT_PUBLIC_API_URL` 是否正确
2. 后端是否已启动
3. 后端 CORS 配置中的 `origin` 是否包含前端地址

### Q: 图片无法显示？
A: 检查：
1. 后端 `main.ts` 中是否配置了静态文件服务 (`app.useStaticAssets`)
2. 图片文件是否上传到了 `code/backend-api/uploads/` 目录
3. 浏览器控制台查看图片 URL 是否正确

### Q: 保存时提示 "images must be an object"？
A: 这个问题已修复。确保使用最新代码，`images` 字段传递的是数组而不是字符串。

## 注意事项

1. **不要将 `.env.local` 和 `.env.production` 提交到 Git**
   - 这些文件包含敏感配置
   - 已添加到 `.gitignore`

2. **生产环境使用 HTTPS**
   - 建议使用 HTTPS 协议
   - 需要配置 SSL 证书

3. **后端端口配置**
   - 默认后端端口为 3001
   - 可在 `code/backend-api/src/main.ts` 中修改

4. **数据库文件位置**
   - SQLite 数据库文件: `code/backend-api/prisma/dev.db`
   - 部署时请备份数据库文件

## 总结

现在系统已经完全支持环境变量配置，无需修改代码即可在不同环境（本地/生产）之间切换。部署时只需：

1. 创建对应的 `.env.production` 文件
2. 修改后端 CORS 配置
3. 构建并启动服务

所有 API 调用和静态资源引用都会自动使用正确的地址。

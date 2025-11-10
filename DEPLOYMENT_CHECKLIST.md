# 部署清单 - SQLite → MySQL 迁移

## 📦 需要上传到服务器的文件

### 1. 数据库相关
- ✅ `mysql-import.sql` - MySQL导入脚本 (包含所有数据)

### 2. 素材文件
- ✅ `code/backend-api/uploads/` - 整个uploads目录 (139个文件, 64MB)

### 3. 配置文件
- ✅ `.env.production` - 生产环境配置模板
- ✅ `deploy-server.sh` - 快速部署脚本

### 4. 文档
- ✅ `DEPLOYMENT_GUIDE.md` - 详细部署指南

## 🚀 快速部署步骤

### 第一步: 上传文件到服务器

```bash
# 1. 上传 SQL 数据文件
scp mysql-import.sql root@服务器IP:/root/mall_mingping/

# 2. 上传部署脚本
scp deploy-server.sh root@服务器IP:/root/mall_mingping/

# 3. 上传素材文件 (重要!)
scp -r code/backend-api/uploads root@服务器IP:/root/mall_mingping/code/backend-api/
```

### 第二步: 在服务器上执行

```bash
# 1. SSH 登录服务器
ssh root@服务器IP

# 2. 进入项目目录
cd /root/mall_mingping

# 3. 创建 MySQL 数据库
mysql -u root -p
```

```sql
CREATE DATABASE mingping_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mingping'@'localhost' IDENTIFIED BY '你的密码';
GRANT ALL PRIVILEGES ON mingping_mall.* TO 'mingping'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 4. 配置后端 .env 文件
cd code/backend-api
nano .env
```

粘贴以下内容(修改密码和域名):
```env
DATABASE_URL="mysql://mingping:你的密码@localhost:3306/mingping_mall"
JWT_SECRET="your-production-jwt-secret-key-change-this"
JWT_EXPIRATION="7d"
PORT=3001
NODE_ENV="production"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760
CORS_ORIGIN="http://你的服务器IP:3000"
```

```bash
# 5. 创建数据库表结构
cd /root/mall_mingping/code/backend-api
npx prisma db push

# 6. 导入数据
cd /root/mall_mingping
mysql -u mingping -p mingping_mall < mysql-import.sql

# 7. 执行部署脚本
cd /root/mall_mingping
bash deploy-server.sh
```

## ✅ 验证部署

```bash
# 1. 检查服务状态
pm2 status

# 2. 查看日志
pm2 logs backend-api --lines 50

# 3. 测试接口
curl http://localhost:3001/api/product/groups

# 4. 检查文件权限
ls -la code/backend-api/uploads/
```

## 🔍 数据验证

部署完成后,验证以下数据:

- [ ] 管理员账号可以登录
- [ ] 12个产品分类显示正常
- [ ] 13个产品组显示正常  
- [ ] 29个产品SKU显示正常
- [ ] 产品图片可以正常加载
- [ ] 产品标题支持中英文切换
- [ ] 规格描述显示双语格式

## 📊 本次迁移数据统计

```
✓ 1 个管理员
✓ 12 个分类
✓ 21 个组件
✓ 13 个产品组
✓ 29 个产品SKU
✓ 5 个测试客户
✓ 22 个订单表单
✓ 36 个系统配置
✓ 139 个媒体文件 (64MB)
```

## ⚠️ 重要注意事项

1. **数据库类型**: 从SQLite → MySQL
2. **Prisma Client**: 必须重新生成 (`npx prisma generate`)
3. **文件路径**: uploads目录必须完整上传
4. **环境变量**: CORS_ORIGIN 要改为实际域名
5. **文件权限**: uploads目录需要755权限

## 🆘 常见问题

### 问题1: 图片无法显示
```bash
chmod -R 755 /root/mall_mingping/code/backend-api/uploads
```

### 问题2: 数据库连接失败
检查.env中的DATABASE_URL是否正确

### 问题3: Prisma Client错误
```bash
cd code/backend-api
rm -rf node_modules/.prisma
npx prisma generate
pnpm run build
pm2 restart backend-api
```

## 📞 联系方式

如有问题,请查看详细部署指南: `DEPLOYMENT_GUIDE.md`

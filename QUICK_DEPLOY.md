# 🚀 快速部署指南

服务器: 8.141.127.26
用户: root
密码: 25884hsY!

## 方式1: 自动部署(推荐)

### 第1步: 在本地上传文件

```bash
# 在 d:\mast\web 目录执行
bash deploy-to-server.sh
```

这会自动上传:
- ✅ mysql-import.sql (数据库文件)
- ✅ server.env (环境配置)
- ✅ full-deploy.sh (部署脚本)
- ✅ code/backend-api/uploads/ (素材文件, 64MB)

### 第2步: 连接服务器执行部署

```bash
# SSH连接服务器
ssh root@8.141.127.26
# 密码: 25884hsY!

# 进入项目目录
cd /root/mall_mingping

# 上传服务器端脚本(如果还没上传)
# 在本地执行: scp server-side-deploy.sh root@8.141.127.26:/root/mall_mingping/

# 执行一键部署
bash server-side-deploy.sh
```

## 方式2: 手动部署(详细步骤)

### 1. 上传文件到服务器

```bash
# 在本地 d:\mast\web 目录执行
scp mysql-import.sql root@8.141.127.26:/root/mall_mingping/
scp server.env root@8.141.127.26:/root/mall_mingping/code/backend-api/.env
scp -r code/backend-api/uploads root@8.141.127.26:/root/mall_mingping/code/backend-api/
```

### 2. SSH连接服务器

```bash
ssh root@8.141.127.26
```

### 3. 创建MySQL数据库

```bash
mysql -u root -p
# 密码: 25884hsY!
```

在MySQL中执行:
```sql
CREATE DATABASE IF NOT EXISTS mingping_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mingping'@'localhost' IDENTIFIED BY '25884hsY!';
GRANT ALL PRIVILEGES ON mingping_mall.* TO 'mingping'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 更新代码

```bash
cd /root/mall_mingping
git stash
git fetch origin
git checkout feature/external-site
git pull origin feature/external-site
```

### 5. 创建表结构

```bash
cd /root/mall_mingping/code/backend-api
npx prisma db push
```

### 6. 导入数据

```bash
cd /root/mall_mingping
mysql -u mingping -p25884hsY! mingping_mall < mysql-import.sql
```

### 7. 部署应用

```bash
cd /root/mall_mingping

# 后端
cd code/backend-api
pnpm install
npx prisma generate
pnpm run build

# 前端
cd ../frontend
pnpm install
pnpm run build

# 重启服务
cd ../..
pm2 restart backend-api
pm2 restart frontend
```

### 8. 验证部署

```bash
pm2 status
pm2 logs backend-api --lines 50
curl http://localhost:3001/api/product/groups
```

## ✅ 部署完成后访问

- 前端: http://8.141.127.26:3000
- 后端API: http://8.141.127.26:3001/api
- 管理后台: http://8.141.127.26:3000/admin

## 📊 部署数据统计

- 1个管理员
- 12个分类
- 21个组件
- 13个产品组
- 29个产品SKU
- 5个测试客户
- 22个订单表单
- 139个媒体文件 (64MB)

## 🔍 故障排查

### 问题1: 图片无法显示
```bash
chmod -R 755 /root/mall_mingping/code/backend-api/uploads
```

### 问题2: 后端无法启动
```bash
cd /root/mall_mingping/code/backend-api
pm2 logs backend-api --lines 100
```

检查.env配置是否正确:
```bash
cat /root/mall_mingping/code/backend-api/.env
```

### 问题3: 数据库连接失败
```bash
# 测试数据库连接
mysql -u mingping -p25884hsY! mingping_mall -e "SHOW TABLES;"
```

## 📝 重要提醒

1. ✅ 数据库从SQLite迁移到MySQL
2. ✅ Prisma Client必须重新生成
3. ✅ uploads目录必须完整上传
4. ✅ .env文件已配置MySQL连接
5. ✅ 产品标题支持中英文双语
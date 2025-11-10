#!/bin/bash
# 一键部署脚本 - 在服务器上执行
# 服务器: 8.141.127.26, 路径: /root/mall_mingping

cd /root/mall_mingping

# 1. 创建MySQL数据库
echo "=== 步骤 1: 创建MySQL数据库 ==="
mysql -u root -p25884hsY! << 'MYSQL_SCRIPT'
CREATE DATABASE IF NOT EXISTS mingping_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mingping'@'localhost' IDENTIFIED BY '25884hsY!';
GRANT ALL PRIVILEGES ON mingping_mall.* TO 'mingping'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database created successfully!' AS status;
MYSQL_SCRIPT

# 2. 更新代码
echo "=== 步骤 2: 更新代码 ==="
git stash save "backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
git fetch origin
git checkout feature/external-site
git pull origin feature/external-site

# 3. 创建表结构
echo "=== 步骤 3: 创建表结构 ==="
cd /root/mall_mingping/code/backend-api
npx prisma db push --accept-data-loss

# 4. 导入数据
echo "=== 步骤 4: 导入数据 ==="
cd /root/mall_mingping
mysql -u mingping -p25884hsY! mingping_mall < mysql-import.sql

# 5. 后端部署
echo "=== 步骤 5: 后端部署 ==="
cd /root/mall_mingping/code/backend-api
pnpm install
npx prisma generate
pnpm run build

# 6. 前端部署
echo "=== 步骤 6: 前端部署 ==="
cd /root/mall_mingping/code/frontend
pnpm install
pnpm run build

# 7. 重启服务
echo "=== 步骤 7: 重启服务 ==="
pm2 restart backend-api || pm2 start ecosystem.config.js --only backend-api
pm2 restart frontend || pm2 start ecosystem.config.js --only frontend

# 8. 显示状态
echo "=== 部署完成! ==="
pm2 status
echo ""
echo "访问地址:"
echo "  前端: http://8.141.127.26:3000"
echo "  后端: http://8.141.127.26:3001/api"

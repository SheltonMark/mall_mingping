#!/bin/bash

# ==========================================
# 服务器端执行脚本
# 在服务器上运行: bash server-side-deploy.sh
# ==========================================

set -e

SERVER_IP="8.141.127.26"
MYSQL_USER="mingping"
MYSQL_PASS="25884hsY!"
DB_NAME="mingping_mall"
PROJECT_DIR="/root/mall_mingping"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "  铭品商城 - 服务器端完整部署"
echo "=========================================="
echo ""

# 步骤 1: 创建MySQL数据库
echo -e "${YELLOW}[1/8] 创建MySQL数据库...${NC}"
mysql -u root -p25884hsY! << MYSQL_SCRIPT
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
echo -e "${GREEN}✓ 数据库创建完成${NC}"
echo ""

# 步骤 2: 更新代码
echo -e "${YELLOW}[2/8] 更新代码...${NC}"
cd ${PROJECT_DIR}
git stash save "backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
git fetch origin
git checkout feature/external-site
git pull origin feature/external-site
echo -e "${GREEN}✓ 代码更新完成${NC}"
echo ""

# 步骤 3: 创建表结构
echo -e "${YELLOW}[3/8] 创建数据库表结构...${NC}"
cd ${PROJECT_DIR}/code/backend-api
npx prisma db push --accept-data-loss
echo -e "${GREEN}✓ 表结构创建完成${NC}"
echo ""

# 步骤 4: 导入数据
echo -e "${YELLOW}[4/8] 导入数据...${NC}"
cd ${PROJECT_DIR}
mysql -u ${MYSQL_USER} -p${MYSQL_PASS} ${DB_NAME} < mysql-import.sql
echo -e "${GREEN}✓ 数据导入完成${NC}"
echo ""

# 步骤 5: 安装后端依赖
echo -e "${YELLOW}[5/8] 安装后端依赖...${NC}"
cd ${PROJECT_DIR}/code/backend-api
pnpm install
echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
echo ""

# 步骤 6: 重新生成Prisma Client
echo -e "${YELLOW}[6/8] 重新生成Prisma Client...${NC}"
npx prisma generate
pnpm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# 步骤 7: 前端构建
echo -e "${YELLOW}[7/8] 前端构建...${NC}"
cd ${PROJECT_DIR}/code/frontend
pnpm install
pnpm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 步骤 8: 重启服务
echo -e "${YELLOW}[8/8] 重启服务...${NC}"
pm2 restart backend-api || pm2 start ecosystem.config.js --only backend-api
pm2 restart frontend || pm2 start ecosystem.config.js --only frontend
echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}  部署完成! 🎉${NC}"
echo "=========================================="
echo ""
pm2 status
echo ""
echo "访问地址:"
echo "  前端: http://${SERVER_IP}:3000"
echo "  后端: http://${SERVER_IP}:3001/api"
echo ""

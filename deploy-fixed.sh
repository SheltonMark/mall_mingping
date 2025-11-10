#!/bin/bash
# ==========================================
# 正确的一键部署脚本
# 服务器: lemopx.com (8.141.127.26)
# ==========================================

set -e

PROJECT_DIR="/root/mall_mingping"
BACKEND_DIR="$PROJECT_DIR/code/backend-api"
FRONTEND_DIR="$PROJECT_DIR/code/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=========================================="
echo "  铭品商城 - 完整部署"
echo "=========================================="
echo ""

# 1. 创建MySQL数据库
echo -e "${YELLOW}[1/8] 创建MySQL数据库...${NC}"
mysql -u root -p25884hsY! << 'MYSQL_SCRIPT'
CREATE DATABASE IF NOT EXISTS mingping_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mingping'@'localhost' IDENTIFIED BY '25884hsY!';
GRANT ALL PRIVILEGES ON mingping_mall.* TO 'mingping'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Database OK' AS status;
MYSQL_SCRIPT
echo -e "${GREEN}✓ 数据库创建完成${NC}"
echo ""

# 2. 更新代码
echo -e "${YELLOW}[2/8] 更新代码...${NC}"
cd $PROJECT_DIR
git stash save "backup-$(date +%Y%m%d-%H%M%S)" 2>/dev/null || true
git fetch origin
git checkout feature/external-site
git pull origin feature/external-site
echo -e "${GREEN}✓ 代码更新完成${NC}"
echo ""

# 3. 创建表结构
echo -e "${YELLOW}[3/8] 创建表结构...${NC}"
cd $BACKEND_DIR
npx prisma db push --accept-data-loss
echo -e "${GREEN}✓ 表结构创建完成${NC}"
echo ""

# 4. 导入数据
echo -e "${YELLOW}[4/8] 导入数据...${NC}"
cd $PROJECT_DIR
mysql -u mingping -p25884hsY! mingping_mall < mysql-import.sql
echo -e "${GREEN}✓ 数据导入完成${NC}"
echo ""

# 5. 后端部署
echo -e "${YELLOW}[5/8] 后端部署...${NC}"
cd $BACKEND_DIR
pnpm install --prod=false
npx prisma generate
pnpm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# 6. 前端部署
echo -e "${YELLOW}[6/8] 前端部署...${NC}"
cd $FRONTEND_DIR
pnpm install
pnpm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 7. 检查uploads目录
echo -e "${YELLOW}[7/8] 检查uploads目录...${NC}"
if [ -L "$BACKEND_DIR/uploads" ]; then
    echo "✓ uploads 是符号链接,指向: $(readlink -f $BACKEND_DIR/uploads)"
elif [ -d "$BACKEND_DIR/uploads" ]; then
    echo "✓ uploads 目录存在"
    ls -lh $BACKEND_DIR/uploads/images | head -3
else
    echo "✗ uploads 目录不存在!"
fi
echo ""

# 8. 重启服务
echo -e "${YELLOW}[8/8] 重启服务...${NC}"
pm2 restart lemopx-backend || echo "无法重启 lemopx-backend"
pm2 restart lemopx-frontend || echo "无法重启 lemopx-frontend"
echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

# 显示状态
echo "=========================================="
echo -e "${GREEN}  部署完成! 🎉${NC}"
echo "=========================================="
pm2 status
echo ""
echo "访问地址:"
echo "  前端: http://lemopx.com:3000"
echo "  后端API: http://lemopx.com:3001/api"
echo "  或使用IP: http://8.141.127.26:3000"
echo ""

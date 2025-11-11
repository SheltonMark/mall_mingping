#!/bin/bash

# ==========================================
# 服务器端快速部署脚本
# 使用方法: bash deploy-server.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=================================="
echo "  铭品商城 - 服务器部署脚本"
echo "=================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/www/wwwroot/mall_mingping"
BACKEND_DIR="$PROJECT_DIR/code/backend-api"
FRONTEND_DIR="$PROJECT_DIR/code/frontend"

# 步骤 1: 拉取最新代码
echo -e "${YELLOW}[1/7] 拉取最新代码...${NC}"
cd $PROJECT_DIR
git pull origin feature/external-site
echo -e "${GREEN}✓ 代码更新完成${NC}"
echo ""

# 步骤 2: 检查 .env 配置
echo -e "${YELLOW}[2/7] 检查后端配置文件...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}错误: .env 文件不存在!${NC}"
    echo "请先创建 $BACKEND_DIR/.env 文件"
    exit 1
fi
echo -e "${GREEN}✓ 配置文件存在${NC}"
echo ""

# 步骤 3: 更新后端依赖
echo -e "${YELLOW}[3/7] 更新后端依赖...${NC}"
cd $BACKEND_DIR
pnpm install
echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
echo ""

# 步骤 4: 重新生成 Prisma Client
echo -e "${YELLOW}[4/7] 重新生成 Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client 生成完成${NC}"
echo ""

# 步骤 5: 构建后端
echo -e "${YELLOW}[5/7] 构建后端代码...${NC}"
pnpm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# 步骤 6: 更新前端
echo -e "${YELLOW}[6/7] 更新前端...${NC}"
cd $FRONTEND_DIR
pnpm install
pnpm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# 步骤 7: 重启服务
echo -e "${YELLOW}[7/7] 重启服务...${NC}"
pm2 restart backend-api
pm2 restart frontend
echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

# 显示服务状态
echo "=================================="
echo "  部署完成! 服务状态:"
echo "=================================="
pm2 status

echo ""
echo -e "${GREEN}部署成功! 🎉${NC}"
echo ""
echo "查看日志:"
echo "  后端: pm2 logs backend-api"
echo "  前端: pm2 logs frontend"

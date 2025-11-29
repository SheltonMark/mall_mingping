#!/bin/bash

# 内网服务器部署脚本
# 用法: ./deploy-internal.sh [--prisma]
# --prisma: 如果本次更新涉及 Prisma schema 改动，需要加此参数

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_ROOT="/home/lemopx/internal_web/mall_mingping_internal"
BACKEND_DIR="$PROJECT_ROOT/code/backend-api"
FRONTEND_DIR="$PROJECT_ROOT/code/frontend"

# 检查是否需要处理 Prisma
PRISMA_UPDATE=false
if [[ "$1" == "--prisma" ]]; then
    PRISMA_UPDATE=true
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}    内网服务器部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$PROJECT_ROOT"

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}当前分支: ${NC}$CURRENT_BRANCH"
echo ""

if $PRISMA_UPDATE; then
    echo -e "${YELLOW}[1/6] 检测到 Prisma 改动，执行 git stash...${NC}"
    git stash || true

    echo -e "${YELLOW}[2/6] 拉取最新代码...${NC}"
    git pull origin "$CURRENT_BRANCH"

    echo -e "${YELLOW}[3/6] 恢复本地修改 (git stash pop)...${NC}"
    git stash pop || true

    echo -e "${YELLOW}[4/6] 修改 Prisma schema 适配生产环境 (MySQL)...${NC}"
    cd "$BACKEND_DIR"

    # SQLite -> MySQL
    sed -i 's/provider = "sqlite"/provider = "mysql"/' prisma/schema.prisma

    # 修改 unique 约束（移除 colorScheme）
    sed -i 's/@@unique(\[salespersonId, skuId, colorScheme\])/@@unique([salespersonId, skuId])/' prisma/schema.prisma

    # 修改 configValue 字段类型为 Text
    sed -i 's/configValue\s*String?\s*@map("config_value")/configValue  String?  @db.Text @map("config_value")/' prisma/schema.prisma
    sed -i 's/configValue  String?  @map("config_value")/configValue  String?  @db.Text @map("config_value")/' prisma/schema.prisma

    echo -e "${GREEN}Prisma schema 已修改${NC}"

    echo -e "${YELLOW}[5/6] 生成 Prisma Client 并同步数据库...${NC}"
    pnpm prisma generate
    pnpm prisma db push

    echo -e "${GREEN}Prisma 更新完成${NC}"
else
    echo -e "${YELLOW}[1/4] 拉取最新代码...${NC}"
    git pull origin "$CURRENT_BRANCH"
fi

# 构建后端
echo -e "${YELLOW}[构建后端] 开始构建...${NC}"
cd "$BACKEND_DIR"
pnpm run build
echo -e "${GREEN}后端构建完成${NC}"

# 构建前端
echo -e "${YELLOW}[构建前端] 开始构建...${NC}"
cd "$FRONTEND_DIR"
pnpm run build
echo -e "${GREEN}前端构建完成${NC}"

# 重启 PM2
echo -e "${YELLOW}[重启服务] pm2 restart all...${NC}"
pm2 restart all
sleep 2
pm2 status

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "后端: http://localhost:3001"
echo -e "前端: http://localhost:3000"

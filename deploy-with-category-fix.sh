#!/bin/bash
# 紧急修复部署脚本
# 1. 修复前端圆角问题 (rounded-lg)
# 2. 修复产品分类关联缺失问题

set -e

echo "=========================================="
echo "紧急修复部署 - 开始"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在服务器上
if [ -f "/root/web/.env.production" ]; then
    echo -e "${GREEN}在服务器上执行...${NC}"
    IS_SERVER=true
    WEB_DIR="/root/web"
else
    echo -e "${YELLOW}在本地执行...${NC}"
    IS_SERVER=false
    WEB_DIR="$(pwd)"
fi

# Step 1: Git pull最新代码
echo -e "\n${YELLOW}[1/5] 拉取最新代码...${NC}"
cd "$WEB_DIR"
git pull origin feature/external-site

# Step 2: 执行SQL修复（仅在服务器上）
if [ "$IS_SERVER" = true ]; then
    echo -e "\n${YELLOW}[2/5] 执行SQL修复 - 修复产品分类关联...${NC}"

    # 读取MySQL连接信息
    source /root/web/.env.production

    # 执行SQL脚本
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" mingping_mall < "$WEB_DIR/fix-category-associations.sql"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}SQL执行成功！${NC}"

        # 验证结果
        echo -e "\n${YELLOW}验证修复结果：${NC}"
        mysql -u root -p"$MYSQL_ROOT_PASSWORD" mingping_mall -e "
        SELECT
          c.code,
          c.name_zh,
          COUNT(pg.id) as product_count
        FROM categories c
        LEFT JOIN product_groups pg ON pg.category_id = c.id
        GROUP BY c.id, c.code, c.name_zh
        ORDER BY c.sort_order;
        "
    else
        echo -e "${RED}SQL执行失败！${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}[2/5] 跳过SQL执行（本地环境）${NC}"
fi

# Step 3: 构建前端
echo -e "\n${YELLOW}[3/5] 构建前端...${NC}"
cd "$WEB_DIR/code/frontend"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}前端构建失败！${NC}"
    exit 1
fi

# Step 4: 重启前端服务（仅在服务器上）
if [ "$IS_SERVER" = true ]; then
    echo -e "\n${YELLOW}[4/5] 重启前端服务...${NC}"
    pm2 restart frontend

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}前端服务重启成功！${NC}"
    else
        echo -e "${RED}前端服务重启失败！${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}[4/5] 跳过服务重启（本地环境）${NC}"
fi

# Step 5: 验证部署
echo -e "\n${YELLOW}[5/5] 验证部署...${NC}"
if [ "$IS_SERVER" = true ]; then
    pm2 status
    echo -e "\n${GREEN}部署完成！${NC}"
    echo -e "${GREEN}前端已更新：缩略图圆角改为 rounded-lg${NC}"
    echo -e "${GREEN}数据库已修复：产品已关联到正确的分类${NC}"
else
    echo -e "${GREEN}本地构建完成！${NC}"
    echo -e "${YELLOW}请在服务器上执行此脚本以完成部署${NC}"
fi

echo -e "\n=========================================="
echo "紧急修复部署 - 完成"
echo "=========================================="

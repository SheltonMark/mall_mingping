#!/bin/bash

# ==========================================
# 完整部署脚本 - 包含代码更新
# 使用方法: bash full-deploy.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  铭品商城 - 完整部署脚本 (MySQL版本)"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/root/mall_mingping"
BACKEND_DIR="$PROJECT_DIR/code/backend-api"
FRONTEND_DIR="$PROJECT_DIR/code/frontend"

echo -e "${BLUE}项目目录: $PROJECT_DIR${NC}"
echo ""

# ==========================================
# 步骤 1: 更新代码
# ==========================================
echo -e "${YELLOW}[1/10] 拉取最新代码...${NC}"
cd $PROJECT_DIR

# 检查是否有未提交的修改
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}警告: 有未提交的修改${NC}"
    echo "以下文件有修改:"
    git status -s
    echo ""
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 切换到正确的分支并拉取
echo "切换到 feature/external-site 分支..."
git fetch origin
git checkout feature/external-site
git pull origin feature/external-site

echo -e "${GREEN}✓ 代码更新完成${NC}"
echo ""

# ==========================================
# 步骤 2: 检查配置文件
# ==========================================
echo -e "${YELLOW}[2/10] 检查后端配置文件...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}错误: .env 文件不存在!${NC}"
    echo "请先创建 $BACKEND_DIR/.env 文件"
    echo "参考模板: .env.production"
    exit 1
fi

# 检查是否使用MySQL
if grep -q "mysql://" "$BACKEND_DIR/.env"; then
    echo -e "${GREEN}✓ 使用 MySQL 数据库${NC}"
else
    echo -e "${RED}警告: .env 文件似乎没有配置 MySQL!${NC}"
    echo "当前 DATABASE_URL:"
    grep "DATABASE_URL" "$BACKEND_DIR/.env" || echo "未找到 DATABASE_URL"
    echo ""
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# ==========================================
# 步骤 3: 检查数据库连接
# ==========================================
echo -e "${YELLOW}[3/10] 检查数据库连接...${NC}"
cd $BACKEND_DIR

# 尝试连接数据库
if npx prisma db pull > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}错误: 无法连接到数据库!${NC}"
    echo "请检查:"
    echo "  1. MySQL 服务是否运行"
    echo "  2. 数据库是否已创建"
    echo "  3. .env 中的 DATABASE_URL 是否正确"
    exit 1
fi
echo ""

# ==========================================
# 步骤 4: 检查 uploads 目录
# ==========================================
echo -e "${YELLOW}[4/10] 检查素材文件目录...${NC}"
if [ -d "$BACKEND_DIR/uploads" ]; then
    FILE_COUNT=$(find "$BACKEND_DIR/uploads" -type f | wc -l)
    DIR_SIZE=$(du -sh "$BACKEND_DIR/uploads" | cut -f1)
    echo -e "${GREEN}✓ uploads 目录存在${NC}"
    echo "  文件数量: $FILE_COUNT"
    echo "  目录大小: $DIR_SIZE"
else
    echo -e "${RED}警告: uploads 目录不存在!${NC}"
    echo "请确保已上传素材文件到: $BACKEND_DIR/uploads/"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# ==========================================
# 步骤 5: 安装后端依赖
# ==========================================
echo -e "${YELLOW}[5/10] 安装后端依赖...${NC}"
cd $BACKEND_DIR
pnpm install
echo -e "${GREEN}✓ 后端依赖安装完成${NC}"
echo ""

# ==========================================
# 步骤 6: 重新生成 Prisma Client (重要!)
# ==========================================
echo -e "${YELLOW}[6/10] 重新生成 Prisma Client for MySQL...${NC}"
echo "这一步很重要,因为数据库从 SQLite 改为 MySQL"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client 生成完成${NC}"
echo ""

# ==========================================
# 步骤 7: 构建后端
# ==========================================
echo -e "${YELLOW}[7/10] 构建后端代码...${NC}"
pnpm run build
echo -e "${GREEN}✓ 后端构建完成${NC}"
echo ""

# ==========================================
# 步骤 8: 安装前端依赖
# ==========================================
echo -e "${YELLOW}[8/10] 安装前端依赖...${NC}"
cd $FRONTEND_DIR
pnpm install
echo -e "${GREEN}✓ 前端依赖安装完成${NC}"
echo ""

# ==========================================
# 步骤 9: 构建前端
# ==========================================
echo -e "${YELLOW}[9/10] 构建前端代码...${NC}"
pnpm run build
echo -e "${GREEN}✓ 前端构建完成${NC}"
echo ""

# ==========================================
# 步骤 10: 重启服务
# ==========================================
echo -e "${YELLOW}[10/10] 重启服务...${NC}"

# 检查 PM2 进程是否存在
if pm2 list | grep -q "backend-api"; then
    echo "重启后端服务..."
    pm2 restart backend-api
else
    echo -e "${RED}警告: backend-api 进程不存在${NC}"
    echo "请手动启动: pm2 start ecosystem.config.js"
fi

if pm2 list | grep -q "frontend"; then
    echo "重启前端服务..."
    pm2 restart frontend
else
    echo -e "${RED}警告: frontend 进程不存在${NC}"
    echo "请手动启动: pm2 start ecosystem.config.js"
fi

echo -e "${GREEN}✓ 服务重启完成${NC}"
echo ""

# ==========================================
# 显示服务状态
# ==========================================
echo "=========================================="
echo "  部署完成! 服务状态:"
echo "=========================================="
pm2 status
echo ""

# ==========================================
# 验证部署
# ==========================================
echo "=========================================="
echo "  验证部署"
echo "=========================================="
echo ""

# 测试后端API
echo -e "${YELLOW}测试后端API...${NC}"
if curl -s http://localhost:3001/api > /dev/null; then
    echo -e "${GREEN}✓ 后端API响应正常${NC}"
else
    echo -e "${RED}✗ 后端API无响应${NC}"
fi

# 测试前端
echo -e "${YELLOW}测试前端页面...${NC}"
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✓ 前端页面响应正常${NC}"
else
    echo -e "${RED}✗ 前端页面无响应${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}  部署成功! 🎉${NC}"
echo "=========================================="
echo ""
echo "查看日志:"
echo "  后端: pm2 logs backend-api --lines 50"
echo "  前端: pm2 logs frontend --lines 50"
echo ""
echo "访问地址:"
echo "  前端: http://服务器IP:3000"
echo "  后端API: http://服务器IP:3001/api"
echo ""
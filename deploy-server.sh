#!/bin/bash

###############################################################################
# LEMOPX 生产环境自动部署脚本
# 域名: www.lemopx.com
# 数据库: MySQL 8.0
# SSL: Let's Encrypt
###############################################################################

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== LEMOPX 生产环境部署脚本 ===${NC}"
echo ""

# 配置变量
DOMAIN="www.lemopx.com"
APP_NAME="lemopx"
MYSQL_ROOT_PASSWORD="25884hsY!"
MYSQL_DB="lemopx_db"
MYSQL_USER="lemopx_user"
MYSQL_PASSWORD="lemopx_pass_2024"
REPO_URL="https://github.com/SheltonMark/mall_mingping.git"
APP_DIR="/home/deploy/apps/mall_mingping"

echo -e "${YELLOW}步骤 1/11: 更新系统并安装基础软件${NC}"
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential software-properties-common ufw certbot python3-certbot-nginx

echo -e "${YELLOW}步骤 2/11: 安装 Node.js 20.x${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✓ Node.js 安装完成: $(node -v)${NC}"
else
    echo -e "${GREEN}✓ Node.js 已安装: $(node -v)${NC}"
fi

echo -e "${YELLOW}步骤 3/11: 安装 pnpm${NC}"
if ! command -v pnpm &> /dev/null; then
    sudo npm install -g pnpm
    echo -e "${GREEN}✓ pnpm 安装完成: $(pnpm -v)${NC}"
else
    echo -e "${GREEN}✓ pnpm 已安装: $(pnpm -v)${NC}"
fi

echo -e "${YELLOW}步骤 4/11: 安装 PM2${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup systemd -u deploy --hp /home/deploy
    echo -e "${GREEN}✓ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✓ PM2 已安装${NC}"
fi

echo -e "${YELLOW}步骤 5/11: 安装并配置 MySQL 8.0${NC}"
if ! command -v mysql &> /dev/null; then
    sudo apt install -y mysql-server
    echo -e "${GREEN}✓ MySQL 安装完成${NC}"

    # 设置 MySQL root 密码
    sudo mysql <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF
    echo -e "${GREEN}✓ MySQL root 密码已设置${NC}"
else
    echo -e "${GREEN}✓ MySQL 已安装${NC}"
fi

# 创建数据库和用户
echo -e "${YELLOW}步骤 6/11: 创建数据库和用户${NC}"
mysql -uroot -p${MYSQL_ROOT_PASSWORD} <<EOF
CREATE DATABASE IF NOT EXISTS ${MYSQL_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DB}.* TO '${MYSQL_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF
echo -e "${GREEN}✓ 数据库 ${MYSQL_DB} 创建完成${NC}"

echo -e "${YELLOW}步骤 7/11: 克隆代码仓库${NC}"
mkdir -p /home/deploy/apps
cd /home/deploy/apps

if [ -d "${APP_DIR}" ]; then
    echo -e "${YELLOW}代码目录已存在,拉取最新代码...${NC}"
    cd ${APP_DIR}
    git pull origin main
else
    echo -e "${YELLOW}克隆代码仓库...${NC}"
    git clone ${REPO_URL}
    cd mall_mingping
fi

echo -e "${YELLOW}步骤 8/11: 配置后端环境变量${NC}"
cat > code/backend-api/.env.production <<EOF
# 数据库配置
DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${MYSQL_DB}"

# JWT 配置
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-2024"
JWT_EXPIRES_IN="7d"

# 服务器配置
PORT=3001
NODE_ENV=production

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS配置
CORS_ORIGIN=https://${DOMAIN}
EOF

echo -e "${GREEN}✓ 后端环境变量配置完成${NC}"

echo -e "${YELLOW}步骤 9/11: 配置前端环境变量${NC}"
cat > code/frontend/.env.production <<EOF
NEXT_PUBLIC_API_URL=https://${DOMAIN}/api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
EOF

echo -e "${GREEN}✓ 前端环境变量配置完成${NC}"

echo -e "${YELLOW}步骤 10/11: 安装依赖并构建项目${NC}"

# 后端
echo -e "${YELLOW}构建后端...${NC}"
cd ${APP_DIR}/code/backend-api
pnpm install --prod=false
pnpm run build

# 运行数据库迁移
echo -e "${YELLOW}运行数据库迁移...${NC}"
npx prisma generate
npx prisma db push

echo -e "${GREEN}✓ 后端构建完成${NC}"

# 前端
echo -e "${YELLOW}构建前端...${NC}"
cd ${APP_DIR}/code/frontend
pnpm install --prod=false
pnpm run build

echo -e "${GREEN}✓ 前端构建完成${NC}"

echo -e "${YELLOW}步骤 11/11: 配置 PM2${NC}"
cd ${APP_DIR}

# 创建 PM2 配置文件
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [
    {
      name: '${APP_NAME}-backend',
      cwd: './code/backend-api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },
    {
      name: '${APP_NAME}-frontend',
      cwd: './code/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
EOF

# 创建日志目录
mkdir -p logs

# 启动应用
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo -e "${GREEN}✓ PM2 配置完成并启动应用${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "后端运行在: ${YELLOW}http://localhost:3001${NC}"
echo -e "前端运行在: ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "1. 配置防火墙: sudo ufw allow 80/tcp && sudo ufw allow 443/tcp"
echo -e "2. 配置 DNS: 将 ${DOMAIN} 解析到服务器 IP"
echo -e "3. 运行 Nginx 配置脚本: ./setup-nginx.sh"
echo ""

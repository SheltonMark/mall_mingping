#!/bin/bash

# ==========================================
# 本地执行 - 一键部署到服务器
# 服务器: 8.141.127.26
# ==========================================

set -e

SERVER_IP="8.141.127.26"
SERVER_USER="root"
PROJECT_DIR="/www/wwwroot/mall_mingping"

echo "=========================================="
echo "  开始部署到服务器: $SERVER_IP"
echo "=========================================="
echo ""

# 步骤 1: 上传SQL文件
echo "[1/4] 上传数据库文件..."
scp mysql-import.sql ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/
echo "✓ SQL文件上传完成"
echo ""

# 步骤 2: 上传环境配置
echo "[2/4] 上传环境配置..."
scp server.env ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/code/backend-api/.env
echo "✓ 环境配置上传完成"
echo ""

# 步骤 3: 上传部署脚本
echo "[3/4] 上传部署脚本..."
scp full-deploy.sh ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/
ssh ${SERVER_USER}@${SERVER_IP} "chmod +x ${PROJECT_DIR}/full-deploy.sh"
echo "✓ 部署脚本上传完成"
echo ""

# 步骤 4: 上传素材文件
echo "[4/4] 上传素材文件 (这可能需要几分钟)..."
scp -r code/backend-api/uploads ${SERVER_USER}@${SERVER_IP}:${PROJECT_DIR}/code/backend-api/
echo "✓ 素材文件上传完成"
echo ""

echo "=========================================="
echo "  文件上传完成!"
echo "=========================================="
echo ""
echo "接下来请执行以下命令连接服务器并部署:"
echo ""
echo "ssh root@8.141.127.26"
echo "cd /www/wwwroot/mall_mingping"
echo ""
echo "# 1. 创建数据库(如果还没创建)"
echo "mysql -u root -p"
echo ""
echo "然后在MySQL中执行:"
echo "CREATE DATABASE mingping_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
echo "CREATE USER 'mingping'@'localhost' IDENTIFIED BY '25884hsY!';"
echo "GRANT ALL PRIVILEGES ON mingping_mall.* TO 'mingping'@'localhost';"
echo "FLUSH PRIVILEGES;"
echo "EXIT;"
echo ""
echo "# 2. 创建表结构"
echo "cd code/backend-api && npx prisma db push && cd ../.."
echo ""
echo "# 3. 导入数据"
echo "mysql -u mingping -p mingping_mall < mysql-import.sql"
echo ""
echo "# 4. 执行部署"
echo "bash full-deploy.sh"
echo ""

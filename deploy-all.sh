#!/bin/bash

###############################################################################
# 完整部署流程 - 在本地Windows上执行
# 这个脚本会将部署脚本上传到服务器并执行
###############################################################################

SERVER_IP="8.141.127.26"
SERVER_USER="root"  # 如果你有deploy用户,改为deploy

echo "=== LEMOPX 一键部署流程 ==="
echo ""
echo "服务器: $SERVER_USER@$SERVER_IP"
echo ""

# 1. 上传部署脚本到服务器
echo "步骤 1: 上传部署脚本到服务器..."
scp deploy-server.sh setup-nginx.sh $SERVER_USER@$SERVER_IP:/tmp/

# 2. SSH 连接并执行部署
echo ""
echo "步骤 2: 连接服务器并执行部署..."
echo ""

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'

# 创建 deploy 用户(如果不存在)
if ! id deploy &>/dev/null; then
    echo "创建 deploy 用户..."
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG sudo deploy
    echo "deploy:deploy123" | sudo chpasswd
    echo "✓ deploy 用户创建完成"
fi

# 切换到 deploy 用户
sudo -u deploy bash << 'ENDDEPLOY'

cd ~

# 复制脚本
cp /tmp/deploy-server.sh ~/
cp /tmp/setup-nginx.sh ~/
chmod +x ~/deploy-server.sh
chmod +x ~/setup-nginx.sh

# 执行主部署脚本
echo ""
echo "=== 开始执行部署 ==="
echo ""
bash ~/deploy-server.sh

ENDDEPLOY

echo ""
echo "=== 应用部署完成 ==="
echo ""
echo "下一步: 配置 Nginx 和 SSL"
echo ""
read -p "是否现在配置 Nginx 和 SSL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo -u deploy bash /home/deploy/setup-nginx.sh
fi

ENDSSH

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问你的网站: https://www.lemopx.com"
echo ""

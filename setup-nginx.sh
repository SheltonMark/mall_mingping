#!/bin/bash

###############################################################################
# Nginx + SSL 配置脚本
# 域名: www.lemopx.com
###############################################################################

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Nginx + SSL 配置脚本 ===${NC}"
echo ""

# 配置变量
DOMAIN="www.lemopx.com"
EMAIL="your-email@example.com"  # 请修改为你的邮箱

echo -e "${YELLOW}步骤 1/5: 安装 Nginx${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo -e "${GREEN}✓ Nginx 安装完成${NC}"
else
    echo -e "${GREEN}✓ Nginx 已安装${NC}"
fi

echo -e "${YELLOW}步骤 2/5: 配置防火墙${NC}"
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw --force enable
echo -e "${GREEN}✓ 防火墙配置完成${NC}"

echo -e "${YELLOW}步骤 3/5: 创建 Nginx 配置 (HTTP)${NC}"
sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null <<EOF
# HTTP 配置 - 将被 SSL 自动配置
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} lemopx.com;

    # 日志
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    # Let's Encrypt 验证
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # 静态文件
    location /uploads/ {
        alias /home/deploy/apps/mall_mingping/code/backend-api/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Next.js 前端代理
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

echo -e "${GREEN}✓ Nginx HTTP 配置完成${NC}"

echo -e "${YELLOW}步骤 4/5: 检查 DNS 解析${NC}"
echo -e "${YELLOW}请确保域名 ${DOMAIN} 已解析到服务器 IP${NC}"
echo -e "${YELLOW}当前服务器 IP: $(curl -s ifconfig.me)${NC}"
echo ""
read -p "DNS 是否已正确配置? (y/n) " -n 1 -r
echo
if [[ ! \$REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}请先配置 DNS 解析,然后重新运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}步骤 5/5: 申请 SSL 证书${NC}"
echo -e "${YELLOW}请输入你的邮箱地址 (用于 Let's Encrypt 通知):${NC}"
read -p "邮箱: " EMAIL

if [ -z "$EMAIL" ]; then
    EMAIL="admin@${DOMAIN}"
fi

# 申请 SSL 证书
sudo certbot --nginx -d ${DOMAIN} -d lemopx.com --non-interactive --agree-tos --email ${EMAIL} --redirect

echo -e "${GREEN}✓ SSL 证书申请完成${NC}"

# 设置自动续期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Nginx + SSL 配置完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "你的网站现在可以通过以下地址访问:"
echo -e "${GREEN}https://${DOMAIN}${NC}"
echo -e "${GREEN}https://lemopx.com${NC}"
echo ""
echo -e "SSL 证书将每 60 天自动续期"
echo ""
echo -e "查看 PM2 状态: ${YELLOW}pm2 status${NC}"
echo -e "查看 PM2 日志: ${YELLOW}pm2 logs${NC}"
echo -e "查看 Nginx 日志: ${YELLOW}sudo tail -f /var/log/nginx/${DOMAIN}.access.log${NC}"
echo ""

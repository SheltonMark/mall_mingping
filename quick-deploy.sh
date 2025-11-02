#!/bin/bash
###############################################################################
# LEMOPX 一键部署脚本 - 在服务器上直接运行
# 使用方法: bash <(curl -s https://raw.githubusercontent.com/SheltonMark/mall_mingping/main/quick-deploy.sh)
###############################################################################

set -e
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== LEMOPX 一键部署 ===${NC}"

# 1. 安装基础软件
echo -e "${YELLOW}[1/10] 安装基础软件...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt install -y nodejs nginx mysql-server certbot python3-certbot-nginx > /dev/null 2>&1
npm install -g pnpm pm2 > /dev/null 2>&1
echo -e "${GREEN}✓ 完成${NC}"

# 2. 配置MySQL
echo -e "${YELLOW}[2/10] 配置MySQL数据库...${NC}"
mysql -uroot -p25884hsY! <<EOF > /dev/null 2>&1
CREATE DATABASE IF NOT EXISTS lemopx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'lemopx_user'@'localhost' IDENTIFIED BY 'lemopx_pass_2024';
GRANT ALL PRIVILEGES ON lemopx_db.* TO 'lemopx_user'@'localhost';
FLUSH PRIVILEGES;
EOF
echo -e "${GREEN}✓ 完成${NC}"

# 3. 克隆代码
echo -e "${YELLOW}[3/10] 克隆代码...${NC}"
cd /root
rm -rf mall_mingping
git clone https://github.com/SheltonMark/mall_mingping.git > /dev/null 2>&1
cd mall_mingping
echo -e "${GREEN}✓ 完成${NC}"

# 4. 配置环境变量
echo -e "${YELLOW}[4/10] 配置环境变量...${NC}"
cat > code/backend-api/.env.production <<'EOF'
DATABASE_URL="mysql://lemopx_user:lemopx_pass_2024@localhost:3306/lemopx_db"
JWT_SECRET="your-super-secret-jwt-key-2024"
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://www.lemopx.com
EOF
cat > code/frontend/.env.production <<'EOF'
NEXT_PUBLIC_API_URL=https://www.lemopx.com/api
NEXT_PUBLIC_SITE_URL=https://www.lemopx.com
EOF
echo -e "${GREEN}✓ 完成${NC}"

# 5. 构建后端
echo -e "${YELLOW}[5/10] 构建后端 (需要几分钟)...${NC}"
cd code/backend-api
pnpm install > /dev/null 2>&1
pnpm run build > /dev/null 2>&1
npx prisma generate > /dev/null 2>&1
npx prisma db push > /dev/null 2>&1
echo -e "${GREEN}✓ 完成${NC}"

# 6. 构建前端
echo -e "${YELLOW}[6/10] 构建前端 (需要几分钟)...${NC}"
cd ../frontend
pnpm install > /dev/null 2>&1
pnpm run build > /dev/null 2>&1
echo -e "${GREEN}✓ 完成${NC}"

# 7. 启动PM2
echo -e "${YELLOW}[7/10] 启动应用...${NC}"
cd /root/mall_mingping
pm2 delete all > /dev/null 2>&1 || true
pm2 start code/backend-api/dist/main.js --name lemopx-backend -i 2 > /dev/null 2>&1
cd code/frontend && pm2 start "node_modules/next/dist/bin/next start -p 3000" --name lemopx-frontend > /dev/null 2>&1
pm2 save > /dev/null 2>&1
echo -e "${GREEN}✓ 完成${NC}"

# 8. 配置Nginx
echo -e "${YELLOW}[8/10] 配置Nginx...${NC}"
cat > /etc/nginx/sites-available/lemopx <<'EOF'
server {
    listen 80;
    server_name www.lemopx.com lemopx.com;

    location /uploads/ {
        alias /root/mall_mingping/code/backend-api/uploads/;
    }
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
    }
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}
EOF
ln -sf /etc/nginx/sites-available/lemopx /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx
echo -e "${GREEN}✓ 完成${NC}"

# 9. 配置防火墙
echo -e "${YELLOW}[9/10] 配置防火墙...${NC}"
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
ufw --force enable > /dev/null 2>&1
echo -e "${GREEN}✓ 完成${NC}"

# 10. 完成
echo -e "${YELLOW}[10/10] 部署完成!${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署成功!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "后端: ${GREEN}http://$(curl -s ifconfig.me):3001/api${NC}"
echo -e "前端: ${GREEN}http://$(curl -s ifconfig.me)${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "1. 去阿里云配置DNS解析: www.lemopx.com → $(curl -s ifconfig.me)"
echo -e "2. DNS生效后运行: ${GREEN}certbot --nginx -d www.lemopx.com -d lemopx.com${NC}"
echo ""
echo -e "查看应用: ${GREEN}pm2 status${NC}"
echo ""

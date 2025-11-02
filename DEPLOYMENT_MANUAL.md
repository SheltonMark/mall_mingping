# LEMOPX 生产环境部署手册

## 服务器信息
- IP: 8.141.127.26
- 域名: www.lemopx.com
- 系统: Ubuntu 24.04
- 数据库: MySQL 8.0
- SSL: Let's Encrypt 免费证书

---

## 第一步: SSH连接服务器

```bash
ssh root@8.141.127.26
```

---

## 第二步: 安装基础环境

### 1. 更新系统
```bash
apt update && apt upgrade -y
```

### 2. 安装 Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v  # 验证安装
```

### 3. 安装 pnpm
```bash
npm install -g pnpm
pnpm -v  # 验证安装
```

### 4. 安装 PM2
```bash
npm install -g pm2
pm2 -v  # 验证安装
```

### 5. 安装 Nginx
```bash
apt install -y nginx
nginx -v  # 验证安装
```

### 6. 安装 certbot (SSL证书)
```bash
apt install -y certbot python3-certbot-nginx
```

---

## 第三步: 配置 MySQL

MySQL已安装,密码: `25884hsY!`

### 创建数据库和用户
```bash
mysql -uroot -p25884hsY!
```

在MySQL中执行:
```sql
CREATE DATABASE lemopx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lemopx_user'@'localhost' IDENTIFIED BY 'lemopx_pass_2024';
GRANT ALL PRIVILEGES ON lemopx_db.* TO 'lemopx_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 第四步: 克隆代码

### 1. 创建应用目录
```bash
mkdir -p /root/apps
cd /root/apps
```

### 2. 克隆代码
```bash
git clone https://github.com/SheltonMark/mall_mingping.git
cd mall_mingping
```

---

## 第五步: 配置环境变量

### 1. 后端环境变量
```bash
cat > code/backend-api/.env.production <<'EOF'
DATABASE_URL="mysql://lemopx_user:lemopx_pass_2024@localhost:3306/lemopx_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-2024"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
CORS_ORIGIN=https://www.lemopx.com
EOF
```

### 2. 前端环境变量
```bash
cat > code/frontend/.env.production <<'EOF'
NEXT_PUBLIC_API_URL=https://www.lemopx.com/api
NEXT_PUBLIC_SITE_URL=https://www.lemopx.com
EOF
```

---

## 第六步: 构建项目

### 1. 构建后端
```bash
cd /root/apps/mall_mingping/code/backend-api
pnpm install
pnpm run build

# 运行数据库迁移
npx prisma generate
npx prisma db push
```

### 2. 构建前端
```bash
cd /root/apps/mall_mingping/code/frontend
pnpm install
pnpm run build
```

---

## 第七步: 配置 PM2

### 1. 创建PM2配置文件
```bash
cd /root/apps/mall_mingping

cat > ecosystem.config.js <<'EOF'
module.exports = {
  apps: [
    {
      name: 'lemopx-backend',
      cwd: './code/backend-api',
      script: 'dist/main.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'lemopx-frontend',
      cwd: './code/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
EOF
```

### 2. 启动应用
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. 查看状态
```bash
pm2 status
pm2 logs
```

---

## 第八步: 配置防火墙

```bash
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
ufw status
```

---

## 第九步: 配置 Nginx

### 1. 创建Nginx配置
```bash
cat > /etc/nginx/sites-available/www.lemopx.com <<'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name www.lemopx.com lemopx.com;

    access_log /var/log/nginx/lemopx.access.log;
    error_log /var/log/nginx/lemopx.error.log;

    # 静态文件
    location /uploads/ {
        alias /root/apps/mall_mingping/code/backend-api/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Next.js 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

### 2. 启用配置
```bash
ln -s /etc/nginx/sites-available/www.lemopx.com /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

---

## 第十步: 配置 DNS (在阿里云)

**现在去阿里云配置DNS解析!**

1. 登录阿里云控制台
2. 找到域名解析
3. 添加两条A记录:
   - www → 8.141.127.26
   - @ → 8.141.127.26

等待5-10分钟生效

---

## 第十一步: 申请 SSL 证书

### 1. 确认DNS已生效
```bash
ping www.lemopx.com
# 应该返回 8.141.127.26
```

### 2. 申请证书
```bash
certbot --nginx -d www.lemopx.com -d lemopx.com --email your-email@example.com
```

按提示操作:
- 同意服务条款: `Y`
- 是否重定向HTTPS: `2` (选择重定向)

### 3. 设置自动续期
```bash
systemctl enable certbot.timer
systemctl start certbot.timer
```

---

## 完成!

现在访问: **https://www.lemopx.com**

### 常用命令

```bash
# 查看PM2状态
pm2 status
pm2 logs

# 重启应用
pm2 restart all

# 查看Nginx日志
tail -f /var/log/nginx/lemopx.access.log
tail -f /var/log/nginx/lemopx.error.log

# 重启Nginx
systemctl restart nginx

# 查看防火墙
ufw status
```

---

## 故障排查

### 1. 应用无法启动
```bash
pm2 logs
pm2 restart all
```

### 2. 502 Bad Gateway
```bash
# 检查后端是否运行
pm2 status
curl http://localhost:3001/api
```

### 3. SSL证书问题
```bash
certbot renew --dry-run
```

### 4. 数据库连接失败
```bash
mysql -ulemopx_user -plemopx_pass_2024 -e "SHOW DATABASES;"
```

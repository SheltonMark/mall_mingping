# 部署流程文档

## 标准部署流程

### 1. 本地开发完成后提交代码

```bash
# 1. 查看修改的文件
git status

# 2. 添加修改的文件
git add .

# 3. 提交代码（写清楚修改内容）
git commit -m "fix: 描述你的修改内容"

# 4. 推送到远程仓库
git push origin feature/external-site
```

### 2. 部署到生产服务器

使用一键部署脚本：

```bash
# Windows环境（推荐）
bash deploy-server.sh
```

或者手动部署：

```bash
# SSH登录服务器
ssh root@8.141.127.26
# 密码: 25884hsY!

# 进入项目目录
cd /root/mall_mingping

# 拉取最新代码
git pull origin feature/external-site

# 后端部署（如果修改了后端代码）
cd code/backend-api
pnpm run build
pm2 restart lemopx-backend

# 前端部署（如果修改了前端代码）
cd ../frontend
pnpm run build
pm2 restart lemopx-frontend

# 查看服务状态
pm2 status
```

### 3. 验证部署结果

```bash
# 查看服务状态
pm2 status

# 查看后端日志
pm2 logs lemopx-backend --lines 20

# 查看前端日志
pm2 logs lemopx-frontend --lines 20

# 测试API（在服务器上）
curl http://localhost:3001/api/products/groups?page=1&limit=1
```

## 常见场景

### 场景1：只修改了前端代码

```bash
ssh root@8.141.127.26
cd /root/mall_mingping
git pull origin feature/external-site
cd code/frontend
pnpm run build
pm2 restart lemopx-frontend
pm2 status
```

### 场景2：只修改了后端代码

```bash
ssh root@8.141.127.26
cd /root/mall_mingping
git pull origin feature/external-site
cd code/backend-api
pnpm run build
pm2 restart lemopx-backend
pm2 status
```

### 场景3：同时修改了前后端

```bash
ssh root@8.141.127.26
cd /root/mall_mingping
git pull origin feature/external-site

# 后端
cd code/backend-api
pnpm run build
pm2 restart lemopx-backend

# 前端
cd ../frontend
pnpm run build
pm2 restart lemopx-frontend

pm2 status
```

### 场景4：修改了数据库Schema

```bash
ssh root@8.141.127.26
cd /root/mall_mingping/code/backend-api

# 1. 拉取最新代码
git pull origin feature/external-site

# 2. 生成Prisma Client
npx prisma generate

# 3. 应用数据库迁移（谨慎！会修改数据库）
npx prisma db push

# 4. 重新构建并重启
pnpm run build
pm2 restart lemopx-backend
```

## 故障排查

### 问题1：服务无法启动

```bash
# 查看错误日志
pm2 logs lemopx-backend --err --lines 50
pm2 logs lemopx-frontend --err --lines 50

# 检查端口占用
netstat -tlnp | grep -E ':(3000|3001)'

# 重启服务
pm2 restart all
```

### 问题2：代码拉取失败

```bash
# 查看本地修改
git status

# 如果有冲突，暂存本地修改
git stash

# 拉取代码
git pull origin feature/external-site

# 恢复本地修改（如果需要）
git stash pop
```

### 问题3：构建失败

```bash
# 清理依赖并重新安装
rm -rf node_modules
pnpm install

# 清理构建缓存
rm -rf .next  # 前端
rm -rf dist   # 后端

# 重新构建
pnpm run build
```

## 服务器信息

- **IP**: 8.141.127.26
- **用户**: root
- **密码**: 25884hsY!
- **项目路径**: /root/mall_mingping
- **后端端口**: 3001
- **前端端口**: 3000
- **PM2服务**:
  - lemopx-backend (后端)
  - lemopx-frontend (前端)

## 重要提醒

1. **部署前一定要先提交代码到git**
2. **部署时注意查看错误日志**
3. **修改数据库schema要特别小心**
4. **部署完成后记得验证功能是否正常**
5. **保持deploy-server.sh脚本更新**

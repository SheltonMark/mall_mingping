# 🚀 最终部署步骤 - lemopx.com

## 你需要上传的文件:
```bash
# 1. 上传修正后的部署脚本
scp deploy-fixed.sh root@8.141.127.26:/root/mall_mingping/

# 2. 上传环境配置(如果还没上传)
scp server.env root@8.141.127.26:/root/mall_mingping/code/backend-api/.env
```

## 服务器执行命令:
```bash
ssh root@8.141.127.26
cd /root/mall_mingping
bash deploy-fixed.sh
```

## 完成后访问:
- http://lemopx.com:3000 (前端)
- http://lemopx.com:3001/api (后端API)
- http://lemopx.com:3000/admin (管理后台)

## 关键修正:
✅ PM2进程名改为 `lemopx-backend` 和 `lemopx-frontend`
✅ 使用正确的目录结构 `/root/mall_mingping/code/`
✅ 更新域名为 lemopx.com
✅ 保留 uploads 符号链接

## 注意:
- uploads 是符号链接到 /var/www/lemopx/uploads
- 不要删除或重建 uploads 目录
- .env 文件已正确配置MySQL连接

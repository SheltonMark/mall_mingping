#!/bin/bash
# 快速部署命令 - 在服务器上执行

echo "=========================================="
echo "紧急修复 - 快速部署"
echo "=========================================="

# 1. 拉取最新代码
echo "[1/4] 拉取最新代码..."
cd /root/web
git pull origin feature/external-site

# 2. 执行SQL修复
echo "[2/4] 执行SQL修复..."
source /root/web/.env.production
mysql -u root -p"$MYSQL_ROOT_PASSWORD" mingping_mall < /root/web/fix-category-associations.sql

# 验证SQL结果
echo "验证修复结果："
mysql -u root -p"$MYSQL_ROOT_PASSWORD" mingping_mall -e "
SELECT c.code, c.name_zh, COUNT(pg.id) as product_count
FROM categories c
LEFT JOIN product_groups pg ON pg.category_id = c.id
GROUP BY c.id, c.code, c.name_zh
ORDER BY c.sort_order;
"

# 3. 构建并重启前端
echo "[3/4] 构建前端..."
cd /root/web/code/frontend
npm run build

echo "[4/4] 重启前端服务..."
pm2 restart frontend

echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "✅ 前端修复：缩略图圆角 rounded-md → rounded-lg"
echo "✅ 数据库修复：产品分类关联已修复"
echo ""
echo "请验证："
echo "1. 访问产品详情页，检查缩略图圆角"
echo "2. 访问 /admin/categories 检查产品数量显示"

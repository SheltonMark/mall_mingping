#!/bin/bash
# 仅执行SQL验证 - 查看当前分类关联状态

echo "=========================================="
echo "查询当前产品分类关联状态"
echo "=========================================="

# 读取数据库连接信息
if [ -f "/root/web/.env.production" ]; then
    source /root/web/.env.production
    DB_PASSWORD="$MYSQL_ROOT_PASSWORD"
elif [ -f ".env.production" ]; then
    source .env.production
    DB_PASSWORD="$MYSQL_ROOT_PASSWORD"
else
    echo "请输入MySQL root密码:"
    read -s DB_PASSWORD
fi

echo ""
echo "1️⃣ 各分类的产品数量统计："
echo "--------------------------------------"
mysql -u root -p"$DB_PASSWORD" mingping_mall -t -e "
SELECT
  c.code as '分类代码',
  c.name_zh as '分类名称',
  c.name_en as '英文名称',
  COUNT(pg.id) as '产品数量'
FROM categories c
LEFT JOIN product_groups pg ON pg.category_id = c.id
GROUP BY c.id, c.code, c.name_zh, c.name_en
ORDER BY c.sort_order;
"

echo ""
echo "2️⃣ 未分配分类的产品（应该只有W开头的外购类）："
echo "--------------------------------------"
mysql -u root -p"$DB_PASSWORD" mingping_mall -t -e "
SELECT
  pg.prefix as 'Prefix',
  pg.group_name_zh as '产品名称',
  pg.category_id as '分类ID'
FROM product_groups pg
WHERE pg.category_id IS NULL
ORDER BY pg.prefix;
"

echo ""
echo "3️⃣ 按前缀分组的产品统计："
echo "--------------------------------------"
mysql -u root -p"$DB_PASSWORD" mingping_mall -t -e "
SELECT
  CASE
    WHEN pg.prefix LIKE 'MP%' THEN 'MP - 组合套装'
    WHEN pg.prefix LIKE 'TB%' THEN 'TB - 拖把类'
    WHEN pg.prefix LIKE 'T%' THEN 'T - 杆件'
    WHEN pg.prefix LIKE 'B%' THEN 'B - 拖把头'
    WHEN pg.prefix LIKE 'S%' THEN 'S - 刷类'
    WHEN pg.prefix LIKE 'CG%' THEN 'CG - 玻璃&地刮'
    WHEN pg.prefix LIKE 'CD%' THEN 'CD - 除尘类'
    WHEN pg.prefix LIKE 'MB%' THEN 'MB - 抹布类'
    WHEN pg.prefix LIKE 'QC%' THEN 'QC - 车用类'
    WHEN pg.prefix LIKE 'CW%' THEN 'CW - 宠物类'
    WHEN pg.prefix LIKE 'MX%' THEN 'MX - 混合类'
    WHEN pg.prefix LIKE 'W%' THEN 'W - 外购类'
    ELSE 'OTHER'
  END as '产品类型',
  COUNT(*) as '产品数量',
  GROUP_CONCAT(pg.prefix ORDER BY pg.prefix SEPARATOR ', ') as '包含的Prefix'
FROM product_groups pg
GROUP BY
  CASE
    WHEN pg.prefix LIKE 'MP%' THEN 'MP'
    WHEN pg.prefix LIKE 'TB%' THEN 'TB'
    WHEN pg.prefix LIKE 'T%' THEN 'T'
    WHEN pg.prefix LIKE 'B%' THEN 'B'
    WHEN pg.prefix LIKE 'S%' THEN 'S'
    WHEN pg.prefix LIKE 'CG%' THEN 'CG'
    WHEN pg.prefix LIKE 'CD%' THEN 'CD'
    WHEN pg.prefix LIKE 'MB%' THEN 'MB'
    WHEN pg.prefix LIKE 'QC%' THEN 'QC'
    WHEN pg.prefix LIKE 'CW%' THEN 'CW'
    WHEN pg.prefix LIKE 'MX%' THEN 'MX'
    WHEN pg.prefix LIKE 'W%' THEN 'W'
    ELSE 'OTHER'
  END
ORDER BY
  CASE
    WHEN pg.prefix LIKE 'MP%' THEN 1
    WHEN pg.prefix LIKE 'TB%' THEN 2
    WHEN pg.prefix LIKE 'T%' THEN 3
    WHEN pg.prefix LIKE 'B%' THEN 4
    WHEN pg.prefix LIKE 'S%' THEN 5
    WHEN pg.prefix LIKE 'CG%' THEN 6
    WHEN pg.prefix LIKE 'CD%' THEN 7
    WHEN pg.prefix LIKE 'MB%' THEN 8
    WHEN pg.prefix LIKE 'QC%' THEN 9
    WHEN pg.prefix LIKE 'CW%' THEN 10
    WHEN pg.prefix LIKE 'MX%' THEN 11
    WHEN pg.prefix LIKE 'W%' THEN 12
    ELSE 99
  END;
"

echo ""
echo "=========================================="
echo "查询完成"
echo "=========================================="

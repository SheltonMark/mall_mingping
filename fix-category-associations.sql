-- 修复产品分类关联缺失问题
-- 根据产品prefix自动关联对应的category_id

USE mingping_mall;

-- 为每个分类code获取对应的category_id并更新product_groups

-- 组合套装类 (MP开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'MP'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'MP%';

-- 拖把类 (TB开头，优先匹配，避免被T覆盖)
UPDATE product_groups pg
JOIN categories c ON c.code = 'TB'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'TB%';

-- 杆件类 (T开头，但排除TB开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'T'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'T%' AND pg.prefix NOT LIKE 'TB%';

-- 拖把头类 (B开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'B'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'B%';

-- 刷类 (S开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'S'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'S%';

-- 玻璃&地刮类 (CG开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'CG'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'CG%';

-- 除尘类 (CD开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'CD'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'CD%';

-- 抹布类 (MB开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'MB'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'MB%';

-- 车用类 (QC开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'QC'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'QC%';

-- 宠物类 (CW开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'CW'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'CW%';

-- 混合类 (MX开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'MX'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'MX%';

-- 验证结果：显示每个分类的产品数量
SELECT
  c.code,
  c.name_zh,
  c.name_en,
  COUNT(pg.id) as product_count
FROM categories c
LEFT JOIN product_groups pg ON pg.category_id = c.id
GROUP BY c.id, c.code, c.name_zh, c.name_en
ORDER BY c.sort_order;

-- 显示未分配分类的产品组（应该只有外购类W开头）
SELECT
  pg.prefix,
  pg.group_name_zh,
  pg.category_id
FROM product_groups pg
WHERE pg.category_id IS NULL
ORDER BY pg.prefix;

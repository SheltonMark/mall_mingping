# 紧急修复部署说明

## 问题1：前端圆角修复 ✅
**状态**：已完成
**文件**：`code/frontend/src/app/(frontend)/products/[id]/page.tsx`
**修改**：`rounded-md` → `rounded-lg` (Line 478)

## 问题2：产品分类关联修复

### 问题描述
数据库中所有产品的 `category_id` 都是 NULL，导致后台分类管理页面无法显示产品数量。

### 解决方案
根据产品 `prefix` 自动匹配并关联 `category_id`

### 执行步骤

#### 方法一：自动部署脚本（推荐）
```bash
# 在服务器上执行
cd /root/web
bash deploy-with-category-fix.sh
```

这个脚本会自动：
1. 拉取最新代码
2. 执行SQL修复脚本
3. 构建前端
4. 重启服务
5. 验证结果

#### 方法二：手动执行SQL
如果自动脚本失败，请手动执行以下步骤：

**Step 1: 登录MySQL**
```bash
mysql -u root -p mingping_mall
```

**Step 2: 执行修复SQL**
```sql
-- 组合套装类 (MP开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'MP'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'MP%';

-- 拖把类 (TB开头)
UPDATE product_groups pg
JOIN categories c ON c.code = 'TB'
SET pg.category_id = c.id
WHERE pg.prefix LIKE 'TB%';

-- 杆件类 (T开头，但排除TB)
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
```

**Step 3: 验证结果**
```sql
SELECT
  c.code,
  c.name_zh,
  c.name_en,
  COUNT(pg.id) as product_count
FROM categories c
LEFT JOIN product_groups pg ON pg.category_id = c.id
GROUP BY c.id, c.code, c.name_zh, c.name_en
ORDER BY c.sort_order;
```

**期望结果**：每个分类应该显示对应的产品数量（除了外购类W开头的产品）

**Step 4: 查看未分配的产品**
```sql
SELECT
  pg.prefix,
  pg.group_name_zh,
  pg.category_id
FROM product_groups pg
WHERE pg.category_id IS NULL
ORDER BY pg.prefix;
```

**期望结果**：只应该显示W开头的外购类产品

#### 方法三：使用SQL文件执行
```bash
cd /root/web
mysql -u root -p mingping_mall < fix-category-associations.sql
```

### 部署前端
```bash
cd /root/web/code/frontend
npm run build
pm2 restart frontend
```

### 验证
1. 访问后台分类管理页面：`/admin/categories`
2. 检查每个分类是否显示正确的产品数量
3. 访问前台产品详情页，检查缩略图圆角是否更明显（rounded-lg）

## 文件清单
- ✅ `code/frontend/src/app/(frontend)/products/[id]/page.tsx` - 前端圆角修复
- ✅ `fix-category-associations.sql` - SQL修复脚本
- ✅ `deploy-with-category-fix.sh` - 自动部署脚本
- ✅ `URGENT_FIX_INSTRUCTIONS.md` - 本说明文件

## 注意事项
1. SQL执行前建议备份数据库
2. 外购类（W开头）产品不需要分类关联，category_id保持为NULL
3. 如果有新增产品，需要手动运行相应的UPDATE语句

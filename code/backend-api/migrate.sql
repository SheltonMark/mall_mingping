-- 内网销售系统数据库迁移SQL
-- 从外网版本迁移到内网版本

-- 1. 修改salespersons表
-- 先添加password列（允许NULL）
ALTER TABLE salespersons ADD COLUMN password TEXT;

-- 为现有业务员设置默认密码（需要后续修改）
-- 默认密码: 123456 的bcrypt hash
UPDATE salespersons SET password = '$2b$10$rG.zYn3JvH8vN7e9xK9qOu7Y5VhHZ9qQ6fWqJk1W2mXKj3L4mN5ye';

-- 删除不需要的列
-- SQLite不支持直接DROP COLUMN,需要重建表
-- 暂时保留这些列,后面用Prisma重建

-- 2. 修改customers表
-- 删除password, salespersonId, tier列
-- SQLite不支持直接DROP COLUMN

-- 3. 修改cart_items表
-- 重命名customer_id为salesperson_id
-- 先添加新列
ALTER TABLE cart_items ADD COLUMN salesperson_id TEXT;

-- 清空购物车数据（内网重新开始）
DELETE FROM cart_items;

-- 4. 删除order_forms表的数据（内网不使用）
DELETE FROM order_forms;

-- 完成!

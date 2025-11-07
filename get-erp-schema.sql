-- ================================================
-- ERP数据库表结构导出SQL命令
-- 请在ERP数据库执行以下命令，并把结果发给我们
-- ================================================

-- 1. 查看所有表名
SHOW TABLES;

-- 2. 查看客户表结构
SHOW CREATE TABLE cust;
DESCRIBE cust;

-- 3. 查看订单表头结构
SHOW CREATE TABLE mf_pos;
DESCRIBE mf_pos;

-- 4. 查看订单表身结构
SHOW CREATE TABLE lf_pos;
DESCRIBE lf_pos;

-- 5. 查看产品表结构（如果有）
SHOW CREATE TABLE prdt;
DESCRIBE prdt;

-- 6. 查看示例数据（脱敏后的）
-- 客户表示例（最多3条）
SELECT * FROM cust LIMIT 3;

-- 订单表头示例（最多3条）
SELECT * FROM mf_pos LIMIT 3;

-- 订单表身示例（最多5条）
SELECT * FROM lf_pos LIMIT 5;

-- 产品表示例（最多3条）
SELECT * FROM prdt LIMIT 3;

-- 7. 查看表关联关系
-- 检查外键约束
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    REFERENCED_TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('cust', 'mf_pos', 'lf_pos', 'prdt');

-- 8. 查看字段注释
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('cust', 'mf_pos', 'lf_pos', 'prdt')
ORDER BY
    TABLE_NAME, ORDINAL_POSITION;

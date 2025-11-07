-- ================================================
-- ERP数据同步与审核系统 - 数据库表设计
-- ================================================

-- 1. ERP同步任务日志表
CREATE TABLE IF NOT EXISTS erp_sync_logs (
    id VARCHAR(191) PRIMARY KEY,
    sync_type ENUM('customer', 'order', 'product', 'inventory') NOT NULL COMMENT '同步类型',
    sync_status ENUM('running', 'success', 'failed') NOT NULL DEFAULT 'running' COMMENT '同步状态',
    total_records INT DEFAULT 0 COMMENT '总记录数',
    success_records INT DEFAULT 0 COMMENT '成功记录数',
    failed_records INT DEFAULT 0 COMMENT '失败记录数',
    error_message TEXT COMMENT '错误信息',
    started_at DATETIME(3) NOT NULL COMMENT '开始时间',
    completed_at DATETIME(3) COMMENT '完成时间',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP同步日志';

-- 2. ERP客户数据审核表
CREATE TABLE IF NOT EXISTS erp_customer_review (
    id VARCHAR(191) PRIMARY KEY,
    sync_log_id VARCHAR(191) COMMENT '同步日志ID',

    -- ERP原始数据
    erp_obj_id VARCHAR(191) NOT NULL COMMENT 'ERP客户ID',
    erp_obj_type INT COMMENT 'ERP对象类型',
    erp_cust_name VARCHAR(255) COMMENT 'ERP客户名称',
    erp_contact VARCHAR(255) COMMENT 'ERP联系人',
    erp_phone VARCHAR(50) COMMENT 'ERP电话',
    erp_email VARCHAR(255) COMMENT 'ERP邮箱',
    erp_address TEXT COMMENT 'ERP地址',
    erp_raw_data JSON COMMENT 'ERP原始JSON数据',

    -- 审核状态
    review_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    reviewer_id VARCHAR(191) COMMENT '审核人ID',
    reviewed_at DATETIME(3) COMMENT '审核时间',
    reject_reason TEXT COMMENT '拒绝原因',

    -- 映射后的数据（审核人可以修改）
    mapped_name VARCHAR(255) COMMENT '映射后的名称',
    mapped_phone VARCHAR(50) COMMENT '映射后的电话',
    mapped_email VARCHAR(255) COMMENT '映射后的邮箱',
    mapped_address TEXT COMMENT '映射后的地址',

    -- 本地客户ID（审核通过后创建）
    local_customer_id VARCHAR(191) COMMENT '本地客户ID',

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_erp_obj_id (erp_obj_id),
    INDEX idx_review_status (review_status),
    INDEX idx_sync_log (sync_log_id),
    FOREIGN KEY (sync_log_id) REFERENCES erp_sync_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP客户数据审核表';

-- 3. ERP订单数据审核表（表头）
CREATE TABLE IF NOT EXISTS erp_order_review (
    id VARCHAR(191) PRIMARY KEY,
    sync_log_id VARCHAR(191) COMMENT '同步日志ID',

    -- ERP原始数据
    erp_mf_pos_id VARCHAR(191) NOT NULL COMMENT 'ERP订单ID',
    erp_order_no VARCHAR(255) COMMENT 'ERP订单号',
    erp_cust_id VARCHAR(191) COMMENT 'ERP客户ID',
    erp_order_date DATETIME(3) COMMENT 'ERP订单日期',
    erp_total_amount DECIMAL(10,2) COMMENT 'ERP订单总额',
    erp_status VARCHAR(50) COMMENT 'ERP订单状态',
    erp_raw_data JSON COMMENT 'ERP原始JSON数据',

    -- 审核状态
    review_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    reviewer_id VARCHAR(191) COMMENT '审核人ID',
    reviewed_at DATETIME(3) COMMENT '审核时间',
    reject_reason TEXT COMMENT '拒绝原因',

    -- 映射关系
    local_customer_id VARCHAR(191) COMMENT '本地客户ID（从erp_customer_review映射）',
    local_order_id VARCHAR(191) COMMENT '本地订单ID（审核通过后创建）',

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_erp_mf_pos_id (erp_mf_pos_id),
    INDEX idx_review_status (review_status),
    INDEX idx_sync_log (sync_log_id),
    FOREIGN KEY (sync_log_id) REFERENCES erp_sync_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP订单审核表';

-- 4. ERP订单明细审核表（表身）
CREATE TABLE IF NOT EXISTS erp_order_item_review (
    id VARCHAR(191) PRIMARY KEY,
    order_review_id VARCHAR(191) NOT NULL COMMENT '订单审核表ID',

    -- ERP原始数据
    erp_lf_pos_id VARCHAR(191) NOT NULL COMMENT 'ERP订单明细ID',
    erp_product_id VARCHAR(191) COMMENT 'ERP产品ID',
    erp_product_name VARCHAR(255) COMMENT 'ERP产品名称',
    erp_quantity INT COMMENT 'ERP数量',
    erp_unit_price DECIMAL(10,2) COMMENT 'ERP单价',
    erp_amount DECIMAL(10,2) COMMENT 'ERP小计',
    erp_raw_data JSON COMMENT 'ERP原始JSON数据',

    -- 映射关系
    local_sku_id VARCHAR(191) COMMENT '本地SKU ID',
    local_order_item_id VARCHAR(191) COMMENT '本地订单明细ID（审核通过后创建）',

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_order_review (order_review_id),
    FOREIGN KEY (order_review_id) REFERENCES erp_order_review(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP订单明细审核表';

-- 5. ERP产品数据审核表
CREATE TABLE IF NOT EXISTS erp_product_review (
    id VARCHAR(191) PRIMARY KEY,
    sync_log_id VARCHAR(191) COMMENT '同步日志ID',

    -- ERP原始数据
    erp_prdt_id VARCHAR(191) NOT NULL COMMENT 'ERP产品ID',
    erp_prdt_code VARCHAR(255) COMMENT 'ERP产品编码',
    erp_prdt_name VARCHAR(255) COMMENT 'ERP产品名称',
    erp_price DECIMAL(10,2) COMMENT 'ERP价格',
    erp_spec VARCHAR(500) COMMENT 'ERP规格',
    erp_raw_data JSON COMMENT 'ERP原始JSON数据',

    -- 审核状态
    review_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
    reviewer_id VARCHAR(191) COMMENT '审核人ID',
    reviewed_at DATETIME(3) COMMENT '审核时间',
    reject_reason TEXT COMMENT '拒绝原因',

    -- 映射后的数据
    mapped_product_code VARCHAR(255) COMMENT '映射后的产品编码',
    mapped_product_name VARCHAR(255) COMMENT '映射后的产品名称',
    mapped_price DECIMAL(10,2) COMMENT '映射后的价格',

    -- 本地产品ID（审核通过后创建或关联）
    local_sku_id VARCHAR(191) COMMENT '本地SKU ID',
    local_group_id VARCHAR(191) COMMENT '本地产品组ID',

    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    INDEX idx_erp_prdt_id (erp_prdt_id),
    INDEX idx_review_status (review_status),
    INDEX idx_sync_log (sync_log_id),
    FOREIGN KEY (sync_log_id) REFERENCES erp_sync_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP产品数据审核表';

-- 6. ERP数据映射配置表
CREATE TABLE IF NOT EXISTS erp_data_mapping (
    id VARCHAR(191) PRIMARY KEY,
    mapping_type ENUM('customer', 'product', 'order_status') NOT NULL COMMENT '映射类型',
    erp_value VARCHAR(255) NOT NULL COMMENT 'ERP值',
    local_value VARCHAR(255) NOT NULL COMMENT '本地值',
    description TEXT COMMENT '说明',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE KEY uk_mapping (mapping_type, erp_value)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP数据映射配置';

-- 7. ERP同步配置表
CREATE TABLE IF NOT EXISTS erp_sync_config (
    id VARCHAR(191) PRIMARY KEY,
    config_key VARCHAR(255) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description TEXT COMMENT '说明',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ERP同步配置';

-- 插入默认配置
INSERT INTO erp_sync_config (id, config_key, config_value, description) VALUES
('cfg-001', 'sync_interval', '300', '同步间隔（秒），默认5分钟'),
('cfg-002', 'auto_approve_customer', 'false', '是否自动审核通过客户数据'),
('cfg-003', 'auto_approve_product', 'false', '是否自动审核通过产品数据'),
('cfg-004', 'auto_approve_order', 'false', '是否自动审核通过订单数据'),
('cfg-005', 'erp_db_host', '', 'ERP数据库地址'),
('cfg-006', 'erp_db_port', '3306', 'ERP数据库端口'),
('cfg-007', 'erp_db_name', '', 'ERP数据库名'),
('cfg-008', 'erp_db_user', '', 'ERP数据库用户名'),
('cfg-009', 'erp_db_password', '', 'ERP数据库密码（加密存储）'),
('cfg-010', 'last_sync_time', '', '最后同步时间')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP(3);

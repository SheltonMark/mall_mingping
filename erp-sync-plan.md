# ERP数据同步与审核系统 - 开发任务清单

## 第一阶段：获取表结构（1天）

### 客户侧
- [ ] 临时开放远程连接或端口映射
- [ ] 或帮我们执行SQL导出表结构
- [ ] 提供示例数据（脱敏）

### 我们侧
- [x] 准备SQL查询命令清单（已完成）
- [ ] 连接ERP数据库获取表结构
- [ ] 整理表结构文档
- [ ] 确认字段映射关系

---

## 第二阶段：本地开发（5-7天，与客户并行）

### 1. 数据库设计（1天）
- [ ] 创建审核系统表结构
  - erp_sync_logs（同步日志）
  - erp_customer_review（客户审核表）
  - erp_order_review（订单审核表）
  - erp_order_item_review（订单明细审核表）
  - erp_product_review（产品审核表）
  - erp_data_mapping（数据映射配置）
  - erp_sync_config（同步配置）

- [ ] 更新Prisma Schema
- [ ] 运行数据库迁移

### 2. 后端API开发（2-3天）

#### 2.1 数据接收API
```
POST /api/erp/sync/customers    - 接收客户数据
POST /api/erp/sync/orders       - 接收订单数据
POST /api/erp/sync/products     - 接收产品数据
GET  /api/erp/sync/status       - 查询同步状态
```

#### 2.2 审核管理API
```
GET    /api/admin/erp/review/customers       - 获取待审核客户列表
GET    /api/admin/erp/review/orders          - 获取待审核订单列表
GET    /api/admin/erp/review/products        - 获取待审核产品列表
POST   /api/admin/erp/review/:id/approve     - 审核通过
POST   /api/admin/erp/review/:id/reject      - 审核拒绝
PATCH  /api/admin/erp/review/:id             - 修改数据
```

#### 2.3 配置管理API
```
GET    /api/admin/erp/config                 - 获取同步配置
PUT    /api/admin/erp/config                 - 更新同步配置
GET    /api/admin/erp/mapping                - 获取数据映射配置
POST   /api/admin/erp/mapping                - 添加映射规则
```

### 3. 前端审核界面开发（2-3天）

#### 3.1 ERP管理页面
```
/admin/erp/dashboard        - ERP同步仪表盘
/admin/erp/customers        - 客户数据审核
/admin/erp/orders           - 订单数据审核
/admin/erp/products         - 产品数据审核
/admin/erp/logs             - 同步日志
/admin/erp/config           - 同步配置
```

#### 3.2 审核界面功能
- [ ] 待审核列表（分页、筛选、搜索）
- [ ] 数据对比视图（ERP原始数据 vs 映射后数据）
- [ ] 批量审核功能
- [ ] 单条审核（通过/拒绝/修改）
- [ ] 审核历史记录
- [ ] 实时同步状态显示

### 4. 内网同步程序开发（1天）

#### Node.js版本
```javascript
// erp-sync-client.js
// 轻量级，跨平台
// 依赖：mysql2, axios, dotenv
```

功能：
- [ ] 连接ERP数据库
- [ ] 定时读取数据（可配置间隔）
- [ ] 增量同步（根据更新时间）
- [ ] 数据校验和清洗
- [ ] HTTPS推送到我们API
- [ ] 断点续传
- [ ] 错误重试
- [ ] 本地日志记录
- [ ] 健康检查心跳

#### 打包方式
- [ ] Windows版：pkg打包成exe
- [ ] Linux版：pkg打包成二进制
- [ ] 配置文件：config.json
- [ ] 安装说明文档

---

## 第三阶段：本地测试（2天）

### 模拟ERP环境
- [ ] 本地创建模拟ERP数据库
- [ ] 插入测试数据
- [ ] 运行同步程序
- [ ] 测试数据接收API
- [ ] 测试审核流程

### 测试场景
- [ ] 新增数据同步
- [ ] 数据更新同步
- [ ] 删除数据处理
- [ ] 重复数据处理
- [ ] 脏数据处理
- [ ] 网络异常重试
- [ ] 审核通过流程
- [ ] 审核拒绝流程
- [ ] 数据修改流程
- [ ] 批量审核流程

---

## 第四阶段：客户内网部署（1天）

### 客户侧准备
- [ ] 提供一台内网服务器
  - Windows Server / Linux
  - 1核1G内存即可
  - 能访问ERP数据库
  - 能访问公网HTTPS

- [ ] 提供ERP数据库连接信息
  - 内网IP地址
  - 端口号
  - 数据库名
  - 只读账号密码

### 部署步骤
- [ ] 上传同步程序
- [ ] 配置连接信息
- [ ] 测试ERP数据库连接
- [ ] 测试公网API连接
- [ ] 启动同步服务
- [ ] 查看同步日志
- [ ] 配置开机自启
- [ ] 配置监控告警

---

## 第五阶段：上线运行（1天）

### 上线前检查
- [ ] 服务器API部署
- [ ] 数据库表创建
- [ ] 后台界面测试
- [ ] API鉴权配置
- [ ] 内网同步程序运行
- [ ] 第一次数据同步测试
- [ ] 审核流程测试

### 正式运行
- [ ] 首次全量同步
- [ ] 人工审核测试数据
- [ ] 确认数据正确性
- [ ] 切换到增量同步
- [ ] 监控同步状态
- [ ] 优化同步频率

---

## 时间线估算

```
Day 1:  [客户] 提供表结构和连接信息
        [我们] 获取表结构，设计审核表

Day 2-4: [我们] 开发后端API和数据库
        [客户] 准备内网服务器

Day 5-7: [我们] 开发前端审核界面
        [我们] 开发内网同步程序

Day 8-9: [我们] 本地测试完整流程
        [客户] 确认服务器准备就绪

Day 10:  [我们] 部署到客户内网
        [客户] 协助配置和测试

Day 11:  [双方] 正式上线运行
        [我们] 监控和优化
```

**总耗时：约2周（10个工作日）**

---

## 并行工作安排

### 第1周
- **客户**：准备内网服务器 + 提供表结构
- **我们**：开发API + 审核界面 + 同步程序

### 第2周
- **客户**：协助部署和测试
- **我们**：部署 + 测试 + 上线

这样可以最大化并行，节省时间！

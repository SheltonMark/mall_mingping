## 完整的产品同步逻辑

### ERP 数据结构：

1. **PRDT 表（产品主表）**
   * `PRD_NO`: 产品编号（如 C02.01.0180）
   * `NAME`: 品名（如 MB001-涤锦经编抹布10PCS）
   * `MARK_NO`: 特征组代号（如 2-021）
2. **MARKS 表（特征组表）**
   * `MARK_NO`: 特征组代号（如 2-021）
   * `MARK_NAME`: 特征组名称（如 MB001）
3. **PRD_MARKS 表（特征值表）**
   * `MARK_NO`: 特征组代号（如 2-021）
   * `PRD_MARK`: 具体特征值（如 "211C粉+225C常规玫红+..."）
   * 每一行 = 一个可选的附加属性

### 同步到网站的逻辑：

 **ProductGroup（产品组）** ：

* 按品名前缀提取（如 MB001）
* `MARK_NO` 关联到特征组
* `optionalAttributes`: 从 PRD_MARKS 获取所有特征值（8个颜色组合选项）

 **ProductSku（SKU）** ：

* 每个 `PRD_NO` = 一个 SKU
* 如：C02.01.0180（MB001-涤锦经编抹布10PCS）
* 如：C02.01.0181（MB001-涤锦经编抹布20PCS）
* 所有 MB001-xxx 的 SKU 共享同一组 optionalAttributes

 **产品详情页展示** ：

* 用户在 MB001 产品页
* 选择不同的 SKU（10PCS、20PCS、5PCS...）
* 选择附加属性（8种颜色组合）
* 附加属性对所有 MB001-xxx SKU 都是统一的

### 同步流程：

```
1. 查询 PRDT 表 → 获取产品基础信息（PRD_NO, NAME, SPC, MARK_NO）
2. 按 NAME 前缀分组 → 创建 ProductGroup（如 MB001）
3. 通过 MARK_NO 查询 PRD_MARKS → 获取所有附加属性值
4. 每个 PRD_NO → 创建一个 SKU
5. 附加属性存储在 ProductGroup 级别
```


## 产品同步方案设计

### 混合同步策略：自动 + 手动

 **1. 定时自动同步** （每天晚上12点）

* 只同步 `MARK_NO IS NOT NULL AND MARK_NO <> ''` 的产品
* 基于 `RECORD_DD` 增量同步（只同步最近24小时更新的）
* 后台定时任务执行，不影响用户使用

 **2. 手动同步** （管理员随时触发）

* 后台管理界面提供"立即同步"按钮
* 可以选择：
  * 全量同步（所有有 MARK_NO 的产品）
  * 增量同步（最近N天更新的产品）
  * 指定产品组同步（如只同步 MB001）

**3. 同步逻辑（自动和手动共用）**

```
核心SQL查询条件：
WHERE MARK_NO IS NOT NULL 
  AND MARK_NO <> ''
  AND RECORD_DD > [上次同步时间或指定时间]

同步流程：
1. 从 PRDT 读取符合条件的产品
2. 按 NAME 前缀分组 → 提取 ProductGroup
3. 通过 MARK_NO 从 PRD_MARKS 获取附加属性
4. 更新/创建 ProductGroup
5. 更新/创建 ProductSku
6. 记录本次同步时间
```

### 技术实现

 **后端接口** ：

* `POST /api/admin/products/sync` - 手动同步
  * 参数：`mode: 'full' | 'incremental'`, `days?: number`
* `GET /api/admin/products/sync-status` - 查看同步状态
* `GET /api/admin/products/sync-history` - 同步历史记录

 **定时任务** ：

* 使用 `node-cron` 或 `@nestjs/schedule`
* 每天 00:00 执行增量同步
* 日志记录同步结果

 **同步记录表** ：

* 记录每次同步的时间、数量、状态
* 用于增量同步的时间戳判断

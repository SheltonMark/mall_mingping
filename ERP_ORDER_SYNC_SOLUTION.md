# ERP 销售订单同步完整方案

> 本文档包含产品同步和销售订单写入两部分的完整方案

---

## 第一部分：产品数据同步方案 (ERP → 网站)

### ERP 数据结构

#### 1. **PRDT 表（产品主表）**

- `PRD_NO`: 产品编号（如 C02.01.0180）
- `NAME`: 品名（如 MB001-涤锦经编抹布10PCS）
- `SPC`: 货品规格（text类型）
- `MARK_NO`: 特征组代号（如 2-021）
- `RECORD_DD`: 记录日期（用于增量同步）

#### 2. **MARKS 表（特征组表）**

- `MARK_NO`: 特征组代号（主键，如 2-021）
- `MARK_NAME`: 特征组名称（如 MB001）
- `REM`: 备注

#### 3. **PRD_MARKS 表（特征值表）**

- `MARK_NO`: 特征组代号（如 2-021）
- `PRD_MARK`: 具体特征值（如 "211C粉+225C常规玫红+..."）
- `MARK_NAME`: 特征名称
- **每一行 = 一个可选的附加属性**

### 同步到网站的映射逻辑

#### **ProductGroup（产品组）**

- 按品名前缀提取（如 MB001）
- `MARK_NO` 关联到特征组
- `optionalAttributes`: 从 PRD_MARKS 获取所有特征值（如8个颜色组合选项）

#### **ProductSku（SKU）**

- 每个 `PRD_NO` = 一个 SKU
- 示例：
  - C02.01.0180（MB001-涤锦经编抹布10PCS）
  - C02.01.0181（MB001-涤锦经编抹布20PCS）
- 所有 MB001-xxx 的 SKU 共享同一组 optionalAttributes

#### **产品详情页展示**

- 用户访问 MB001 产品页
- 选择不同的 SKU（10PCS、20PCS、5PCS...）
- 选择附加属性（8种颜色组合）
- 附加属性对所有 MB001-xxx SKU 都是统一的

### 同步流程

```
1. 查询 PRDT 表 → 获取产品基础信息（PRD_NO, NAME, SPC, MARK_NO）
2. 按 NAME 前缀分组 → 创建 ProductGroup（如 MB001）
3. 通过 MARK_NO 查询 PRD_MARKS → 获取所有附加属性值
4. 每个 PRD_NO → 创建一个 SKU
5. 附加属性存储在 ProductGroup 级别
```

### 混合同步策略：自动 + 手动

#### **1. 定时自动同步**（每天晚上12点）

- 只同步 `MARK_NO IS NOT NULL AND MARK_NO <> ''` 的产品
- 基于 `RECORD_DD` 增量同步（只同步最近24小时更新的）
- 后台定时任务执行，不影响用户使用

#### **2. 手动同步**（管理员随时触发）

- 后台管理界面提供"立即同步"按钮
- 可以选择：
  - 全量同步（所有有 MARK_NO 的产品）
  - 增量同步（最近N天更新的产品）
  - 指定产品组同步（如只同步 MB001）

#### **3. 同步逻辑**（自动和手动共用）

```sql
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

---

## 第二部分：销售订单写入方案 (网站 → ERP)

### 一、ERP 销售订单表结构分析

#### 1. **MF_POS（销售订单主表）**

**必填字段（基于实际查询结果）：**

- `OS_ID` (varchar 2) - 订单类型，固定值 'SO'（NOT NULL）
- `OS_NO` (varchar 20) - 订单编号（NOT NULL）

**其他 95 个字段均为可选（IS_NULLABLE = YES）**

**核心字段：**

```
OS_ID        varchar(2)      订单类型ID (SO=销售订单) [必填]
OS_NO        varchar(20)     订单编号 [必填]
OS_DD        datetime        订单日期 [可选，推荐填]
CUS_NO       varchar(12)     客户编号 [可选，推荐填]
SAL_NO       varchar(12)     业务员编号 [可选，推荐填]
AMTN_INT     numeric(28,8)   总金额(未税) [可选，推荐填]
USR          varchar(8)      制单人(业务员名字) [可选，推荐填]
RECORD_DD    datetime        记录日期(系统当前时间) [可选，推荐填]
CLS_ID       varchar(1)      结案状态 (F=未结案) [可选，推荐填]
REM          text            备注/自定义参数 [可选]
EST_DD       datetime        预交日期 [可选]
PAY_MTH      varchar(1)      付款方式 (1=月结, 2=现金等) [可选]
PAY_REM      varchar(255)    付款备注 [可选]
SEND_MTH     varchar(2)      送货方式 [可选]
SEND_WH      varchar(12)     发货仓库 [可选]
```

**总结：MF_POS 表共 97 个字段，只有 2 个必填（OS_ID, OS_NO），其他 95 个字段全部可选。**

#### 2. **TF_POS（销售订单明细主表）**

**必填字段（基于实际查询结果）：**

- `OS_ID` (varchar 2) - 订单类型（NOT NULL）
- `OS_NO` (varchar 20) - 订单编号（NOT NULL）
- `ITM` (smallint) - 项次序号（NOT NULL）

**其他 93 个字段均为可选（IS_NULLABLE = YES）**

#### 2.5 **TF_POS_Z（销售订单明细扩展表）** ⭐ **重要发现**

**必填字段：**

- `OS_ID` (varchar 2) - 订单类型（NOT NULL）
- `OS_NO` (varchar 20) - 订单编号（NOT NULL）
- `ITM` (smallint) - 项次序号（NOT NULL）

**关键包装字段（网站7个特有字段在ERP中的对应）：**

| ERP字段 | 类型 | 说明 | 对应网站字段 |
|---------|------|------|-------------|
| **PQTY1** | int | 装箱数 | packingQuantity |
| **PQTY2** | int | 箱数 | cartonQuantity |
| **BZFS** | varchar(255) | 包装方式（完整描述） | packagingMethod |
| **DKBM** | varchar(50) | 纸卡编码 | paperCardCode |
| **WXBM** | varchar(50) | 水洗标编码 | washLabelCode |
| **SXBBM** | varchar(255) | 外箱标编码 | outerCartonCode |
| **XG** | varchar(50) | 箱规 | cartonSpecification |

**其他扩展字段：**
- `PQTY3` (varchar 20): 其他数量
- `CSHH` (varchar 20): 厂商货号
- `CSBZ` (text): 厂商备注
- `ZS`, `ZC`, `ZG`, `ZM1`, `BZ1`, `ZP`, `JHKH`: 其他自定义字段

**总结：TF_POS_Z 表共 20 个字段，只有 3 个必填（OS_ID, OS_NO, ITM），作为TF_POS的扩展表存储包装等自定义信息。**

**核心字段：**

```
OS_ID             varchar(2)       订单类型ID [必填]
OS_NO             varchar(20)      订单编号 [必填]
ITM               smallint         项次序号 [必填]
PRD_NO            varchar(50)      品号/SKU编码 [可选，推荐填]
PRD_NAME          varchar(100)     品名 [可选，推荐填]
PRD_MARK          varchar(255)     产品标记/颜色属性 [可选]
QTY               numeric(28,8)    订购数量 [可选，推荐填]
UP                numeric(28,8)    单价 [可选，推荐填]
AMT               numeric(28,8)    小计金额(含税) [可选]
AMTN              numeric(28,8)    小计金额(未税) [可选]
TAX               numeric(28,8)    税额 [可选]
SPC               varchar(2000)    规格说明 [可选]
EST_DD            datetime         预交日期 [可选]
PAK_UNIT          varchar(24)      包装单位 [可选]
PAK_EXC           numeric(28,8)    包装换算 [可选]
PAK_NW            numeric(28,8)    净重 [可选]
PAK_GW            numeric(28,8)    毛重 [可选]
PAK_WEIGHT_UNIT   varchar(8)       重量单位 [可选]
PAK_MEAST         numeric(28,8)    材积/体积 [可选]
PAK_MEAST_UNIT    varchar(8)       体积单位 [可选]
BZ_KND            varchar(20)      包装类型 [可选]
REM               varchar(1000)    备注 [可选]
ATTR              varchar(30)      附加属性/颜色 [可选]
```

**总结：TF_POS 表共 96 个字段，只有 3 个必填（OS_ID, OS_NO, ITM），其他 93 个字段全部可选。**

#### 3. **CUST（客户表）**

**必填字段（基于实际查询结果）：**

- `CUS_NO` (varchar 12) - 客户编号（主键，NOT NULL）

**其他 112 个字段均为可选（IS_NULLABLE = YES）**

**推荐填写的常用字段：**

```
CUS_NO      varchar(12)     客户编号（主键，必填）
NAME        varchar(110)    客户名称（可选，推荐填）
E_MAIL      varchar(255)    邮箱（可选，推荐填）
SAL         varchar(12)     业务员编号（可选，推荐填）
TEL1        varchar(30)     电话1（可选，推荐填）
ADR1        text            地址1（可选，推荐填）
COUNTRY     varchar(20)     国家（可选，推荐填）
REM         text            备注（可选）
RECORD_DD   datetime        记录日期（可选，推荐填当前时间）
```

**网站Customer表字段映射：**

| 网站字段       | 类型   | ERP字段   | 类型         | 映射说明                     |
| -------------- | ------ | --------- | ------------ | ---------------------------- |
| id             | String | CUS_NO    | varchar(12)  | 通过映射表转换（必填）       |
| name           | String | NAME      | varchar(110) | 客户名称/公司名称（推荐填）  |
| email          | String | E_MAIL    | varchar(255) | 邮箱（推荐填）               |
| phone          | String | TEL1      | varchar(30)  | 电话（推荐填）               |
| address        | String | ADR1      | text         | 地址（推荐填）               |
| country        | String | COUNTRY   | varchar(20)  | 国家（推荐填）               |
| salespersonId  | String | SAL       | varchar(12)  | 业务员编号（通过映射表转换） |
| remarks        | String | REM       | text         | 备注（可选）                 |
| -              | -      | RECORD_DD | datetime     | 当前时间（推荐填）           |

**总结：**

- CUST 表共 113 个字段，只有 1 个必填（CUS_NO），其他 112 个字段全部可选
- ERP客户表非常灵活，网站当前的Customer表字段设计已经足够，不需要增加额外字段
- 建议将网站的常用字段（name, email, phone, address, country等）都同步到ERP，提高数据完整性

---

### 二、网站订单表与ERP订单表字段映射

#### **订单表头映射（Order → MF_POS）**

| 网站字段      | 类型         | ERP字段   | 类型          | 映射说明                       |
| ------------- | ------------ | --------- | ------------- | ------------------------------ |
| orderNumber   | String       | OS_NO     | varchar(20)   | 订单编号（需按ERP规则生成）    |
| -             | -            | OS_ID     | varchar(2)    | 固定值 'SO' [必填]            |
| customerId    | String(UUID) | CUS_NO    | varchar(12)   | 需要映射表转换                 |
| salespersonId | String(UUID) | SAL_NO    | varchar(12)   | 需要映射表转换                 |
| orderDate     | DateTime     | OS_DD     | datetime      | 订单日期                       |
| totalAmount   | Decimal      | AMTN_INT  | numeric(28,8) | 总金额(未税)                   |
| companyName   | String       | -         | -             | 存储在CUST.NAME中              |
| status        | String       | CLS_ID    | varchar(1)    | 'pending'→'F'(未结案)         |
| -             | -            | USR       | varchar(8)    | 业务员工号（SAL_NO）           |
| -             | -            | RECORD_DD | datetime      | 系统当前时间                   |
| -             | -            | SEND_MTH  | varchar(2)    | 默认值 '1'                     |
| -             | -            | SEND_WH   | varchar(12)   | 默认仓库 '01'                  |
| customParams  | JSON         | REM       | text          | JSON序列化存储                 |
| -             | -            | PAY_MTH   | varchar(1)    | 付款方式（从customParams提取） |
| -             | -            | EST_DD    | datetime      | 预交日期                       |

#### **订单明细映射（OrderItem → TF_POS）**

| 网站字段               | ERP字段         | 类型          | 说明                       |
| ---------------------- | --------------- | ------------- | -------------------------- |
| itemNumber             | ITM             | smallint      | 项次序号 [必填]           |
| productSku.productCode | PRD_NO          | varchar(50)   | 品号/SKU编码               |
| productSku.productName | PRD_NAME        | varchar(100)  | 品名                       |
| customerProductCode    | -               | -             | ❌ 存入REM                 |
| productImage           | -               | -             | ❌ 不存数据库               |
| productSpec            | SPC             | varchar(2000) | 货品规格                   |
| additionalAttributes   | PRD_MARK        | varchar(255)  | 颜色/属性（前255字符）     |
| additionalAttributes   | ATTR            | varchar(30)   | 属性代码（前30字符）       |
| quantity               | QTY             | numeric(28,8) | 订购数量                   |
| packagingConversion    | PAK_EXC         | numeric(28,8) | 包装换算                   |
| packagingUnit          | PAK_UNIT        | varchar(24)   | 包装单位                   |
| weightUnit             | PAK_WEIGHT_UNIT | varchar(8)    | 重量单位                   |
| netWeight              | PAK_NW          | numeric(28,8) | 包装净重                   |
| grossWeight            | PAK_GW          | numeric(28,8) | 包装毛重                   |
| packagingType          | BZ_KND          | varchar(20)   | 包装类型                   |
| packagingSize          | -               | -             | ❌ 存入REM                 |
| supplierNote           | REM             | varchar(1000) | 厂商备注                   |
| expectedDeliveryDate   | EST_DD          | datetime      | 预交日期                   |
| price                  | UP              | numeric(28,8) | 单价                       |
| untaxedLocalCurrency   | AMTN            | numeric(28,8) | 未税金额                   |
| **packingQuantity**    | TF_POS_Z.PQTY1  | int           | ✅ 装箱数（扩展表）        |
| **cartonQuantity**     | TF_POS_Z.PQTY2  | int           | ✅ 箱数（扩展表）          |
| **packagingMethod**    | TF_POS_Z.BZFS   | varchar(255)  | ✅ 包装方式（扩展表）      |
| **paperCardCode**      | TF_POS_Z.DKBM   | varchar(50)   | ✅ 纸卡编码（扩展表）      |
| **washLabelCode**      | TF_POS_Z.WXBM   | varchar(50)   | ✅ 水洗标编码（扩展表）    |
| **outerCartonCode**    | TF_POS_Z.SXBBM  | varchar(255)  | ✅ 外箱标编码（扩展表）    |
| **cartonSpecification**| TF_POS_Z.XG     | varchar(50)   | ✅ 箱规（扩展表）          |
| volume                 | PAK_MEAST       | numeric(28,8) | 材积/体积                  |
| -                      | PAK_MEAST_UNIT  | varchar(8)    | 固定 "m³"                 |
| summary                | REM             | varchar(1000) | 摘要（合并多个字段）       |
| subtotal               | AMT             | numeric(28,8) | 小计金额(含税)             |
| -                      | TAX             | numeric(28,8) | 税额 = AMT - AMTN          |

#### **网站包装字段处理方案** ⭐ **重大更新**

**经过实际数据库查询，发现这7个字段在ERP中是以独立结构化字段存储在扩展表 TF_POS_Z 中！**

| 网站字段 | ERP表 | ERP字段 | 类型 | 说明 |
|---------|------|---------|------|------|
| packingQuantity | TF_POS_Z | **PQTY1** | int | 装箱数 |
| cartonQuantity | TF_POS_Z | **PQTY2** | int | 箱数 |
| packagingMethod | TF_POS_Z | **BZFS** | varchar(255) | 包装方式（完整描述）|
| paperCardCode | TF_POS_Z | **DKBM** | varchar(50) | 纸卡编码 |
| washLabelCode | TF_POS_Z | **WXBM** | varchar(50) | 水洗标编码 |
| outerCartonCode | TF_POS_Z | **SXBBM** | varchar(255) | 外箱标编码 |
| cartonSpecification | TF_POS_Z | **XG** | varchar(50) | 箱规 |

**ERP实际数据示例（TF_POS_Z表）**：
```sql
OS_NO: SO202511044, ITM: 1
PQTY1: 120        -- 装箱数
PQTY2: 50         -- 箱数
BZFS: 客户编号56123，单卷腰卡+热缩，20卷/展示盒，120卷/箱  -- 包装方式
DKBM: 8432753561231   -- 纸卡编码
WXBM: 8432753561231   -- 水洗标编码
SXBBM: 无             -- 外箱标编码
XG: 待定              -- 箱规
```

**处理方案：**

1. **网站存储**：这些字段保留在网站的 `OrderItem` 表中（结构化字段）

2. **ERP同步**：写入ERP时，**需要同时写入两个表**：
   - ✅ **TF_POS**：写入订单明细基本信息（品号、数量、单价等）
   - ✅ **TF_POS_Z**：写入订单明细扩展信息（装箱数、箱数、包装方式等7个字段）
   - 通过 `(OS_ID, OS_NO, ITM)` 三个字段关联

3. **关联关系**：
   ```
   TF_POS.OS_ID + TF_POS.OS_NO + TF_POS.ITM
   =
   TF_POS_Z.OS_ID + TF_POS_Z.OS_NO + TF_POS_Z.ITM
   ```

4. **ERP标准包装字段（TF_POS中已有结构化字段）**：
   - PAK_UNIT (包装单位)
   - PAK_EXC (包装换算)
   - PAK_NW (净重)
   - PAK_GW (毛重)
   - PAK_WEIGHT_UNIT (重量单位)
   - PAK_MEAST (体积)
   - PAK_MEAST_UNIT (体积单位)
   - BZ_KND (包装类型编码，关联到BZ_KND表)

---

### 三、订单编号生成规则

根据实际数据分析，ERP订单编号规则为：

```
格式：SO + 年(4位) + 月(2位) + 流水号(3位)
示例：SO202511044 = SO + 2025 + 11 + 044
```

**生成逻辑：**

```typescript
async generateOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `SO${year}${month}`;

  // 查询当月最大流水号
  const maxOrderNo = await this.erpDataSource.query(`
    SELECT MAX(CAST(RIGHT(OS_NO, 3) AS INT)) as maxSeq
    FROM MF_POS
    WHERE OS_ID = 'SO'
      AND OS_NO LIKE '${prefix}%'
  `);

  const nextSeq = (maxOrderNo[0]?.maxSeq || 0) + 1;
  return `${prefix}${String(nextSeq).padStart(3, '0')}`;
}
```

**注意事项：**
- 需要加锁机制防止并发时流水号重复
- 建议使用数据库事务或分布式锁（Redis）

---

### 四、客户和业务员映射

#### 方案1：创建映射表（推荐）

```sql
-- 网站数据库（SQLite）
CREATE TABLE erp_customer_mapping (
  id TEXT PRIMARY KEY,
  website_customer_id TEXT UNIQUE, -- 网站Customer.id
  erp_customer_no VARCHAR(12),      -- ERP CUST.CUS_NO
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE erp_salesperson_mapping (
  id TEXT PRIMARY KEY,
  website_salesperson_id TEXT UNIQUE, -- 网站Salesperson.id
  erp_salesperson_no VARCHAR(12),      -- ERP SAL_NO (如MP0005)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 方案2：在网站表中添加ERP编号字段

```sql
ALTER TABLE customers ADD COLUMN erp_customer_no VARCHAR(12);
ALTER TABLE salespersons ADD COLUMN erp_salesperson_no VARCHAR(12);
```

**推荐使用方案1**，因为：
- 更灵活，支持一对多映射（未来可能需要）
- 不污染原有表结构
- 便于维护和追溯映射历史

---

### 五、核心代码实现

#### 1. 数据库连接配置

```typescript
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const erpDatabaseConfig: TypeOrmModuleOptions = {
  name: 'erp',
  type: 'mssql',
  host: process.env.ERP_DB_HOST || 'MSSQL',
  port: parseInt(process.env.ERP_DB_PORT) || 1433,
  username: process.env.ERP_DB_USER || 'sa',
  password: process.env.ERP_DB_PASSWORD || '1q!',
  database: 'DB_MP01',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// app.module.ts
@Module({
  imports: [
    TypeOrmModule.forRoot({...}), // 默认网站数据库(SQLite)
    TypeOrmModule.forRoot(erpDatabaseConfig), // ERP数据库
  ],
})
export class AppModule {}
```

#### 2. ERP订单同步服务

```typescript
// src/modules/erp/erp-order-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ErpOrderSyncService {
  private readonly logger = new Logger(ErpOrderSyncService.name);

  constructor(
    @InjectDataSource() // 网站数据库
    private readonly webDataSource: DataSource,

    @InjectDataSource('erp') // ERP数据库
    private readonly erpDataSource: DataSource,
  ) {}

  /**
   * 将网站订单同步到ERP
   */
  async syncOrderToErp(orderId: string) {
    // 1. 从网站数据库读取订单
    const order = await this.webDataSource
      .getRepository('orders')
      .findOne({
        where: { id: orderId },
        relations: ['items', 'items.productSku', 'customer', 'salesperson'],
      });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    // 2. 开启ERP数据库事务
    const queryRunner = this.erpDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 3. 生成订单编号
      const erpOrderNo = await this.generateOrderNumber();

      // 4. 获取客户和业务员的ERP编号
      const erpCustomerNo = await this.getErpCustomerNo(order.customerId);
      const erpSalespersonNo = await this.getErpSalespersonNo(order.salespersonId);

      // 5. 写入主表 MF_POS
      await queryRunner.query(`
        INSERT INTO MF_POS (
          OS_ID, OS_NO, OS_DD, CUS_NO, SAL_NO,
          AMTN_INT, USR, RECORD_DD, CLS_ID,
          EST_DD, SEND_MTH, SEND_WH, PAY_MTH, REM
        ) VALUES (
          'SO', @p0, @p1, @p2, @p3,
          @p4, @p5, GETDATE(), 'F',
          @p6, '1', '01', '1', @p7
        )
      `, [
        erpOrderNo,                                    // OS_NO
        order.orderDate,                               // OS_DD
        erpCustomerNo,                                 // CUS_NO
        erpSalespersonNo,                              // SAL_NO
        order.totalAmount || 0,                        // AMTN_INT
        erpSalespersonNo,                              // USR
        order.items[0]?.expectedDeliveryDate || null,  // EST_DD
        JSON.stringify(order.customParams || {}),      // REM
      ]);

      // 6. 写入明细表 TF_POS 和扩展表 TF_POS_Z
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const itemNumber = item.itemNumber || (i + 1);

        // 计算税额 (假设税率11%)
        const taxRate = 0.11;
        const amtn = item.price * item.quantity; // 未税金额
        const tax = amtn * taxRate;              // 税额
        const amt = amtn + tax;                  // 含税金额

        // 6.1 写入 TF_POS 主表
        await queryRunner.query(`
          INSERT INTO TF_POS (
            OS_ID, OS_NO, ITM, PRD_NO, PRD_NAME, PRD_MARK,
            QTY, UP, AMT, AMTN, TAX,
            SPC, ATTR, PAK_UNIT, PAK_EXC,
            PAK_NW, PAK_GW, PAK_WEIGHT_UNIT,
            PAK_MEAST, PAK_MEAST_UNIT,
            EST_DD, REM, BZ_KND, OS_DD,
            WH, UNIT, TAX_RTO
          ) VALUES (
            'SO', @p0, @p1, @p2, @p3, @p4,
            @p5, @p6, @p7, @p8, @p9,
            @p10, @p11, @p12, @p13,
            @p14, @p15, @p16,
            @p17, 'm³',
            @p18, @p19, @p20, @p21,
            'W1000', '1', 11.00
          )
        `, [
          erpOrderNo,                                 // OS_NO
          itemNumber,                                 // ITM
          item.productSku.productCode,                // PRD_NO
          item.productSku.productName,                // PRD_NAME
          (item.additionalAttributes || '').substring(0, 255), // PRD_MARK
          item.quantity,                              // QTY
          item.price,                                 // UP
          amt,                                        // AMT (含税)
          amtn,                                       // AMTN (未税)
          tax,                                        // TAX
          item.productSpec || '',                     // SPC
          (item.additionalAttributes || '').substring(0, 30), // ATTR
          item.packagingUnit || '',                   // PAK_UNIT
          item.packagingConversion || 0,              // PAK_EXC
          item.netWeight || 0,                        // PAK_NW
          item.grossWeight || 0,                      // PAK_GW
          item.weightUnit || '',                      // PAK_WEIGHT_UNIT
          item.volume || 0,                           // PAK_MEAST
          item.expectedDeliveryDate,                  // EST_DD
          item.supplierNote || '',                    // REM
          item.packagingType || '',                   // BZ_KND
          order.orderDate,                            // OS_DD
        ]);

        // 6.2 写入 TF_POS_Z 扩展表（7个包装字段）
        await queryRunner.query(`
          INSERT INTO TF_POS_Z (
            OS_ID, OS_NO, ITM,
            PQTY1, PQTY2, BZFS,
            DKBM, WXBM, SXBBM, XG
          ) VALUES (
            'SO', @p0, @p1,
            @p2, @p3, @p4,
            @p5, @p6, @p7, @p8
          )
        `, [
          erpOrderNo,                                 // OS_NO
          itemNumber,                                 // ITM
          item.packingQuantity || null,               // PQTY1 - 装箱数
          item.cartonQuantity || null,                // PQTY2 - 箱数
          item.packagingMethod || '',                 // BZFS - 包装方式
          item.paperCardCode || '',                   // DKBM - 纸卡编码
          item.washLabelCode || '',                   // WXBM - 水洗标编码
          item.outerCartonCode || '',                 // SXBBM - 外箱标编码
          item.cartonSpecification || '',             // XG - 箱规
        ]);
      }

      // 7. 提交事务
      await queryRunner.commitTransaction();

      this.logger.log(`Order synced to ERP successfully: ${erpOrderNo}`);

      return {
        success: true,
        erpOrderNo,
        webOrderId: orderId,
      };

    } catch (error) {
      // 8. 回滚事务
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to sync order to ERP: ${error.message}`, error.stack);
      throw error;
    } finally {
      // 9. 释放连接
      await queryRunner.release();
    }
  }

  /**
   * 生成ERP订单编号
   */
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;

    const result = await this.erpDataSource.query(`
      SELECT MAX(CAST(RIGHT(OS_NO, 3) AS INT)) as maxSeq
      FROM MF_POS
      WHERE OS_ID = 'SO' AND OS_NO LIKE '${prefix}%'
    `);

    const nextSeq = (result[0]?.maxSeq || 0) + 1;
    return `${prefix}${String(nextSeq).padStart(3, '0')}`;
  }

  /**
   * 获取ERP客户编号
   */
  private async getErpCustomerNo(customerId: string): Promise<string> {
    const mapping = await this.webDataSource.query(`
      SELECT erp_customer_no FROM erp_customer_mapping
      WHERE website_customer_id = ?
    `, [customerId]);

    if (!mapping || !mapping[0]?.erp_customer_no) {
      throw new Error(`Customer ${customerId} not mapped to ERP`);
    }

    return mapping[0].erp_customer_no;
  }

  /**
   * 获取ERP业务员编号
   */
  private async getErpSalespersonNo(salespersonId: string): Promise<string> {
    const mapping = await this.webDataSource.query(`
      SELECT erp_salesperson_no FROM erp_salesperson_mapping
      WHERE website_salesperson_id = ?
    `, [salespersonId]);

    if (!mapping || !mapping[0]?.erp_salesperson_no) {
      throw new Error(`Salesperson ${salespersonId} not mapped to ERP`);
    }

    return mapping[0].erp_salesperson_no;
  }
}
```

#### 3. 集成到订单创建流程

```typescript
// src/modules/order/order.service.ts
@Injectable()
export class OrderService {
  constructor(
    private readonly erpOrderSyncService: ErpOrderSyncService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    // 1. 创建网站订单
    const order = await this.orderRepository.save({
      ...createOrderDto,
      orderNumber: this.generateWebOrderNumber(),
      status: 'pending',
    });

    // 2. 同步到ERP（可选：异步处理）
    try {
      const syncResult = await this.erpOrderSyncService.syncOrderToErp(order.id);

      // 更新网站订单的ERP订单号
      await this.orderRepository.update(order.id, {
        erpOrderNo: syncResult.erpOrderNo,
        erpSyncStatus: 'synced',
        erpSyncAt: new Date(),
      });

    } catch (error) {
      // 同步失败,记录错误但不影响网站订单创建
      await this.orderRepository.update(order.id, {
        erpSyncStatus: 'failed',
        erpSyncError: error.message,
      });

      // 可以发送告警通知管理员
      this.logger.error(`ERP sync failed for order ${order.id}: ${error.message}`);
    }

    return order;
  }
}
```

---

### 六、环境变量配置

```env
# .env
# ERP数据库配置
ERP_DB_HOST=MSSQL
ERP_DB_PORT=1433
ERP_DB_USER=sa
ERP_DB_PASSWORD=1q!
ERP_DB_NAME=DB_MP01

# ERP同步配置
ERP_SYNC_ENABLED=true
ERP_SYNC_ASYNC=true  # 是否异步同步
ERP_DEFAULT_WAREHOUSE=01
ERP_DEFAULT_SEND_METHOD=1
ERP_TAX_RATE=0.11
```

---

### 七、关键注意事项

#### 1. 字段长度限制

- `SPC` (规格): 最大 2000 字符
- `REM` (备注): 最大 1000 字符（TF_POS）/ text类型（MF_POS）
- `PRD_MARK`: 最大 255 字符
- `ATTR`: 最大 30 字符

#### 2. 数据类型转换

- 所有金额字段使用 `numeric(28,8)`
- 日期使用 SQL Server 的 `datetime` 类型
- 文本字段使用 `varchar` 或 `text`

#### 3. 事务处理

- **必须使用事务**确保主表和明细表同时成功
- 失败时完整回滚,不产生脏数据
- 建议设置合适的事务超时时间

#### 4. 订单编号生成

- 必须按照ERP规则生成: `SO + 年月 + 流水号`
- 需要加锁防止并发时流水号重复
- 建议使用 Redis 分布式锁或数据库事务锁

#### 5. 客户和业务员映射

- 网站的UUID需要映射到ERP的编号
- 建议使用映射表（erp_customer_mapping, erp_salesperson_mapping）
- 映射关系应在客户/业务员创建时同步建立

#### 6. 错误处理策略

- ERP同步失败不应影响网站订单创建
- 记录同步状态和错误信息（erpSyncStatus, erpSyncError）
- 提供手动重试机制（后台管理界面）
- 设置告警通知管理员

#### 7. 性能优化

- 考虑异步同步(使用消息队列 Bull/BullMQ)
- 批量同步时使用批处理
- 定期清理同步日志
- 对频繁查询的映射表添加索引

#### 8. 包装字段处理 ⭐ **重大发现**

- **7个包装字段**（装箱数、箱数、包装方式、纸卡编码、水洗标编码、外箱编码、箱规）在ERP中**确实存在**
- **存储位置**：独立的扩展表 **TF_POS_Z**（不是TF_POS主表）
- **字段映射**：
  - PQTY1 → packingQuantity (装箱数)
  - PQTY2 → cartonQuantity (箱数)
  - BZFS → packagingMethod (包装方式)
  - DKBM → paperCardCode (纸卡编码)
  - WXBM → washLabelCode (水洗标编码)
  - SXBBM → outerCartonCode (外箱标编码)
  - XG → cartonSpecification (箱规)
- **关联方式**：通过 (OS_ID, OS_NO, ITM) 三键关联
- **同步策略**：写入订单时需要**同时写入 TF_POS 和 TF_POS_Z 两个表**

---

### 八、测试SQL命令

```bash
# 查看ERP最新订单
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT TOP 5
  OS_NO, OS_DD, CUS_NO, SAL_NO, AMTN_INT, REM
FROM MF_POS
WHERE OS_ID = 'SO'
ORDER BY RECORD_DD DESC;
GO
EOF

# 查看订单明细
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT TOP 5
  OS_NO, ITM, PRD_NO, PRD_NAME, QTY, UP, AMT, SPC, REM
FROM TF_POS
WHERE OS_NO = 'SO202511044';
GO
EOF

# 查看客户信息
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT CUS_NO, NAME, SAL, E_MAIL, TEL1, COUNTRY
FROM CUST
WHERE CUS_NO = 'C0064';
GO
EOF

# 查看所有表结构（确认字段是否存在）
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT
  TABLE_NAME,
  COLUMN_NAME,
  DATA_TYPE,
  CHARACTER_MAXIMUM_LENGTH,
  IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'TF_POS'
ORDER BY ORDINAL_POSITION;
GO
EOF
```

---

### 九、实施步骤

#### 第一步：准备工作

1. ✅ 安装 `mssql` npm 包
   ```bash
   npm install mssql
   ```

2. ✅ 配置 ERP 数据库连接
   - 添加环境变量到 `.env`
   - 配置 TypeORM 多数据源

3. ✅ 创建映射表（客户、业务员）
   ```bash
   npx prisma migrate dev --name add_erp_mapping_tables
   ```

#### 第二步：核心功能开发

4. ✅ 实现订单编号生成器
   - `generateOrderNumber()` 方法
   - 加入并发控制（Redis锁）

5. ✅ 实现订单同步服务
   - `ErpOrderSyncService`
   - 事务处理
   - 字段映射和转换
   - `buildItemRemarks()` 处理7个特有字段

6. ✅ 集成到订单创建流程
   - 在 `OrderService.createOrder()` 中调用同步
   - 异步处理（可选）
   - 错误处理和状态记录

#### 第三步：测试验证

7. ✅ 单元测试（订单编号生成、字段映射）
   ```bash
   npm run test -- erp-order-sync.service.spec.ts
   ```

8. ✅ 集成测试（完整订单同步流程）
   - 创建测试订单
   - 验证 MF_POS 和 TF_POS 数据
   - 检查 REM 字段中的7个特有字段

9. ✅ 在ERP中验证数据正确性
   - 使用上述 SQL 命令查询
   - 检查字段映射是否准确
   - 验证金额计算（含税/未税）

#### 第四步：上线部署

10. ✅ 配置生产环境数据库连接
    - 更新生产环境 `.env`
    - 测试连接性

11. ✅ 设置监控和告警
    - 同步失败告警
    - 性能监控（同步耗时）
    - 日志收集

12. ✅ 准备回滚方案
    - 数据备份
    - 回滚脚本
    - 应急预案

---

## 附录A：完整数据流图

```
┌─────────────────────────────────────────────────────────────────┐
│                        产品数据同步流程                          │
│  ERP (DB_MP01)                                      网站数据库   │
│                                                                 │
│  ┌─────────┐       ┌───────────┐       ┌─────────────────┐    │
│  │  PRDT   │──────▶│  同步服务  │──────▶│ ProductGroup    │    │
│  │ (产品表) │       │           │       │  ProductSku     │    │
│  └─────────┘       │           │       └─────────────────┘    │
│        │           │           │                               │
│        ▼           │           │                               │
│  ┌─────────┐       │           │                               │
│  │  MARKS  │──────▶│           │                               │
│  │(特征组表)│       │           │                               │
│  └─────────┘       │           │                               │
│        │           │           │                               │
│        ▼           │           │                               │
│  ┌─────────┐       │           │                               │
│  │PRD_MARKS│──────▶│           │                               │
│  │(特征值表)│       └───────────┘                               │
│  └─────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       订单数据写入流程                           │
│  网站数据库                                       ERP (DB_MP01)  │
│                                                                 │
│  ┌─────────┐       ┌───────────┐       ┌─────────────────┐    │
│  │  Order  │──────▶│  同步服务  │──────▶│     MF_POS      │    │
│  │         │       │           │       │   (订单主表)     │    │
│  └─────────┘       │           │       └─────────────────┘    │
│        │           │           │                │              │
│        ▼           │           │                ▼              │
│  ┌─────────┐       │           │       ┌─────────────────┐    │
│  │OrderItem│──────▶│  映射转换  │──────▶│     TF_POS      │    │
│  │         │       │           │       │   (订单明细)     │    │
│  │  - 7个  │       │buildItem  │       │  REM字段存储    │    │
│  │   特有  │──────▶│  Remarks  │──────▶│  7个特有字段    │    │
│  │   字段  │       │           │       └─────────────────┘    │
│  └─────────┘       └───────────┘                               │
│                           │                                    │
│                           ▼                                    │
│                    ┌─────────────┐                             │
│                    │   映射表     │                             │
│                    │ Customer    │                             │
│                    │ Salesperson │                             │
│                    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 附录B：ERP表结构总结

### MF_POS（销售订单主表）

- **总字段数**: 97
- **必填字段**: 2（OS_ID, OS_NO）
- **可选字段**: 95（所有业务字段）
- **关键事实**: ERP订单主表非常灵活，只强制要求订单类型和订单号

### TF_POS（销售订单明细主表）

- **总字段数**: 96
- **必填字段**: 3（OS_ID, OS_NO, ITM）
- **可选字段**: 93（所有业务字段）
- **关键事实**: 明细表只强制要求基本索引字段，所有产品和金额字段都是可选的

### TF_POS_Z（销售订单明细扩展表）⭐ **核心发现**

- **总字段数**: 20
- **必填字段**: 3（OS_ID, OS_NO, ITM）
- **可选字段**: 17（包括7个包装字段）
- **关键事实**: 这就是存储网站7个包装字段的地方！

**扩展表字段说明：**
- **PQTY1** (int): 装箱数
- **PQTY2** (int): 箱数
- **BZFS** (varchar 255): 包装方式（完整描述）
- **DKBM** (varchar 50): 纸卡编码
- **WXBM** (varchar 50): 水洗标编码
- **SXBBM** (varchar 255): 外箱标编码
- **XG** (varchar 50): 箱规
- **PQTY3** (varchar 20): 其他数量
- **CSHH** (varchar 20): 厂商货号
- **CSBZ** (text): 厂商备注
- 其他自定义字段: ZS, ZC, ZG, ZM1, BZ1, ZP, JHKH

### CUST（客户表）

- **总字段数**: 113
- **必填字段**: 1（CUS_NO）
- **可选字段**: 112（所有业务字段）
- **关键事实**: 客户表极度灵活，只需要客户编号即可创建记录

### 网站包装字段在ERP中的存储 ⭐ **最终确认**

**经过完整的数据库调查，以下7个字段在ERP中的实际存储位置已确认：**

| 网站字段 | ERP表 | ERP字段 | 数据类型 | 说明 |
|---------|------|---------|---------|------|
| packingQuantity | **TF_POS_Z** | PQTY1 | int | 装箱数 |
| cartonQuantity | **TF_POS_Z** | PQTY2 | int | 箱数 |
| packagingMethod | **TF_POS_Z** | BZFS | varchar(255) | 包装方式（完整描述）|
| paperCardCode | **TF_POS_Z** | DKBM | varchar(50) | 纸卡编码 |
| washLabelCode | **TF_POS_Z** | WXBM | varchar(50) | 水洗标编码 |
| outerCartonCode | **TF_POS_Z** | SXBBM | varchar(255) | 外箱标编码 |
| cartonSpecification | **TF_POS_Z** | XG | varchar(50) | 箱规 |

**实际数据示例（TF_POS_Z表）**：
```
OS_NO: SO202511044, ITM: 1
PQTY1: 120                    -- 装箱数
PQTY2: 50                     -- 箱数
BZFS: 客户编号56123，单卷腰卡+热缩，20卷/展示盒，120卷/箱  -- 包装方式
DKBM: 8432753561231           -- 纸卡编码
WXBM: 8432753561231           -- 水洗标编码
SXBBM: 无                     -- 外箱标编码
XG: 待定                      -- 箱规
```

**关键发现：**
1. ✅ 这7个字段在ERP中**完全存在**
2. ✅ 存储为**独立的结构化字段**（不是文本描述）
3. ✅ 位于**扩展表 TF_POS_Z**（不是主表 TF_POS）
4. ✅ 通过 **(OS_ID, OS_NO, ITM)** 三键与主表关联
5. ✅ 同步订单时需要**同时写入 TF_POS 和 TF_POS_Z 两个表**

**注意：BZ_KND 表的区别：**
- BZ_KND 表（包装类型基础资料表）：以文本形式存储包装规格模板
  ```
  BZ_KND: 020001
  NAME: 客户编号3280227，单个套卡（8435674802278），6个/中包+条码，72个/箱（6917692131537）
  ```
- TF_POS_Z 表（订单明细扩展表）：存储订单实际的包装字段数据
- 两者用途不同：BZ_KND 是包装类型基础资料，TF_POS_Z 是订单实际数据

---

## 结语

本方案提供了从 ERP 获取产品数据并同步到网站,以及将网站订单写入 ERP 的完整解决方案。关键点包括:

1. **产品同步**: 基于 MARK_NO 的增量同步机制
2. **订单写入**: 事务保证的**三表写入** (MF_POS + TF_POS + **TF_POS_Z**)
3. **数据映射**: 客户和业务员的ID映射策略
4. **字段灵活性**: ERP表只有极少数必填字段，给予极大灵活性
5. **包装字段处理**: 7个包装字段直接映射到TF_POS_Z扩展表的结构化字段
6. **错误处理**: 完善的异常处理和重试机制

**重要发现**：
- MF_POS: 97字段中只有2个必填（2%）
- TF_POS: 96字段中只有3个必填（3%）
- **TF_POS_Z**: 20字段中只有3个必填（15%），包含7个包装字段
- CUST: 113字段中只有1个必填（<1%）

**关于7个包装字段的最终结论**：
- ✅ 这7个字段在ERP中**完全存在**
- ✅ 以**独立结构化字段**形式存储在 **TF_POS_Z 扩展表**中
- ✅ 字段映射：PQTY1(装箱数), PQTY2(箱数), BZFS(包装方式), DKBM(纸卡), WXBM(水洗标), SXBBM(外箱), XG(箱规)
- ✅ 通过 (OS_ID, OS_NO, ITM) 与 TF_POS 主表关联

**ERP设计理念**：
- ERP系统对必填字段要求极低，只强制要求主键和关联键
- 使用**主表 + 扩展表**的架构设计，将基础字段和扩展字段分离
- TF_POS 存储订单明细基础信息（品号、数量、金额等）
- TF_POS_Z 存储订单明细扩展信息（包装、自定义参数等）
- 这种设计允许在不修改主表的情况下，灵活扩展业务字段

**同步实现要点**：
1. 写入订单时必须**同时写入两个表**（TF_POS 和 TF_POS_Z）
2. 两个表通过 (OS_ID, OS_NO, ITM) 三个字段保持一致
3. 必须在同一个事务中执行，保证数据一致性
4. TF_POS_Z 的7个包装字段直接映射网站的结构化字段，无需文本拼接

后续可以根据实际业务需求进行调整和优化。

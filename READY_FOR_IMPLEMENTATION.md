# ERP 订单同步 - 明天实施准备清单

> 📅 准备时间: 2025-11-26
> 🎯 实施时间: 明天
> 📋 开发计划: 参考 [ERP_SYNC_DEVELOPMENT_PLAN.md](./ERP_SYNC_DEVELOPMENT_PLAN.md)
> 📖 技术方案: 参考 [ERP_ORDER_SYNC_SOLUTION.md](./ERP_ORDER_SYNC_SOLUTION.md)

---

## ✅ 已完成的准备工作

### 1. Prisma Schema 更新 ✅

**文件**: `code/backend-api/prisma/schema.prisma`

**已添加的内容**:

#### 1.1 Order 表增加 ERP 同步字段 (lines 92-96)
```prisma
// ERP 同步相关字段
erpOrderNo      String?  @map("erp_order_no") // ERP订单号（如 SO202511044）
erpSyncStatus   String?  @map("erp_sync_status") // synced | failed | pending
erpSyncAt       DateTime? @map("erp_sync_at")
erpSyncError    String?  @map("erp_sync_error")
```

#### 1.2 ERP 客户映射表 (lines 510-518)
```prisma
model ErpCustomerMapping {
  id                    String   @id @default(uuid())
  websiteCustomerId     String   @unique @map("website_customer_id")
  erpCustomerNo         String   @map("erp_customer_no") // ERP CUST.CUS_NO
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("erp_customer_mapping")
}
```

#### 1.3 ERP 业务员映射表 (lines 523-531)
```prisma
model ErpSalespersonMapping {
  id                    String   @id @default(uuid())
  websiteSalespersonId  String   @unique @map("website_salesperson_id")
  erpSalespersonNo      String   @map("erp_salesperson_no") // ERP SAL_NO (如 MP0005)
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("erp_salesperson_mapping")
}
```

#### 1.4 OrderItem 表已包含 7 个包装字段 (lines 146-152)
```prisma
packingQuantity       Int?     @map("packing_quantity") // 装箱数
cartonQuantity        Int?     @map("carton_quantity") // 箱数
packagingMethod       String?  @map("packaging_method") // 包装方式
paperCardCode         String?  @map("paper_card_code") // 纸卡编码
washLabelCode         String?  @map("wash_label_code") // 水洗标编码
outerCartonCode       String?  @map("outer_carton_code") // 外箱编码
cartonSpecification   String?  @map("carton_specification") // 箱规
```

✅ **结论**: Schema 已准备就绪，可以直接运行 migration

---

## 📋 明天实施步骤（按优先级）

### 第一步：运行数据库迁移 (10分钟)

```bash
cd code/backend-api
npx prisma migrate dev --name add_erp_sync_fields
npx prisma generate
```

**验证**:
- 检查是否生成了新的 migration 文件
- 检查 SQLite 数据库是否创建了新表和字段
- 运行 `npx prisma studio` 查看表结构

---

### 第二步：配置 ERP 数据库连接 (30分钟)

#### 2.1 创建配置文件

**文件**: `code/backend-api/src/config/erp-database.config.ts`

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const erpDatabaseConfig: TypeOrmModuleOptions = {
  name: 'erp',
  type: 'mssql',
  host: process.env.ERP_DB_HOST || 'MSSQL',
  port: parseInt(process.env.ERP_DB_PORT) || 1433,
  username: process.env.ERP_DB_USER || 'sa',
  password: process.env.ERP_DB_PASSWORD || '1q!',
  database: process.env.ERP_DB_NAME || 'DB_MP01',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  synchronize: false, // 永远不要在 ERP 数据库上开启 synchronize
  logging: process.env.NODE_ENV === 'development',
};
```

#### 2.2 更新 .env 文件

**文件**: `code/backend-api/.env`

```env
# ERP 数据库配置
ERP_DB_HOST=MSSQL
ERP_DB_PORT=1433
ERP_DB_USER=sa
ERP_DB_PASSWORD=1q!
ERP_DB_NAME=DB_MP01

# ERP 同步配置
ERP_SYNC_ENABLED=true
ERP_DEFAULT_WAREHOUSE=W1000
ERP_DEFAULT_SEND_METHOD=1
ERP_TAX_RATE=0.11
```

#### 2.3 配置 AppModule 双数据源

**文件**: `code/backend-api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { erpDatabaseConfig } from './config/erp-database.config';

@Module({
  imports: [
    // 默认数据源（SQLite - 网站数据库）
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    // ERP 数据源（MSSQL）
    TypeOrmModule.forRoot(erpDatabaseConfig),

    // ... 其他模块
  ],
})
export class AppModule {}
```

#### 2.4 测试 ERP 连接

**文件**: `code/backend-api/src/scripts/test-erp-connection.ts`

```typescript
import { DataSource } from 'typeorm';
import { erpDatabaseConfig } from '../config/erp-database.config';

async function testErpConnection() {
  const dataSource = new DataSource(erpDatabaseConfig as any);

  try {
    await dataSource.initialize();
    console.log('✅ ERP 数据库连接成功！');

    // 测试查询
    const result = await dataSource.query(`
      SELECT TOP 1 OS_NO, OS_DD FROM MF_POS WHERE OS_ID = 'SO' ORDER BY RECORD_DD DESC
    `);
    console.log('✅ 最新订单号：', result[0]);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ ERP 数据库连接失败：', error.message);
    process.exit(1);
  }
}

testErpConnection();
```

**运行测试**:
```bash
npx ts-node src/scripts/test-erp-connection.ts
```

---

### 第三步：创建 ERP 模块和核心服务 (2小时)

#### 3.1 创建 ERP 模块

```bash
cd code/backend-api
npx nest g module erp
npx nest g service erp/erp-order-sync
npx nest g controller erp/erp
```

#### 3.2 实现 ErpOrderSyncService

**文件**: `code/backend-api/src/erp/erp-order-sync.service.ts`

**核心方法**:
1. `generateOrderNumber()` - 生成 ERP 订单号 (SO + 年月 + 流水号)
2. `getErpCustomerNo()` - 获取 ERP 客户编号
3. `getErpSalespersonNo()` - 获取 ERP 业务员编号
4. `syncOrderToErp()` - 主同步方法

**关键实现点**:
- 写入 **三个表**: MF_POS, TF_POS, **TF_POS_Z**
- 使用事务确保原子性
- TF_POS_Z 存储 7 个包装字段

**完整代码参考**: [ERP_ORDER_SYNC_SOLUTION.md](./ERP_ORDER_SYNC_SOLUTION.md) lines 469-689

---

### 第四步：集成到订单创建流程 (30分钟)

**文件**: `code/backend-api/src/modules/order/order.service.ts`

```typescript
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
      erpSyncStatus: 'pending', // 初始状态
    });

    // 2. 同步到 ERP
    try {
      const syncResult = await this.erpOrderSyncService.syncOrderToErp(order.id);

      // 更新同步成功状态
      await this.orderRepository.update(order.id, {
        erpOrderNo: syncResult.erpOrderNo,
        erpSyncStatus: 'synced',
        erpSyncAt: new Date(),
      });

      this.logger.log(`✅ Order ${order.id} synced to ERP: ${syncResult.erpOrderNo}`);

    } catch (error) {
      // 同步失败，记录错误但不影响订单创建
      await this.orderRepository.update(order.id, {
        erpSyncStatus: 'failed',
        erpSyncError: error.message,
      });

      this.logger.error(`❌ ERP sync failed for order ${order.id}: ${error.message}`);
    }

    return order;
  }
}
```

---

### 第五步：测试验证 (1小时)

#### 5.1 创建测试订单

```bash
# 通过 API 创建订单
POST /api/orders
{
  "customerId": "test-customer-id",
  "salespersonId": "test-salesperson-id",
  "items": [
    {
      "productSkuId": "test-sku",
      "quantity": 100,
      "price": 10.5,
      // 7个包装字段
      "packingQuantity": 50,
      "cartonQuantity": 10,
      "packagingMethod": "彩盒包装",
      "paperCardCode": "PK001",
      "washLabelCode": "WL002",
      "outerCartonCode": "OC003",
      "cartonSpecification": "60x40x30cm"
    }
  ]
}
```

#### 5.2 验证 ERP 数据

**验证主表**:
```bash
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT * FROM MF_POS WHERE OS_NO = 'SO202511XXX';
GO
EOF
```

**验证明细表**:
```bash
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT * FROM TF_POS WHERE OS_NO = 'SO202511XXX';
GO
EOF
```

**⭐ 验证扩展表（7个包装字段）**:
```bash
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT
  OS_NO, ITM,
  PQTY1 as 装箱数,
  PQTY2 as 箱数,
  BZFS as 包装方式,
  DKBM as 纸卡编码,
  WXBM as 水洗标编码,
  SXBBM as 外箱编码,
  XG as 箱规
FROM TF_POS_Z
WHERE OS_NO = 'SO202511XXX';
GO
EOF
```

---

## 🔑 关键技术点

### 1. 三表写入 (MF_POS + TF_POS + TF_POS_Z)

**必须在同一事务中完成**:
```typescript
const queryRunner = this.erpDataSource.createQueryRunner();
await queryRunner.startTransaction();

try {
  // 1. 写入 MF_POS
  await queryRunner.query(`INSERT INTO MF_POS ...`);

  // 2. 写入 TF_POS
  await queryRunner.query(`INSERT INTO TF_POS ...`);

  // 3. 写入 TF_POS_Z (7个包装字段)
  await queryRunner.query(`INSERT INTO TF_POS_Z ...`);

  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();
  throw error;
}
```

### 2. 7个包装字段映射

| 网站字段 | ERP表 | ERP字段 | 说明 |
|---------|------|---------|------|
| packingQuantity | TF_POS_Z | PQTY1 | 装箱数 |
| cartonQuantity | TF_POS_Z | PQTY2 | 箱数 |
| packagingMethod | TF_POS_Z | BZFS | 包装方式 |
| paperCardCode | TF_POS_Z | DKBM | 纸卡编码 |
| washLabelCode | TF_POS_Z | WXBM | 水洗标编码 |
| outerCartonCode | TF_POS_Z | SXBBM | 外箱编码 |
| cartonSpecification | TF_POS_Z | XG | 箱规 |

### 3. 订单号生成规则

```typescript
// 格式: SO + 年(4位) + 月(2位) + 流水号(3位)
// 示例: SO202511044
async generateOrderNumber(): Promise<string> {
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
```

---

## ⚠️ 注意事项

### 1. 数据库连接
- ERP 数据库 **绝对不能** 开启 `synchronize: true`
- 必须使用命名数据源 `@InjectDataSource('erp')`

### 2. 事务处理
- 三个表的写入必须在同一事务中
- 失败时必须完整回滚，不能产生脏数据

### 3. 错误处理
- ERP 同步失败不应阻塞订单创建
- 记录详细的错误信息到 `erpSyncError` 字段
- 提供手动重试机制

### 4. 客户和业务员映射
- 必须先建立映射关系才能同步订单
- 映射关系缺失时应抛出明确的错误信息

### 5. 测试先行
- 每完成一个阶段，立即进行测试
- 使用 SQL 命令验证 ERP 数据正确性
- 测试事务回滚机制

---

## 📚 参考文档

1. **ERP_SYNC_DEVELOPMENT_PLAN.md** - 完整的7阶段开发计划
2. **ERP_ORDER_SYNC_SOLUTION.md** - 技术方案和完整代码
3. **dbtable.txt** - ERP 数据库表结构参考

---

## ✅ 验收标准

### 功能验收
- [ ] 创建订单后，ERP中可以查询到对应的订单数据
- [ ] MF_POS、TF_POS、TF_POS_Z 三表数据完整且关联正确
- [ ] 7个包装字段正确写入 TF_POS_Z 表
- [ ] 订单号按照 `SO + 年月 + 流水号` 格式生成
- [ ] 同步失败时，订单状态正确标记为 `failed`，且记录错误信息

### 数据验收
```sql
-- 验证三表数据完整性
SELECT
  mf.OS_NO,
  mf.CUS_NO,
  COUNT(tf.ITM) as 明细数量,
  COUNT(tz.ITM) as 扩展数量
FROM MF_POS mf
LEFT JOIN TF_POS tf ON mf.OS_NO = tf.OS_NO AND mf.OS_ID = tf.OS_ID
LEFT JOIN TF_POS_Z tz ON tf.OS_NO = tz.OS_NO AND tf.OS_ID = tz.OS_ID AND tf.ITM = tz.ITM
WHERE mf.OS_NO = 'SO202511XXX'
GROUP BY mf.OS_NO, mf.CUS_NO;

-- 应该满足：明细数量 = 扩展数量
```

---

## 🎯 明天实施时间表

| 时间 | 任务 | 预计时长 |
|------|------|---------|
| 09:00-09:10 | ✅ 运行数据库迁移 | 10分钟 |
| 09:10-09:40 | ✅ 配置 ERP 数据库连接 | 30分钟 |
| 09:40-11:40 | ✅ 实现核心同步服务 | 2小时 |
| 11:40-12:10 | ✅ 集成到订单创建流程 | 30分钟 |
| 14:00-15:00 | ✅ 测试验证 | 1小时 |

**总计**: 约 4 小时

---

## 📝 实施检查清单

- [ ] Schema 已更新（已完成 ✅）
- [ ] Migration 已运行
- [ ] ERP 数据库配置已创建
- [ ] .env 环境变量已配置
- [ ] AppModule 双数据源已配置
- [ ] ERP 连接测试通过
- [ ] ErpOrderSyncService 已实现
- [ ] OrderService 已集成同步调用
- [ ] 创建测试订单成功
- [ ] MF_POS 数据验证通过
- [ ] TF_POS 数据验证通过
- [ ] TF_POS_Z 数据验证通过（7个包装字段）
- [ ] 错误处理测试通过

---

祝明天实施顺利！🚀

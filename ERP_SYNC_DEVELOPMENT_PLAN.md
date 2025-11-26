# ERP 订单同步功能开发计划

> 基于 ERP_ORDER_SYNC_SOLUTION.md 方案的实施计划

---

## 📋 开发概览

**目标**：实现网站订单自动同步到 ERP 系统（SQL Server DB_MP01）

**核心技术栈**：
- NestJS + TypeORM
- 双数据源：SQLite（网站） + MSSQL（ERP）
- 事务管理：确保三表写入的原子性（MF_POS + TF_POS + TF_POS_Z）

**关键发现**：
- ✅ 7个包装字段在 ERP 的 **TF_POS_Z 扩展表**中以独立结构化字段存储
- ✅ 需要同时写入 TF_POS（主表）和 TF_POS_Z（扩展表）

---

## 🎯 第一阶段：数据库准备工作

### 1.1 创建 ERP 映射表

**文件**：`code/backend-api/prisma/schema.prisma`

```prisma
// ERP 客户映射表
model ErpCustomerMapping {
  id                    String   @id @default(uuid())
  websiteCustomerId     String   @unique @map("website_customer_id")
  erpCustomerNo         String   @map("erp_customer_no") // ERP CUST.CUS_NO
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("erp_customer_mapping")
}

// ERP 业务员映射表
model ErpSalespersonMapping {
  id                    String   @id @default(uuid())
  websiteSalespersonId  String   @unique @map("website_salesperson_id")
  erpSalespersonNo      String   @map("erp_salesperson_no") // ERP SAL_NO (如 MP0005)
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  @@map("erp_salesperson_mapping")
}
```

### 1.2 在 Order 表添加 ERP 同步状态字段

```prisma
model Order {
  // ... 现有字段 ...

  // ERP 同步相关字段
  erpOrderNo            String?  @map("erp_order_no") // ERP订单号（如 SO202511044）
  erpSyncStatus         String?  @map("erp_sync_status") // synced | failed | pending
  erpSyncAt             DateTime? @map("erp_sync_at")
  erpSyncError          String?  @map("erp_sync_error")
}
```

### 1.3 确认 OrderItem 表包含 7 个包装字段

```prisma
model OrderItem {
  // ... 现有字段 ...

  // 包装字段（对应 ERP TF_POS_Z 表）
  packingQuantity       Int?     @map("packing_quantity") // 装箱数 → PQTY1
  cartonQuantity        Int?     @map("carton_quantity") // 箱数 → PQTY2
  packagingMethod       String?  @map("packaging_method") // 包装方式 → BZFS
  paperCardCode         String?  @map("paper_card_code") // 纸卡编码 → DKBM
  washLabelCode         String?  @map("wash_label_code") // 水洗标编码 → WXBM
  outerCartonCode       String?  @map("outer_carton_code") // 外箱编码 → SXBBM
  cartonSpecification   String?  @map("carton_specification") // 箱规 → XG
}
```

### 1.4 运行数据库迁移

```bash
cd code/backend-api
npx prisma migrate dev --name add_erp_sync_fields
npx prisma generate
```

---

## 🔌 第二阶段：ERP 数据库连接配置

### 2.1 创建 ERP 数据库配置文件

**文件**：`code/backend-api/src/config/erp-database.config.ts`

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

### 2.2 配置 AppModule 数据源

**文件**：`code/backend-api/src/app.module.ts`

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

### 2.3 添加环境变量

**文件**：`code/backend-api/.env`

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

### 2.4 测试 ERP 数据库连接

**文件**：`code/backend-api/src/scripts/test-erp-connection.ts`

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

运行测试：
```bash
npx ts-node src/scripts/test-erp-connection.ts
```

---

## ⚙️ 第三阶段：核心同步服务开发

### 3.1 创建 ERP 模块

```bash
cd code/backend-api
npx nest g module erp
npx nest g service erp/erp-order-sync
```

### 3.2 实现订单编号生成器

**文件**：`code/backend-api/src/erp/erp-order-sync.service.ts`

```typescript
/**
 * 生成 ERP 订单编号
 * 格式：SO + 年(4位) + 月(2位) + 流水号(3位)
 * 示例：SO202511044
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
```

### 3.3 实现 ERP 编号查询方法

```typescript
/**
 * 获取 ERP 客户编号
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
 * 获取 ERP 业务员编号
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
```

### 3.4-3.7 实现核心同步方法

参考 `ERP_ORDER_SYNC_SOLUTION.md` 文档中的完整代码实现：
- 写入 MF_POS（订单主表）
- 写入 TF_POS（订单明细主表）
- 写入 TF_POS_Z（订单明细扩展表，**包含7个包装字段**）
- 事务处理和错误回滚

**关键点**：
```typescript
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
  erpOrderNo,                    // OS_NO
  itemNumber,                    // ITM
  item.packingQuantity || null,  // PQTY1 - 装箱数
  item.cartonQuantity || null,   // PQTY2 - 箱数
  item.packagingMethod || '',    // BZFS - 包装方式
  item.paperCardCode || '',      // DKBM - 纸卡编码
  item.washLabelCode || '',      // WXBM - 水洗标编码
  item.outerCartonCode || '',    // SXBBM - 外箱标编码
  item.cartonSpecification || '',// XG - 箱规
]);
```

---

## 🔗 第四阶段：集成到订单创建流程

### 4.1-4.4 集成同步调用

**文件**：`code/backend-api/src/modules/order/order.service.ts`

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

## 🧪 第五阶段：测试验证

### 5.1-5.2 单元测试

**文件**：`code/backend-api/src/erp/erp-order-sync.service.spec.ts`

```typescript
describe('ErpOrderSyncService', () => {
  it('should generate correct order number format', async () => {
    const orderNo = await service.generateOrderNumber();
    expect(orderNo).toMatch(/^SO\d{6}\d{3}$/);
    // 例如：SO202511044
  });

  it('should get ERP customer number from mapping', async () => {
    const customerId = 'uuid-123';
    const erpNo = await service.getErpCustomerNo(customerId);
    expect(erpNo).toBeDefined();
  });
});
```

### 5.3 集成测试

```typescript
describe('Order ERP Sync Integration', () => {
  it('should sync order to ERP successfully', async () => {
    // 创建测试订单
    const order = await orderService.createOrder({
      customerId: 'test-customer-id',
      salespersonId: 'test-salesperson-id',
      items: [
        {
          productSkuId: 'test-sku',
          quantity: 100,
          price: 10.5,
          // 7个包装字段
          packingQuantity: 50,
          cartonQuantity: 10,
          packagingMethod: '彩盒包装',
          paperCardCode: 'PK001',
          washLabelCode: 'WL002',
          outerCartonCode: 'OC003',
          cartonSpecification: '60x40x30cm',
        },
      ],
    });

    expect(order.erpSyncStatus).toBe('synced');
    expect(order.erpOrderNo).toMatch(/^SO\d{9}$/);
  });
});
```

### 5.4-5.5 验证 ERP 数据

使用 SQL 命令验证：

```bash
# 验证主表数据
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT * FROM MF_POS WHERE OS_NO = 'SO202511XXX';
GO
EOF

# 验证明细表数据
tsql -S MSSQL -U sa -P '1q!' <<'EOF'
USE DB_MP01;
SELECT * FROM TF_POS WHERE OS_NO = 'SO202511XXX';
GO
EOF

# ⭐ 验证扩展表数据（7个包装字段）
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

### 5.6 测试事务回滚

```typescript
it('should rollback transaction on error', async () => {
  // 模拟写入 TF_POS_Z 失败
  jest.spyOn(queryRunner, 'query')
    .mockRejectedValueOnce(new Error('TF_POS_Z insert failed'));

  await expect(service.syncOrderToErp(orderId)).rejects.toThrow();

  // 验证 MF_POS 和 TF_POS 都没有数据
  const mfPos = await erpDataSource.query(`SELECT * FROM MF_POS WHERE OS_NO = ?`, [orderNo]);
  expect(mfPos).toHaveLength(0);
});
```

---

## 🚀 第六阶段：优化和错误处理

### 6.1 实现并发锁机制（Redis）

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class ErpOrderSyncService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `SO${year}${month}`;
    const lockKey = `erp:order:lock:${prefix}`;

    // 获取分布式锁
    const lock = await this.redis.set(lockKey, '1', 'NX', 'EX', 10);
    if (!lock) {
      throw new Error('Failed to acquire order number lock');
    }

    try {
      // 生成订单号逻辑
      // ...
      return orderNo;
    } finally {
      // 释放锁
      await this.redis.del(lockKey);
    }
  }
}
```

### 6.2 实现手动重试接口

**文件**：`code/backend-api/src/erp/erp.controller.ts`

```typescript
@Controller('erp')
export class ErpController {
  @Post('orders/:orderId/retry-sync')
  async retrySyncOrder(@Param('orderId') orderId: string) {
    return await this.erpOrderSyncService.syncOrderToErp(orderId);
  }

  @Get('orders/sync-failed')
  async getFailedOrders() {
    return await this.orderService.findAll({
      where: { erpSyncStatus: 'failed' },
    });
  }
}
```

### 6.3 添加详细日志

```typescript
async syncOrderToErp(orderId: string) {
  this.logger.log(`[ERP Sync] 开始同步订单: ${orderId}`);

  try {
    this.logger.log(`[ERP Sync] 生成订单号...`);
    const erpOrderNo = await this.generateOrderNumber();
    this.logger.log(`[ERP Sync] 订单号生成成功: ${erpOrderNo}`);

    this.logger.log(`[ERP Sync] 写入 MF_POS...`);
    await queryRunner.query(/* ... */);
    this.logger.log(`[ERP Sync] MF_POS 写入成功`);

    this.logger.log(`[ERP Sync] 写入 TF_POS 和 TF_POS_Z...`);
    for (const item of items) {
      await queryRunner.query(/* TF_POS */);
      await queryRunner.query(/* TF_POS_Z */);
      this.logger.log(`[ERP Sync] 明细 ${item.itemNumber} 写入成功`);
    }

    this.logger.log(`[ERP Sync] 提交事务...`);
    await queryRunner.commitTransaction();
    this.logger.log(`[ERP Sync] 同步完成: ${erpOrderNo}`);

  } catch (error) {
    this.logger.error(`[ERP Sync] 同步失败: ${error.message}`, error.stack);
    throw error;
  }
}
```

### 6.4 实现告警通知（可选）

```typescript
private async notifyError(orderId: string, error: Error) {
  // 发送邮件/钉钉/企业微信通知
  await this.notificationService.send({
    title: 'ERP订单同步失败',
    content: `订单ID: ${orderId}\n错误: ${error.message}`,
    level: 'error',
  });
}
```

---

## 🎨 第七阶段：后台管理界面（可选）

### 7.1 创建同步状态查看页面

**功能**：
- 显示所有订单的 ERP 同步状态
- 筛选：synced / failed / pending
- 显示 erpOrderNo、erpSyncAt、erpSyncError

### 7.2 创建手动重试按钮

**功能**：
- 点击按钮手动触发 ERP 同步重试
- 实时显示同步结果

### 7.3 创建映射管理界面

**功能**：
- 管理客户映射（website_customer_id ↔ erp_customer_no）
- 管理业务员映射（website_salesperson_id ↔ erp_salesperson_no）
- 批量导入映射关系

---

## 📝 关键文件清单

```
code/backend-api/
├── prisma/
│   └── schema.prisma                          # 数据库模型（添加映射表和同步字段）
├── src/
│   ├── config/
│   │   └── erp-database.config.ts             # ERP 数据库配置
│   ├── erp/
│   │   ├── erp.module.ts                      # ERP 模块
│   │   ├── erp.controller.ts                  # ERP 控制器（手动重试接口）
│   │   ├── erp-order-sync.service.ts          # ⭐ 核心同步服务
│   │   └── erp-order-sync.service.spec.ts     # 单元测试
│   ├── modules/
│   │   └── order/
│   │       └── order.service.ts               # 集成 ERP 同步调用
│   ├── scripts/
│   │   └── test-erp-connection.ts             # 连接测试脚本
│   └── app.module.ts                          # 配置双数据源
├── .env                                       # 环境变量（ERP连接信息）
└── package.json                               # 依赖：mssql, @nestjs/typeorm
```

---

## ✅ 验收标准

### 功能验收
- [ ] 创建订单后，ERP中可以查询到对应的订单数据
- [ ] MF_POS、TF_POS、TF_POS_Z 三表数据完整且关联正确
- [ ] 7个包装字段正确写入 TF_POS_Z 表
- [ ] 订单号按照 `SO + 年月 + 流水号` 格式生成
- [ ] 同步失败时，订单状态正确标记为 `failed`，且记录错误信息
- [ ] 手动重试接口可以正常工作

### 数据验收
```sql
-- 验证完整性
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

### 性能验收
- [ ] 单个订单同步时间 < 3秒
- [ ] 并发5个订单同步无订单号冲突
- [ ] 事务失败时完整回滚，无脏数据

---

## 📌 开发注意事项

1. **数据库事务**：必须保证 MF_POS、TF_POS、TF_POS_Z 在同一事务中
2. **字段映射**：严格按照文档中的字段映射关系
3. **错误处理**：ERP 同步失败不应阻塞订单创建
4. **日志记录**：每个关键步骤都要有日志
5. **测试优先**：先写测试用例，再写实现代码

---

## 🔥 明天开发流程建议

### 上午（4小时）
1. ✅ 第一阶段：数据库准备（1小时）
2. ✅ 第二阶段：ERP 数据库连接配置（1小时）
3. ✅ 第三阶段：核心同步服务开发（2小时）

### 下午（4小时）
4. ✅ 第四阶段：集成到订单创建流程（1小时）
5. ✅ 第五阶段：测试验证（2小时）
6. ✅ 第六阶段：优化和错误处理（1小时）

### 备注
- 第七阶段（后台管理界面）可以放在后续迭代
- 遇到问题随时参考 `ERP_ORDER_SYNC_SOLUTION.md` 文档
- 每完成一个阶段，使用 SQL 命令验证 ERP 数据

---

## 📚 参考文档

- `ERP_ORDER_SYNC_SOLUTION.md` - 完整技术方案
- `dbtable.txt` - ERP 数据库表结构
- NestJS TypeORM 双数据源文档
- SQL Server 事务处理文档

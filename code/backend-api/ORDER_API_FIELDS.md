# 销售订单 API 字段文档

## 概述
本文档描述了销售订单系统的完整数据结构，包括所有新增字段。前端开发时请参考此文档。

---

## 📋 订单基本信息 (Order)

### API Endpoint
- **创建订单**: `POST /api/orders`
- **获取订单列表**: `GET /api/orders`
- **获取单个订单**: `GET /api/orders/:id`
- **更新订单**: `PATCH /api/orders/:id`
- **删除订单**: `DELETE /api/orders/:id`
- **导出订单**: `GET /api/orders/:id/export`
- **批量导出**: `POST /api/orders/export-batch`

### 订单字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| orderNumber | string | ✅ | 订单号 |
| customerId | string (UUID) | ✅ | 客户ID |
| salespersonId | string (UUID) | ✅ | 业务员ID |
| customerType | enum | ✅ | 客户类型: `NEW` \| `OLD` |
| orderType | enum | ✅ | 订单类型: `FORMAL` \| `INTENTION` |
| orderDate | string (ISO date) | ✅ | 订单日期 |
| companyName | string | ❌ | 公司名称（如：东阳市铭品日用品有限公司） |
| status | string | ❌ | 订单状态（默认：pending） |
| totalAmount | number | ❌ | 订单总金额（自动计算） |
| items | OrderItem[] | ✅ | 订单明细列表 |
| customParams | CustomParam[] | ❌ | 自定义参数列表 |

---

## 📦 订单明细 (OrderItem)

### 完整字段列表（28个字段）

#### 系统自带字段（A-Q列）

| 字段名 | Excel列 | 类型 | 必填 | 说明 | 示例 |
|--------|---------|------|------|------|------|
| itemNumber | A | number | ❌ | 项次序号 | 1, 2, 3... |
| productSkuId | - | string (UUID) | ✅ | 产品SKU ID | - |
| productCode | B | string | ✅ | 品号（自动从SKU获取） | TB009.B1a.1-16 |
| customerProductCode | C | string | ❌ | 客户料号 | - |
| productImage | D | string | ❌ | 货品图片URL | - |
| productName | E | string | ✅ | 品名（自动从SKU获取） | TB009-四孔雪尼尔拖把 |
| productSpec | F | string | ❌ | 货品规格 | A伸缩铁杆（意标螺纹）φ19/22... |
| additionalAttributes | G | string | ❌ | 附加属性 | - |
| quantity | H | number | ✅ | 数量 | 3000 |
| packagingConversion | I | number | ❌ | 包装换算 | 24 |
| packagingUnit | J | string | ❌ | 包装单位 | 125箱 |
| weightUnit | K | string | ❌ | 重量单位 | - |
| netWeight | L | number | ❌ | 包装净重 | 0 |
| grossWeight | M | number | ❌ | 包装毛重 | 0 |
| packagingType | N | string | ❌ | 包装类型 | - |
| packagingSize | O | string | ❌ | 包装大小 | 0 |
| supplierNote | P | string | ❌ | 厂商备注 | - |
| expectedDeliveryDate | Q | string (ISO date) | ❌ | 预交日 | 2025-09-10 |

#### 销售填写字段（R-AB列）

| 字段名 | Excel列 | 类型 | 必填 | 说明 | 示例 |
|--------|---------|------|------|------|------|
| price | R | number | ✅ | 单价 | 1 |
| untaxedLocalCurrency | S | number | ❌ | 未税本位币 | 3000 |
| packingQuantity | T | number | ❌ | 装箱数 | 24 |
| cartonQuantity | U | number | ❌ | 箱数 | 125 |
| packagingMethod | V | string | ❌ | 包装方式 | 单个卡头 |
| paperCardCode | W | string | ❌ | 纸卡编码 | 3700703984511 |
| washLabelCode | X | string | ❌ | 水洗标编码 | 有水洗标，无编码 |
| outerCartonCode | Y | string | ❌ | 外箱编码 | 23700281004513 |
| cartonSpecification | Z | string | ❌ | 箱规 | 74*44*20cm |
| volume | AA | number | ❌ | 体积 | 0.065 |
| summary | AB | string | ❌ | 摘要 | - |

#### 自动计算字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| subtotal | number | 小计（自动计算：price × quantity） |

---

## 🔧 创建订单 API 示例

### 请求 (POST /api/orders)

```json
{
  "orderNumber": "SO2025-001",
  "customerId": "uuid-customer-id",
  "salespersonId": "uuid-salesperson-id",
  "customerType": "NEW",
  "orderType": "FORMAL",
  "orderDate": "2025-10-31",
  "companyName": "东阳市铭品日用品有限公司",
  "status": "pending",
  "items": [
    {
      "productSkuId": "uuid-product-sku-id",
      "itemNumber": 1,
      "customerProductCode": "CUST-001",
      "productSpec": "A伸缩铁杆（意标螺纹）φ19/22*0.3*120：白色喷塑+638C（蓝色）塑件",
      "additionalAttributes": "蓝色",
      "quantity": 3000,
      "packagingConversion": 24,
      "packagingUnit": "125箱",
      "netWeight": 0,
      "grossWeight": 0,
      "expectedDeliveryDate": "2025-09-10",
      "price": 1,
      "untaxedLocalCurrency": 3000,
      "packingQuantity": 24,
      "cartonQuantity": 125,
      "packagingMethod": "单个卡头",
      "paperCardCode": "3700703984511",
      "washLabelCode": "有水洗标，无编码",
      "outerCartonCode": "23700281004513",
      "cartonSpecification": "74*44*20cm",
      "volume": 0.065
    }
  ],
  "customParams": [
    {
      "paramKey": "备注",
      "paramValue": "紧急订单"
    }
  ]
}
```

### 响应

```json
{
  "id": "uuid-order-id",
  "orderNumber": "SO2025-001",
  "customerId": "uuid-customer-id",
  "salespersonId": "uuid-salesperson-id",
  "customerType": "NEW",
  "orderType": "FORMAL",
  "orderDate": "2025-10-31T00:00:00.000Z",
  "companyName": "东阳市铭品日用品有限公司",
  "status": "pending",
  "totalAmount": 3000,
  "createdAt": "2025-10-31T12:00:00.000Z",
  "updatedAt": "2025-10-31T12:00:00.000Z",
  "customer": { ... },
  "salesperson": { ... },
  "items": [
    {
      "id": "uuid-item-id",
      "orderId": "uuid-order-id",
      "productSkuId": "uuid-product-sku-id",
      "itemNumber": 1,
      "customerProductCode": "CUST-001",
      "productSpec": "...",
      "quantity": 3000,
      "price": 1,
      "subtotal": 3000,
      "packagingConversion": 24,
      "packagingUnit": "125箱",
      "expectedDeliveryDate": "2025-09-10T00:00:00.000Z",
      "untaxedLocalCurrency": 3000,
      "packingQuantity": 24,
      "cartonQuantity": 125,
      "packagingMethod": "单个卡头",
      "paperCardCode": "3700703984511",
      "washLabelCode": "有水洗标，无编码",
      "outerCartonCode": "23700281004513",
      "cartonSpecification": "74*44*20cm",
      "volume": 0.065,
      "createdAt": "2025-10-31T12:00:00.000Z",
      "productSku": {
        "id": "uuid-product-sku-id",
        "productCode": "TB009.B1a.1-16",
        "group": {
          "groupNameZh": "TB009-四孔雪尼尔拖把",
          "groupNameEn": "TB009-Four Hole Chenille Mop"
        }
      }
    }
  ],
  "customParams": [
    {
      "id": "uuid-param-id",
      "orderId": "uuid-order-id",
      "paramKey": "备注",
      "paramValue": "紧急订单"
    }
  ]
}
```

---

## 📤 Excel 导出功能

### 单个订单导出
```
GET /api/orders/:id/export
```

### 批量导出
```
POST /api/orders/export-batch
Body: { "orderIds": ["uuid1", "uuid2", "uuid3"] }
```

### 导出格式
导出的Excel文件完全匹配 `material/sample_table/sale_table.xls` 模板格式：

- **第1行**: 公司名称（合并单元格）
- **第2行**: "销售订单" 标题
- **第5行**: 分类标签（"系统自带" 和 "销售填写"）
- **第6行**: 28列表头
- **第7行起**: 数据行（每个订单明细一行）
- **最后**: 自动合计总额（未税本位币总额和体积总额）

---

## ⚠️ 重要说明

### 1. 必填字段
前端表单中，以下字段为必填：
- **订单基本信息**: orderNumber, customerId, salespersonId, customerType, orderType, orderDate
- **订单明细**: productSkuId, quantity, price

### 2. 自动计算字段
以下字段由后端自动计算，前端无需传递：
- `totalAmount`: 订单总金额
- `subtotal`: 明细小计

### 3. 自动获取字段
以下字段从关联数据自动获取：
- `productCode`: 从 ProductSku 获取
- `productName` (groupNameZh): 从 ProductGroup 获取

### 4. 可选字段策略
所有标记为 ❌ 的字段都是可选的，前端可以：
- 分阶段实现（先实现基础字段，再逐步添加高级字段）
- 根据业务需求选择性实现
- 在表单中使用折叠面板隐藏高级选项

---

## 🎯 前端实现建议

### 基础版（MVP）
只实现以下字段即可完成基本功能：
```typescript
// Order
orderNumber, customerId, salespersonId, customerType,
orderType, orderDate, status

// OrderItem
productSkuId, quantity, price
```

### 完整版
分三个面板实现所有字段：
1. **基础信息面板**: 品号、品名、数量、单价等
2. **包装信息面板**: 包装换算、包装单位、重量、箱规等
3. **其他信息面板**: 纸卡编码、水洗标编码、外箱编码、摘要等

---

## 📝 测试数据

数据库已更新，所有新字段都已添加到 `order_items` 表中。可以直接创建包含完整字段的订单。

---

## 🔗 相关文件

- **Prisma Schema**: `code/backend-api/prisma/schema.prisma`
- **DTO定义**: `code/backend-api/src/modules/order/dto/order.dto.ts`
- **Service实现**: `code/backend-api/src/modules/order/order.service.ts`
- **Controller**: `code/backend-api/src/modules/order/order.controller.ts`
- **Excel模板**: `material/sample_table/sale_table.xls`

---

生成时间: 2025-10-31

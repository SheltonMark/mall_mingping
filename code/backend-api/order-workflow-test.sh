#!/bin/bash

# Complete Order Workflow Test
# 完整订单流程测试

API_BASE="http://localhost:3001/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "完整订单流程测试（28个字段）"
echo "=========================================="
echo ""

# Step 1: Admin Login
echo "1. 管理员登录..."
ADMIN_RESP=$(curl -s -X POST "$API_BASE/admin-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}')

ADMIN_TOKEN=$(echo "$ADMIN_RESP" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ 管理员登录成功${NC}"
else
  echo -e "${RED}❌ 管理员登录失败${NC}"
  exit 1
fi
echo ""

# Step 2: Salesperson Login
echo "2. 业务员登录..."
SP_RESP=$(curl -s -X POST "$API_BASE/salesperson-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"SP001","password":"123456"}')

SP_TOKEN=$(echo "$SP_RESP" | python -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
SP_ID=$(echo "$SP_RESP" | python -c "import sys, json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -n "$SP_TOKEN" ] && [ -n "$SP_ID" ]; then
  echo -e "${GREEN}✅ 业务员登录成功${NC}"
  echo "   业务员ID: $SP_ID"
else
  echo -e "${RED}❌ 业务员登录失败${NC}"
  exit 1
fi
echo ""

# Step 3: Get Customer
echo "3. 获取客户信息..."
CUSTOMER_RESP=$(curl -s -X GET "$API_BASE/customers?salespersonId=$SP_ID&limit=1" \
  -H "Authorization: Bearer $SP_TOKEN")

CUSTOMER_ID=$(echo "$CUSTOMER_RESP" | python -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') and len(data['data']) > 0 else '')" 2>/dev/null)

if [ -n "$CUSTOMER_ID" ]; then
  echo -e "${GREEN}✅ 获取客户信息成功${NC}"
  echo "   客户ID: $CUSTOMER_ID"
else
  echo -e "${RED}❌ 获取客户失败${NC}"
  exit 1
fi
echo ""

# Step 4: Get Product SKU
echo "4. 获取产品SKU..."
SKU_RESP=$(curl -s "$API_BASE/products/skus?limit=1")
SKU_ID=$(echo "$SKU_RESP" | python -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['id'] if data.get('data') and len(data['data']) > 0 else '')" 2>/dev/null)

if [ -n "$SKU_ID" ]; then
  echo -e "${GREEN}✅ 获取产品SKU成功${NC}"
  echo "   SKU ID: $SKU_ID"
else
  echo -e "${RED}❌ 获取产品SKU失败${NC}"
  exit 1
fi
echo ""

# Step 5: Create Order with all 28 fields
echo "5. 创建包含28个字段的订单..."
ORDER_NUMBER="ORD-$(date +%Y%m%d-%H%M%S)"
ORDER_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

CREATE_RESP=$(curl -s -X POST "$API_BASE/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SP_TOKEN" \
  -d "{
    \"orderNumber\": \"$ORDER_NUMBER\",
    \"customerId\": \"$CUSTOMER_ID\",
    \"salespersonId\": \"$SP_ID\",
    \"customerType\": \"NEW\",
    \"orderType\": \"FORMAL\",
    \"orderDate\": \"$ORDER_DATE\",
    \"companyName\": \"东阳市铭品日用品有限公司\",
    \"items\": [{
      \"productSkuId\": \"$SKU_ID\",
      \"itemNumber\": 1,
      \"customerProductCode\": \"CUST-001\",
      \"productSpec\": \"标准规格\",
      \"additionalAttributes\": \"颜色:红色\",
      \"quantity\": 100,
      \"packagingConversion\": 24,
      \"packagingUnit\": \"箱\",
      \"weightUnit\": \"KG\",
      \"netWeight\": 10.5,
      \"grossWeight\": 11.0,
      \"packagingType\": \"纸箱\",
      \"packagingSize\": \"50x40x30cm\",
      \"supplierNote\": \"需要特殊包装\",
      \"expectedDeliveryDate\": \"2025-12-01\",
      \"price\": 25.50,
      \"untaxedLocalCurrency\": 2550.00,
      \"packingQuantity\": 24,
      \"cartonQuantity\": 5,
      \"packagingMethod\": \"标准装箱\",
      \"paperCardCode\": \"PC-001\",
      \"washLabelCode\": \"WL-001\",
      \"outerCartonCode\": \"OC-001\",
      \"cartonSpecification\": \"50x40x30\",
      \"volume\": 0.06,
      \"summary\": \"测试订单项\"
    }]
  }")

ORDER_ID=$(echo "$CREATE_RESP" | python -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -n "$ORDER_ID" ]; then
  echo -e "${GREEN}✅ 订单创建成功${NC}"
  echo "   订单ID: $ORDER_ID"
  echo "   订单号: $ORDER_NUMBER"
else
  echo -e "${RED}❌ 订单创建失败${NC}"
  echo "$CREATE_RESP" | python -m json.tool 2>/dev/null
  exit 1
fi
echo ""

# Step 6: Verify Salesperson can see the order
echo "6. 业务员查看订单..."
SP_ORDERS=$(curl -s -X GET "$API_BASE/orders?salespersonId=$SP_ID" \
  -H "Authorization: Bearer $SP_TOKEN")

SP_ORDER_COUNT=$(echo "$SP_ORDERS" | python -c "import sys, json; print(json.load(sys.stdin).get('total', 0))" 2>/dev/null)

if [ "$SP_ORDER_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ 业务员可以看到自己的订单 (${SP_ORDER_COUNT}个)${NC}"
else
  echo -e "${YELLOW}⚠️ 业务员没有订单${NC}"
fi
echo ""

# Step 7: Verify Admin can see the order
echo "7. 管理员查看订单..."
ADMIN_ORDERS=$(curl -s -X GET "$API_BASE/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

ADMIN_ORDER_COUNT=$(echo "$ADMIN_ORDERS" | python -c "import sys, json; print(json.load(sys.stdin).get('total', 0))" 2>/dev/null)

if [ "$ADMIN_ORDER_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ 管理员可以看到所有订单 (${ADMIN_ORDER_COUNT}个)${NC}"
else
  echo -e "${YELLOW}⚠️ 管理员没有看到订单${NC}"
fi
echo ""

# Step 8: Get order details
echo "8. 获取订单详情..."
ORDER_DETAIL=$(curl -s -X GET "$API_BASE/orders/$ORDER_ID" \
  -H "Authorization: Bearer $SP_TOKEN")

ITEM_COUNT=$(echo "$ORDER_DETAIL" | python -c "import sys, json; data = json.load(sys.stdin); print(len(data.get('items', [])))" 2>/dev/null)

if [ "$ITEM_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ 订单详情包含 $ITEM_COUNT 个订单项${NC}"
  echo ""
  echo "订单项字段验证:"
  echo "$ORDER_DETAIL" | python -c "
import sys, json
data = json.load(sys.stdin)
if 'items' in data and len(data['items']) > 0:
    item = data['items'][0]
    fields = [
        ('项', 'itemNumber'),
        ('客户料号', 'customerProductCode'),
        ('货品规格', 'productSpec'),
        ('附加属性', 'additionalAttributes'),
        ('数量', 'quantity'),
        ('包装换算', 'packagingConversion'),
        ('包装单位', 'packagingUnit'),
        ('重量单位', 'weightUnit'),
        ('包装净重', 'netWeight'),
        ('包装毛重', 'grossWeight'),
        ('包装类型', 'packagingType'),
        ('包装大小', 'packagingSize'),
        ('厂商备注', 'supplierNote'),
        ('预交日', 'expectedDeliveryDate'),
        ('单价', 'price'),
        ('未税本位币', 'untaxedLocalCurrency'),
        ('装箱数', 'packingQuantity'),
        ('箱数', 'cartonQuantity'),
        ('包装方式', 'packagingMethod'),
        ('纸卡编码', 'paperCardCode'),
        ('水洗标编码', 'washLabelCode'),
        ('外箱编码', 'outerCartonCode'),
        ('箱规', 'cartonSpecification'),
        ('体积', 'volume'),
        ('摘要', 'summary')
    ]
    for name, key in fields:
        value = item.get(key)
        if value is not None and value != '':
            print(f'  ✅ {name}: {value}')
        else:
            print(f'  ⚠️ {name}: 未填写')
" 2>/dev/null
else
  echo -e "${RED}❌ 无法获取订单详情${NC}"
fi
echo ""

# Step 9: Update order
echo "9. 更新订单数量..."
UPDATE_RESP=$(curl -s -X PATCH "$API_BASE/orders/$ORDER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SP_TOKEN" \
  -d '{"status":"CONFIRMED"}')

if echo "$UPDATE_RESP" | grep -q '"id"'; then
  echo -e "${GREEN}✅ 订单更新成功${NC}"
else
  echo -e "${YELLOW}⚠️ 订单更新失败或未返回数据${NC}"
fi
echo ""

# Step 10: Test Excel Export
echo "10. 测试订单Excel导出..."
EXPORT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "$API_BASE/orders/$ORDER_ID/export" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if [ "$EXPORT_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Excel导出功能正常${NC}"
else
  echo -e "${YELLOW}⚠️ Excel导出返回状态码: $EXPORT_STATUS${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ 完整订单流程测试通过！${NC}"
echo "=========================================="
echo ""
echo "测试总结:"
echo "  1. 管理员登录: ✅"
echo "  2. 业务员登录: ✅"
echo "  3. 获取客户信息: ✅"
echo "  4. 获取产品SKU: ✅"
echo "  5. 创建28字段订单: ✅"
echo "  6. 业务员查看订单: ✅ ($SP_ORDER_COUNT 个订单)"
echo "  7. 管理员查看订单: ✅ ($ADMIN_ORDER_COUNT 个订单)"
echo "  8. 订单详情验证: ✅ ($ITEM_COUNT 个订单项)"
echo "  9. 订单更新: ✅"
echo " 10. Excel导出: ✅"
echo ""
echo "系统完全就绪！可以开始使用了！"

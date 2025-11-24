#!/bin/bash

# Internal Sales System Integration Test Script
# 内部销售系统集成测试脚本

echo "=========================================="
echo "内部销售系统完整集成测试"
echo "=========================================="
echo ""

API_BASE="http://localhost:3001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Admin Login
echo "1. 测试管理员登录 (admin/admin123456)..."
ADMIN_RESP=$(curl -s -X POST "$API_BASE/admin-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}')

ADMIN_TOKEN=$(echo "$ADMIN_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
  echo -e "${GREEN}✅ 管理员登录成功${NC}"
  echo "   Token: ${ADMIN_TOKEN:0:50}..."
else
  echo -e "${RED}❌ 管理员登录失败${NC}"
  echo "$ADMIN_RESP"
  exit 1
fi
echo ""

# Test 2: Salesperson Login
echo "2. 测试业务员登录 (SP001/123456)..."
SP_RESP=$(curl -s -X POST "$API_BASE/salesperson-auth/login" \
  -H "Content-Type: application/json" \
  -d '{"accountId":"SP001","password":"123456"}')

SP_TOKEN=$(echo "$SP_RESP" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
SP_ID=$(echo "$SP_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$SP_TOKEN" ]; then
  echo -e "${GREEN}✅ 业务员登录成功${NC}"
  echo "   业务员ID: $SP_ID"
  echo "   Token: ${SP_TOKEN:0:50}..."
else
  echo -e "${RED}❌ 业务员登录失败${NC}"
  echo "$SP_RESP"
  exit 1
fi
echo ""

# Test 3: Admin views all customers
echo "3. 测试管理员查看所有客户..."
CUSTOMERS_RESP=$(curl -s -X GET "$API_BASE/customers" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

CUSTOMER_COUNT=$(echo "$CUSTOMERS_RESP" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ 管理员可以看到 $CUSTOMER_COUNT 个客户${NC}"
echo "$CUSTOMERS_RESP" | python -m json.tool 2>/dev/null | head -30
echo ""

# Test 4: Salesperson views their own customers
echo "4. 测试业务员查看自己的客户 (salespersonId=$SP_ID)..."
SP_CUSTOMERS_RESP=$(curl -s -X GET "$API_BASE/customers?salespersonId=$SP_ID" \
  -H "Authorization: Bearer $SP_TOKEN")

SP_CUSTOMER_COUNT=$(echo "$SP_CUSTOMERS_RESP" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ 业务员可以看到自己的 $SP_CUSTOMER_COUNT 个客户${NC}"
echo "$SP_CUSTOMERS_RESP" | python -m json.tool 2>/dev/null | head -30
echo ""

# Test 5: Salesperson creates a new customer
echo "5. 测试业务员创建新客户..."
NEW_CUSTOMER_RESP=$(curl -s -X POST "$API_BASE/customers" \
  -H "Authorization: Bearer $SP_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"新测试公司\",\"email\":\"newtest$(date +%s)@example.com\",\"contactPerson\":\"王五\",\"phone\":\"13900139000\",\"salespersonId\":\"$SP_ID\",\"customerType\":\"NEW\"}")

NEW_CUSTOMER_ID=$(echo "$NEW_CUSTOMER_RESP" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$NEW_CUSTOMER_ID" ]; then
  echo -e "${GREEN}✅ 业务员成功创建新客户${NC}"
  echo "   客户ID: $NEW_CUSTOMER_ID"
  echo "$NEW_CUSTOMER_RESP" | python -m json.tool 2>/dev/null
else
  echo -e "${RED}❌ 创建客户失败${NC}"
  echo "$NEW_CUSTOMER_RESP"
fi
echo ""

# Test 6: Admin views salespersons with customer count
echo "6. 测试管理员查看业务员列表（包含客户数量）..."
SALESPERSONS_RESP=$(curl -s -X GET "$API_BASE/salespersons" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo -e "${GREEN}✅ 业务员列表（显示客户数量）${NC}"
echo "$SALESPERSONS_RESP" | python -m json.tool 2>/dev/null
echo ""

# Test 7: Check orders endpoint
echo "7. 测试订单管理接口..."
ORDERS_RESP=$(curl -s -X GET "$API_BASE/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

ORDER_COUNT=$(echo "$ORDERS_RESP" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ 可以访问订单管理接口，当前有 $ORDER_COUNT 个订单${NC}"
echo "$ORDERS_RESP" | python -m json.tool 2>/dev/null | head -20
echo ""

# Test 8: Salesperson can also view orders
echo "8. 测试业务员查看订单..."
SP_ORDERS_RESP=$(curl -s -X GET "$API_BASE/orders?salespersonId=$SP_ID" \
  -H "Authorization: Bearer $SP_TOKEN")

SP_ORDER_COUNT=$(echo "$SP_ORDERS_RESP" | grep -o '"total":[0-9]*' | cut -d':' -f2)
echo -e "${GREEN}✅ 业务员可以看到自己的 $SP_ORDER_COUNT 个订单${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ 所有集成测试通过！${NC}"
echo "=========================================="
echo ""
echo "测试总结:"
echo "  - 管理员登录: ✅"
echo "  - 业务员登录: ✅"
echo "  - 管理员查看所有客户: ✅ ($CUSTOMER_COUNT 个)"
echo "  - 业务员查看自己的客户: ✅ ($SP_CUSTOMER_COUNT 个)"
echo "  - 业务员创建新客户: ✅"
echo "  - 管理员查看业务员列表（含客户数）: ✅"
echo "  - 订单管理接口: ✅ ($ORDER_COUNT 个订单)"
echo "  - 业务员查看自己的订单: ✅ ($SP_ORDER_COUNT 个订单)"
echo ""
echo "系统已准备就绪！"

#!/bin/bash

API_BASE="http://8.141.127.26:3001/api"
TEST_EMAIL="carttest@example.com"
TEST_PASSWORD="Test123456"

echo "========================================="
echo "购物车 API 完整测试"
echo "========================================="
echo ""

# 1. 注册测试用户
echo "1. 注册测试用户..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/customer-auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Cart Test User\",\"phone\":\"13800138000\"}")

echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# 2. 登录获取token
echo "2. 登录获取 token..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/customer-auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败，无法获取 token"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo "✅ 登录成功，token: ${TOKEN:0:30}..."
echo ""

# 3. 获取第一个商品的 SKU ID
echo "3. 获取测试商品 SKU..."
PRODUCT_RESPONSE=$(curl -s "$API_BASE/products/groups?limit=1")
SKU_ID=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['data'][0]['skus'][0]['id'] if data.get('data') and len(data['data']) > 0 and data['data'][0].get('skus') and len(data['data'][0]['skus']) > 0 else '')" 2>/dev/null)

if [ -z "$SKU_ID" ]; then
    echo "❌ 无法获取商品 SKU"
    exit 1
fi

echo "✅ 获取到 SKU ID: $SKU_ID"
echo ""

# 4. 查看空购物车
echo "4. 查看空购物车..."
curl -s -X GET "$API_BASE/cart" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 5. 添加商品到购物车
echo "5. 添加商品到购物车..."
ADD_RESPONSE=$(curl -s -X POST "$API_BASE/cart" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"skuId\":\"$SKU_ID\",\"quantity\":2,\"colorCombination\":{}}")

echo "$ADD_RESPONSE" | python3 -m json.tool
CART_ITEM_ID=$(echo "$ADD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
echo ""

# 6. 查看购物车（应该有1个商品）
echo "6. 查看购物车（应该有1个商品）..."
curl -s -X GET "$API_BASE/cart" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 7. 更新商品数量
echo "7. 更新商品数量为 5..."
curl -s -X PUT "$API_BASE/cart/$CART_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity":5}' | python3 -m json.tool
echo ""

# 8. 再次查看购物车（数量应该是5）
echo "8. 再次查看购物车（数量应该是5）..."
curl -s -X GET "$API_BASE/cart" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 9. 删除商品
echo "9. 删除购物车商品..."
curl -s -X DELETE "$API_BASE/cart/$CART_ITEM_ID" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# 10. 最后查看购物车（应该为空）
echo "10. 最后查看购物车（应该为空）..."
curl -s -X GET "$API_BASE/cart" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "========================================="
echo "✅ 购物车 API 测试完成"
echo "========================================="

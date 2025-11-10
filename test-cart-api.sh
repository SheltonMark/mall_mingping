#!/bin/bash

echo "=== Shopping Cart API Test Script ==="
echo ""

# Step 1: Register a test user (if not exists)
echo "1. Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/api/customer-auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "carttest@example.com",
    "password": "test123456"
  }')
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# Step 2: Login to get token
echo "2. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/customer-auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "carttest@example.com",
    "password": "test123456"
  }')
echo "$LOGIN_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)
echo "Token: $TOKEN"
echo ""

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get authentication token!"
  exit 1
fi

# Step 3: Get cart (should be empty initially)
echo "3. Getting empty cart..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 4: Add item to cart
echo "4. Adding item to cart..."
ADD_RESPONSE=$(curl -s -X POST http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "skuId": "test-sku-001",
    "productCode": "C04.01.0021",
    "productName": "Test Product",
    "colorScheme": {"color1": "red", "color2": "blue"},
    "quantity": 2,
    "price": 99.99
  }')
echo "$ADD_RESPONSE" | python3 -m json.tool
CART_ITEM_ID=$(echo "$ADD_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
echo "Cart Item ID: $CART_ITEM_ID"
echo ""

# Step 5: Get cart (should have 1 item)
echo "5. Getting cart with 1 item..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 6: Update item quantity
if [ ! -z "$CART_ITEM_ID" ]; then
  echo "6. Updating item quantity to 5..."
  curl -s -X PUT "http://localhost:3001/api/cart/$CART_ITEM_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"quantity": 5}' | python3 -m json.tool
  echo ""
fi

# Step 7: Get cart (should show updated quantity)
echo "7. Getting cart with updated quantity..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 8: Add another item
echo "8. Adding another item..."
curl -s -X POST http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "skuId": "test-sku-002",
    "productCode": "C04.01.0022",
    "productName": "Test Product 2",
    "colorScheme": {"color1": "green"},
    "quantity": 1,
    "price": 149.99
  }' | python3 -m json.tool
echo ""

# Step 9: Get cart (should have 2 items)
echo "9. Getting cart with 2 items..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 10: Delete first item
if [ ! -z "$CART_ITEM_ID" ]; then
  echo "10. Deleting first item..."
  curl -s -X DELETE "http://localhost:3001/api/cart/$CART_ITEM_ID" \
    -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
  echo ""
fi

# Step 11: Get cart (should have 1 item)
echo "11. Getting cart after deletion..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 12: Test sync API
echo "12. Testing sync API..."
curl -s -X POST http://localhost:3001/api/cart/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
    "items": [
      {
        "skuId": "sync-sku-001",
        "productCode": "C04.01.0023",
        "productName": "Synced Product",
        "colorScheme": {"color1": "yellow"},
        "quantity": 3,
        "price": 79.99
      }
    ]
  }' | python3 -m json.tool
echo ""

# Step 13: Get cart (should show synced item)
echo "13. Getting cart after sync..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 14: Clear cart
echo "14. Clearing cart..."
curl -s -X DELETE http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

# Step 15: Get cart (should be empty)
echo "15. Getting empty cart after clear..."
curl -s -X GET http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
echo ""

echo "=== Test Complete ==="

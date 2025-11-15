#!/bin/bash

# Script to apply all frontend fixes

echo "Applying frontend fixes..."

# Fix 1: Update ProductSku interface to include bilingual fields
echo "1. Updating ProductSku interface..."
sed -i 's/productName: string; \/\/ 品名$/productName: string; \/\/ 品名 (中文)\n  productNameEn?: string; \/\/ 品名 (英文)/' code/frontend/src/lib/publicApi.ts
sed -i 's/specification?: string; \/\/ 规格原始文本$/specification?: string; \/\/ 规格原始文本 (中文)\n  specificationEn?: string; \/\/ 规格原始文本 (英文)/' code/frontend/src/lib/publicApi.ts
sed -i 's/optionalAttributes?: any; \/\/ 可选属性配置 (JSON数组)$/optionalAttributes?: any; \/\/ 可选属性配置 (JSON数组, {nameZh, nameEn})/' code/frontend/src/lib/publicApi.ts

# Fix 2: Update CartItem interface
echo "2. Updating CartItem interface..."
FILE="code/frontend/src/context/CartContext.ts"

# Add new fields to CartItem interface after mainImage
sed -i '/mainImage: string$/a\  productName?: string // 品名 (bilingual format)\n  productNameEn?: string // 品名英文\n  specification?: string // 货品规格 (Chinese)\n  specificationEn?: string // 货品规格 (English)\n  optionalAttributes?: any // 附加属性 (array)' "$FILE"

echo "✓ All fixes applied successfully!"
echo ""
echo "Modified files:"
echo "  - code/frontend/src/lib/publicApi.ts"
echo "  - code/frontend/src/context/CartContext.tsx"

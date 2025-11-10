# URGENT DEPLOYMENT - Commit 416bedd

## Issues Fixed

### Issue 1: Cart Thumbnails Not Showing
**Problem:** Cart page, order confirmation, and profile page showed no thumbnails.
**Root Cause:** CartItem schema has no direct relation to ProductSku in Prisma schema.
**Solution:** Modified `cart.service.ts` to manually fetch SKU data including images.

### Issue 2: Quick Add Cart NOT Showing Bilingual Names
**Problem:** When using quick add from product list, part names showed as "布料1" instead of "布料1/Fabric 1"
**Root Cause:** Frontend was trying to access non-existent `colorEn` field and doing unnecessary `partCode` lookups.
**Analysis:**
- Backend already enriches `part` field to bilingual format: "布料1/Fabric 1"
- Colors are already stored in DB as bilingual: "米色/Beige"
**Solution:** Simplified frontend logic to use backend-enriched fields directly.

## Files Changed
1. `code/backend-api/src/modules/cart/cart.service.ts`
2. `code/frontend/src/app/(frontend)/products/page.tsx`

## Deployment Steps

### On Production Server (root@139.224.114.110)

```bash
# 1. Navigate to project directory
cd /www/wwwroot/mall_mingping

# 2. Pull latest code
git pull origin feature/external-site

# 3. Build and restart backend
cd code/backend-api
pnpm install
pnpm run build
pm2 restart backend-api

# 4. Build and restart frontend
cd ../frontend
pnpm install
pnpm run build
pm2 restart frontend

# 5. Verify services are running
pm2 status
pm2 logs backend-api --lines 20
pm2 logs frontend --lines 20
```

### Verification Steps

1. **Test Cart Thumbnails:**
   - Login to frontend
   - Add products to cart
   - Go to cart page - thumbnails should now display
   - Proceed to checkout - thumbnails should show in order confirmation
   - Go to profile page - order history should show thumbnails

2. **Test Quick Add Bilingual Names:**
   - Go to products page
   - Click shopping cart icon on any product card (quick add)
   - Go to cart page
   - Part names should show as: "布料1/Fabric 1"
   - Color names should show as: "米色/Beige"

## Technical Details

### Backend Fix (cart.service.ts)
```typescript
// OLD CODE (Line 10-22) - WRONG
async getCartItems(customerId: string) {
  return this.prisma.cartItem.findMany({
    where: { customerId },
    include: {
      sku: {  // This relation doesn't exist!
        select: { images: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// NEW CODE - CORRECT
async getCartItems(customerId: string) {
  const cartItems = await this.prisma.cartItem.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
  })

  // Manually fetch SKU data for each cart item
  const cartItemsWithSku = await Promise.all(
    cartItems.map(async (item) => {
      const sku = await this.prisma.productSku.findUnique({
        where: { id: item.skuId },
        select: {
          images: true,
          productSpec: true,
          additionalAttributes: true,
        },
      })
      return { ...item, sku }
    })
  )

  return cartItemsWithSku
}
```

### Frontend Fix (products/page.tsx)
```typescript
// OLD CODE (Lines 109-172) - OVER-COMPLICATED
const partInfoMap = new Map<string, Map<string, string>>()
// Building complex maps from productSpec.parts...
// Trying to lookup partCode and colorEn...

const processedColors = firstScheme.colors.map((colorPart: any) => {
  const partBilingualName = partsMap?.get(colorPart.partCode) || colorPart.part
  const colorBilingualName = colorPart.colorEn
    ? `${colorPart.color}/${colorPart.colorEn}`
    : colorPart.color
  // ...
})

// NEW CODE - SIMPLIFIED
// Backend already enriched part and color to bilingual format
const processedColors = firstScheme.colors.map((colorPart: any) => ({
  ...colorPart,
  part: colorPart.part,    // Already "布料1/Fabric 1"
  color: colorPart.color   // Already "米色/Beige"
}))
```

## Commit Information
- **Commit Hash:** 416bedd
- **Branch:** feature/external-site
- **Previous Commit:** fc0d512
- **Pushed to:** https://github.com/SheltonMark/mall_mingping.git

## Rollback Plan
If issues occur, rollback to previous commit:
```bash
cd /www/wwwroot/mall_mingping
git checkout fc0d512
cd code/backend-api && pnpm run build && pm2 restart backend-api
cd ../frontend && pnpm run build && pm2 restart frontend
```

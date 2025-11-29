'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
export interface CartItem {
  skuId: string
  sku: string  // 品号
  groupName: string  // 双语格式: "中文/English"
  productName: string  // 品名 (中文)
  productNameEn?: string  // 品名英文
  specification?: string  // 货品规格 (中文)
  specificationEn?: string  // 货品规格英文
  optionalAttributes?: {
    nameZh: string
    nameEn: string
  } | null  // 选中的附加属性 (双语对象)
  colorCombination: Record<string, any> // 附加属性（可选）
  quantity: number
  price: number
  mainImage: string

  // 订单明细扩展字段
  productCategory?: 'new' | 'old' | 'sample'  // 产品类别
  customerProductCode?: string                 // 客户料号
  untaxedLocalCurrency?: number                // 未税本位币
  expectedDeliveryDate?: string                // 预交日
  packingQuantity?: number                     // 装箱数
  cartonQuantity?: number                      // 箱数
  packagingMethod?: string                     // 包装方式
  paperCardCode?: string                       // 纸卡编码
  washLabelCode?: string                       // 水洗标编码
  outerCartonCode?: string                     // 外箱编码
  cartonSpecification?: string                 // 箱规
  volume?: number                              // 体积
  supplierNote?: string                        // 厂商备注
  summary?: string                             // 摘要
}

// Database cart item with id
interface DBCartItem extends CartItem {
  id?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (skuId: string) => Promise<void>
  updateQuantity: (skuId: string, quantity: number) => Promise<void>
  updateItem: (skuId: string, updates: Partial<CartItem>) => Promise<void>
  clearCart: () => Promise<void>
  removeSelectedItems: () => void
  totalItems: number
  totalPrice: number
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
  loadUserCart: (userId: string, token: string) => Promise<void>
  syncCartOnLogin: (token: string) => Promise<void>
  logoutCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<DBCartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Load cart from localStorage on mount (guest cart)
  useEffect(() => {
    const savedCart = localStorage.getItem('lemopx_cart_guest')
    if (savedCart) {
      try {
        const parsedItems = JSON.parse(savedCart)
        setItems(parsedItems)
        setSelectedItems(parsedItems.map((item: CartItem) => item.skuId))
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Monitor salesperson login and auto-load cart from database
  useEffect(() => {
    const checkSalespersonLogin = async () => {
      const token = localStorage.getItem('salesperson_token')
      if (token && !isAuthenticated) {
        // Salesperson logged in, load cart from database
        await syncCartOnLogin(token)
      }
    }
    if (isLoaded) {
      checkSalespersonLogin()
    }
  }, [isLoaded])

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem('lemopx_cart_guest', JSON.stringify(items))
    }
  }, [items, isLoaded, isAuthenticated])

  // Build request body with all extended fields
  const buildCartItemBody = (item: CartItem) => ({
    skuId: item.skuId,
    productCode: item.sku || '',
    productName: item.groupName || '',
    colorScheme: JSON.stringify(item.colorCombination),
    quantity: item.quantity,
    price: item.price,
    // Extended fields
    productCategory: item.productCategory,
    customerProductCode: item.customerProductCode,
    untaxedLocalCurrency: item.untaxedLocalCurrency,
    expectedDeliveryDate: item.expectedDeliveryDate,
    packingQuantity: item.packingQuantity,
    cartonQuantity: item.cartonQuantity,
    packagingMethod: item.packagingMethod,
    paperCardCode: item.paperCardCode,
    washLabelCode: item.washLabelCode,
    outerCartonCode: item.outerCartonCode,
    cartonSpecification: item.cartonSpecification,
    volume: item.volume,
    supplierNote: item.supplierNote,
    summary: item.summary,
  })

  // Sync cart to database on login
  const syncCartOnLogin = async (token: string) => {
    try {
      setAuthToken(token)
      setIsAuthenticated(true)

      // Get guest cart from localStorage
      const guestCart = localStorage.getItem('lemopx_cart_guest')
      if (guestCart) {
        const guestItems = JSON.parse(guestCart)

        if (guestItems.length > 0) {
          // Sync guest cart to database with all extended fields
          const syncData = guestItems.map((item: CartItem) => buildCartItemBody(item))

          await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ items: syncData }),
          })

          // Clear guest cart
          localStorage.removeItem('lemopx_cart_guest')
        }
      }

      // Load user cart from database
      await loadUserCartFromDB(token)
    } catch (error) {
      console.error('Failed to sync cart:', error)
    }
  }

  // Load user cart from database
  const loadUserCart = async (userId: string, token: string) => {
    setAuthToken(token)
    setIsAuthenticated(true)
    await loadUserCartFromDB(token)
  }

  const loadUserCartFromDB = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const dbItems = await response.json()
        // Convert database cart items to CartItem format
        const cartItems: DBCartItem[] = dbItems.map((item: any) => {
          // Extract mainImage from sku.images
          let mainImage = ''
          if (item.sku && item.sku.images) {
            if (Array.isArray(item.sku.images) && item.sku.images.length > 0) {
              mainImage = item.sku.images[0]
            } else if (typeof item.sku.images === 'string') {
              try {
                const imgs = JSON.parse(item.sku.images)
                if (Array.isArray(imgs) && imgs.length > 0) {
                  mainImage = imgs[0]
                }
              } catch (e) {
                console.error('Failed to parse images:', e)
              }
            }
          }

          // Add API URL prefix if mainImage is relative path
          if (mainImage && !mainImage.startsWith('http')) {
            const baseURL = API_URL.replace('/api', '')
            mainImage = `${baseURL}${mainImage}`
          }

          // Parse optionalAttributes from colorScheme if it contains attribute data
          let optionalAttributes = null
          const colorScheme = typeof item.colorScheme === 'string' ? JSON.parse(item.colorScheme) : item.colorScheme
          if (colorScheme?.attribute) {
            optionalAttributes = colorScheme.attribute
          }

          return {
            id: item.id,
            skuId: item.skuId,
            sku: item.productCode,
            groupName: item.productName,
            productName: item.sku?.productName || '',
            productNameEn: item.sku?.productNameEn || '',
            specification: item.sku?.specification || '',
            specificationEn: item.sku?.specificationEn || '',
            optionalAttributes,
            colorCombination: colorScheme,
            quantity: item.quantity,
            price: parseFloat(item.price),
            mainImage,
            // Extended fields from database
            productCategory: item.productCategory,
            customerProductCode: item.customerProductCode,
            untaxedLocalCurrency: item.untaxedLocalCurrency ? parseFloat(item.untaxedLocalCurrency) : undefined,
            expectedDeliveryDate: item.expectedDeliveryDate,
            packingQuantity: item.packingQuantity,
            cartonQuantity: item.cartonQuantity,
            packagingMethod: item.packagingMethod,
            paperCardCode: item.paperCardCode,
            washLabelCode: item.washLabelCode,
            outerCartonCode: item.outerCartonCode,
            cartonSpecification: item.cartonSpecification,
            volume: item.volume ? parseFloat(item.volume) : undefined,
            supplierNote: item.supplierNote,
            summary: item.summary,
          }
        })
        setItems(cartItems)
        setSelectedItems(cartItems.map(item => item.skuId))
      }
    } catch (error) {
      console.error('Failed to load user cart:', error)
    }
  }

  // Add item to cart
  const addItem = async (newItem: CartItem) => {
    if (isAuthenticated && authToken) {
      // Add to database with all extended fields
      try {
        const response = await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(buildCartItemBody(newItem)),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Add to cart API error:', response.status, errorData)
          throw new Error(errorData.message || `HTTP ${response.status}`)
        }

        // Reload cart from database
        await loadUserCartFromDB(authToken)
      } catch (error) {
        console.error('Failed to add item to cart:', error)
        throw error
      }
    } else {
      // Add to localStorage (guest cart)
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.skuId === newItem.skuId)

        if (existingItem) {
          return prevItems.map((item) =>
            item.skuId === newItem.skuId
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          return [...prevItems, newItem]
        }
      })
    }
  }

  // Remove item from cart
  const removeItem = async (skuId: string) => {
    if (isAuthenticated && authToken) {
      // Find item ID from current items
      const item = items.find(i => i.skuId === skuId)
      if (item?.id) {
        try {
          await fetch(`${API_URL}/cart/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          })

          // Update local state
          setItems(prevItems => prevItems.filter(i => i.skuId !== skuId))
        } catch (error) {
          console.error('Failed to remove item:', error)
          throw error
        }
      }
    } else {
      // Remove from localStorage
      setItems((prevItems) => prevItems.filter((item) => item.skuId !== skuId))
    }
  }

  // Update item quantity
  const updateQuantity = async (skuId: string, quantity: number) => {
    if (isAuthenticated && authToken) {
      const item = items.find(i => i.skuId === skuId)
      if (item?.id) {
        try {
          await fetch(`${API_URL}/cart/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ quantity: Math.max(1, quantity) }),
          })

          // Update local state
          setItems(prevItems =>
            prevItems.map(i =>
              i.skuId === skuId ? { ...i, quantity: Math.max(1, quantity) } : i
            )
          )
        } catch (error) {
          console.error('Failed to update quantity:', error)
          throw error
        }
      }
    } else {
      // Update in localStorage
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.skuId === skuId
            ? { ...item, quantity: Math.max(1, quantity) }
            : item
        )
      )
    }
  }

  // Update item (for editing cart item details)
  const updateItem = async (skuId: string, updates: Partial<CartItem>) => {
    if (isAuthenticated && authToken) {
      // Find item ID from current items
      const item = items.find(i => i.skuId === skuId)
      if (item?.id) {
        try {
          // Build update body with only changed fields
          const updateBody: Record<string, any> = {}

          if (updates.quantity !== undefined) updateBody.quantity = updates.quantity
          if (updates.price !== undefined) updateBody.price = updates.price
          if (updates.productCategory !== undefined) updateBody.productCategory = updates.productCategory
          if (updates.customerProductCode !== undefined) updateBody.customerProductCode = updates.customerProductCode
          if (updates.untaxedLocalCurrency !== undefined) updateBody.untaxedLocalCurrency = updates.untaxedLocalCurrency
          if (updates.expectedDeliveryDate !== undefined) updateBody.expectedDeliveryDate = updates.expectedDeliveryDate
          if (updates.packingQuantity !== undefined) updateBody.packingQuantity = updates.packingQuantity
          if (updates.cartonQuantity !== undefined) updateBody.cartonQuantity = updates.cartonQuantity
          if (updates.packagingMethod !== undefined) updateBody.packagingMethod = updates.packagingMethod
          if (updates.paperCardCode !== undefined) updateBody.paperCardCode = updates.paperCardCode
          if (updates.washLabelCode !== undefined) updateBody.washLabelCode = updates.washLabelCode
          if (updates.outerCartonCode !== undefined) updateBody.outerCartonCode = updates.outerCartonCode
          if (updates.cartonSpecification !== undefined) updateBody.cartonSpecification = updates.cartonSpecification
          if (updates.volume !== undefined) updateBody.volume = updates.volume
          if (updates.supplierNote !== undefined) updateBody.supplierNote = updates.supplierNote
          if (updates.summary !== undefined) updateBody.summary = updates.summary

          await fetch(`${API_URL}/cart/${item.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(updateBody),
          })

          // Update local state
          setItems((prevItems) =>
            prevItems.map((i) =>
              i.skuId === skuId
                ? { ...i, ...updates }
                : i
            )
          )
        } catch (error) {
          console.error('Failed to update cart item:', error)
          throw error
        }
      }
    } else {
      // Update local state only (guest cart)
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.skuId === skuId
            ? { ...item, ...updates }
            : item
        )
      )
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated && authToken) {
      try {
        await fetch(`${API_URL}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        })
      } catch (error) {
        console.error('Failed to clear cart:', error)
      }
    }

    setItems([])
    setSelectedItems([])
  }

  // Logout - clear cart display state and guest cart from localStorage
  // Database cart is preserved for the user and will be reloaded on next login
  const logoutCart = () => {
    // Clear displayed cart items (will reload from DB on next login)
    setItems([])
    setSelectedItems([])
    setIsAuthenticated(false)
    setAuthToken(null)
    // Clear guest cart from localStorage to prevent data leakage between users
    localStorage.removeItem('lemopx_cart_guest')
  }

  // Remove selected items (delete from backend if authenticated)
  const removeSelectedItems = async () => {
    // If user is authenticated, delete from backend database
    if (isAuthenticated && authToken) {
      try {
        // Delete each selected item from backend
        const deletePromises = items
          .filter((item) => selectedItems.includes(item.skuId))
          .map((item) =>
            fetch(`${API_URL}/cart/${item.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${authToken}`,
              },
            })
          )

        await Promise.all(deletePromises)
      } catch (error) {
        console.error('Failed to delete cart items from backend:', error)
      }
    }

    // Update frontend state
    setItems((prevItems) => prevItems.filter((item) => !selectedItems.includes(item.skuId)))
    setSelectedItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateItem,
        clearCart,
        removeSelectedItems,
        totalItems,
        totalPrice,
        selectedItems,
        setSelectedItems,
        loadUserCart,
        syncCartOnLogin,
        logoutCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

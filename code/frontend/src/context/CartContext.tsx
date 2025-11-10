'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (skuId: string) => Promise<void>
  updateQuantity: (skuId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  removeSelectedItems: () => void
  totalItems: number
  totalPrice: number
  selectedItems: string[]
  setSelectedItems: (items: string[]) => void
  loadUserCart: (userId: string, token: string) => Promise<void>
  syncCartOnLogin: (token: string) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
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

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      localStorage.setItem('lemopx_cart_guest', JSON.stringify(items))
    }
  }, [items, isLoaded, isAuthenticated])

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
          // Sync guest cart to database
          const syncData = guestItems.map((item: CartItem) => ({
            skuId: item.skuId,
            productCode: item.productCode || '',
            productName: item.productName || '',
            colorScheme: item.colorScheme,
            quantity: item.quantity,
            price: item.price,
          }))

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
        const cartItems: CartItem[] = dbItems.map((item: any) => ({
          id: item.id,
          skuId: item.skuId,
          productCode: item.productCode,
          productName: item.productName,
          colorScheme: item.colorScheme,
          quantity: item.quantity,
          price: parseFloat(item.price),
          image: '', // Will be populated by cart page if needed
        }))
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
      // Add to database
      try {
        await fetch(`${API_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            skuId: newItem.skuId,
            productCode: newItem.productCode || '',
            productName: newItem.productName || '',
            colorScheme: newItem.colorScheme,
            quantity: newItem.quantity,
            price: newItem.price,
          }),
        })

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
    setIsAuthenticated(false)
    setAuthToken(null)
  }

  // Remove selected items (only for guest cart, used in cart page)
  const removeSelectedItems = () => {
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
        clearCart,
        removeSelectedItems,
        totalItems,
        totalPrice,
        selectedItems,
        setSelectedItems,
        loadUserCart,
        syncCartOnLogin,
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

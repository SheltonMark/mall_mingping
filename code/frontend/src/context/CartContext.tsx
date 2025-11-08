'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (skuId: string) => void
  updateQuantity: (skuId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lemopx_cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('lemopx_cart', JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.skuId === newItem.skuId)

      if (existingItem) {
        // If item already exists, increase quantity
        return prevItems.map((item) =>
          item.skuId === newItem.skuId
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (skuId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.skuId !== skuId))
  }

  const updateQuantity = (skuId: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.skuId === skuId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
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
        totalItems,
        totalPrice,
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

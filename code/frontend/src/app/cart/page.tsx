'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity } = useCart()

  // Mock login state - in real app, this would come from auth context/state management
  const [isLoggedIn, setIsLoggedIn] = useState(true) // TODO: Replace with real auth state
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check login status
    // TODO: Replace with real auth check
    const checkAuth = () => {
      const loggedIn = true // Mock: Replace with real auth check

      if (!loggedIn) {
        alert('请先登录')
        router.push('/') // Redirect to login or home page
      }
      setIsLoggedIn(loggedIn)
      setIsChecking(false)
    }

    checkAuth()
  }, [router])

  const handleCheckout = () => {
    // Navigate to order confirmation page
    router.push('/order-confirmation')
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Show loading or nothing while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10 text-primary" />
            Shopping Cart
          </h1>
          <p className="mt-2 text-gray-600">
            {items.length > 0 ? `${items.length} item${items.length > 1 ? 's' : ''}` : 'Your cart is empty'}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
              <p className="text-gray-600 mb-8">
                Start adding products to your cart!
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
              >
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.skuId}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200"
                         style={{
                           backgroundImage: `url(${item.mainImage})`,
                           backgroundSize: 'cover',
                           backgroundPosition: 'center'
                         }}>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.groupName}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            SKU: <span className="font-mono font-semibold text-primary">{item.sku}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.skuId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Color Combination */}
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Color Combination:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(item.colorCombination).map(([component, color]) => (
                            <div
                              key={component}
                              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span className="text-xs text-gray-700">
                                {component}: {color.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.skuId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Unit Price ${item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Total Items</span>
                    <span className="font-semibold">{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-3xl font-bold text-primary">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="block w-full h-14 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                  Proceed to Confirm
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  href="/products"
                  className="block w-full h-12 mt-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all text-center leading-[2.75rem]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

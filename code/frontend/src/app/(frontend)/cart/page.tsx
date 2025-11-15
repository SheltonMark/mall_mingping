'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/common/ToastContainer'
import { parseBilingualText } from '@/lib/i18nHelper'

export default function CartPage() {
  const router = useRouter()
  const toast = useToast()
  const { items, removeItem, updateQuantity, selectedItems, setSelectedItems } = useCart()
  const { isAuthenticated, isLoading } = useAuth()
  const { t, language } = useLanguage()

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.warning(t('auth.login'))
      router.push('/login?redirect=/order-form')
      return
    }

    // If cart is empty, show warning
    if (items.length === 0) {
      toast.warning(t('cart.empty'))
      return
    }

    // Check if any items are selected
    if (selectedItems.length === 0) {
      toast.warning(t('cart.select_at_least_one'))
      return
    }

    // Redirect to order form page (not checkout, as we don't have payment)
    router.push('/order-form')
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.skuId))
    }
  }

  const toggleItemSelection = (skuId: string) => {
    if (selectedItems.includes(skuId)) {
      setSelectedItems(selectedItems.filter(id => id !== skuId))
    } else {
      setSelectedItems([...selectedItems, skuId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.warning(t('cart.select_items_to_delete'))
      return
    }
    selectedItems.forEach(skuId => removeItem(skuId))
    setSelectedItems([])
  }

  const subtotal = items
    .filter(item => selectedItems.includes(item.skuId))
    .reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0)

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">{t('cart.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pt-36 pb-8">
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Page Header */}
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              {t('cart.title')}
            </h1>
            <p className="mt-3 text-gray-600 ml-15">
              {items.length > 0 ? `${items.length} ${items.length > 1 ? t('cart.items') : t('cart.item')}` : t('cart.empty')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-12 -mt-4">
        {items.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('cart.empty')}</h2>
              <p className="text-gray-600 mb-8">
                {t('cart.empty_desc')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
              >
                {t('cart.browse')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All and Bulk Actions */}
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('cart.select_all')} ({selectedItems.length}/{items.length})
                  </span>
                </div>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('cart.delete_selected')}
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.skuId}
                  className={`bg-white rounded-xl shadow-sm p-6 transition-all ${
                    selectedItems.includes(item.skuId)
                      ? 'ring-2 ring-primary ring-opacity-50'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-6">
                    {/* Checkbox */}
                    <div className="flex items-start pt-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.skuId)}
                        onChange={() => toggleItemSelection(item.skuId)}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                      />
                    </div>

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
                            {parseBilingualText(item.groupName, language)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'zh' ? '产品代码' : 'Product Code'}: <span className="font-mono font-semibold text-primary">{item.sku}</span>
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.skuId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title={t('cart.remove')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Optional Attributes */}
                      {item.colorCombination && Object.keys(item.colorCombination).length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2">
                            {language === 'zh' ? '附加属性' : 'Optional Attributes'}:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.colorCombination).map(([key, value]: [string, any]) => (
                              <div
                                key={key}
                                className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700"
                              >
                                {typeof value === 'string' ? value : JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}


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
                            ￥{((Number(item.price) || 0) * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t('cart.unit_price')} ￥{(Number(item.price) || 0).toFixed(2)}
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
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart.order_summary')}</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.subtotal')}</span>
                    <span className="font-semibold">￥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('cart.selected_items')}</span>
                    <span className="font-semibold">
                      {selectedItems.reduce((sum, skuId) => {
                        const item = items.find(i => i.skuId === skuId)
                        return sum + (item?.quantity || 0)
                      }, 0)} {t('cart.items')}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                      <span className="text-3xl font-bold text-primary">
                        ￥{subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="block w-full h-14 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {t('cart.proceed_to_confirm')}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  href="/products"
                  className="block w-full h-12 mt-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all text-center leading-[2.75rem]"
                >
                  {t('cart.continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

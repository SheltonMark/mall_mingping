'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/common/ToastContainer'
import { parseBilingualText } from '@/lib/i18nHelper'

export default function CartPage() {
  const router = useRouter()
  const toast = useToast()
  const { items, removeItem, updateQuantity, selectedItems, setSelectedItems } = useCart()
  const { isAuthenticated, isLoading } = useSalespersonAuth()
  const { t, language } = useLanguage()

  const handleCheckout = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
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

    // Redirect to order confirmation page
    router.push('/order-confirmation')
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

  const subtotal = 0 // 价格已移除，不再计算

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
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
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
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {parseBilingualText(item.groupName, language)}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {language === 'zh' ? '品号' : 'Product Code'}: <span className="font-mono font-semibold text-primary">{item.sku}</span>
                          </p>
                          {/* 品名 */}
                          {item.productName && (
                            <p className="text-sm text-gray-700 mt-2">
                              <span className="font-semibold">{language === 'zh' ? '品名' : 'Product Name'}:</span>{' '}
                              {language === 'zh' ? item.productName : (item.productNameEn || item.productName)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.skuId)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                          title={t('cart.remove')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* 货品规格 */}
                      {((language === 'zh' && item.specification) || (language === 'en' && item.specificationEn)) && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1 font-semibold">
                            {language === 'zh' ? '货品规格' : 'Specifications'}:
                          </p>
                          <div className="text-sm text-gray-700 whitespace-pre-line">
                            {language === 'zh' ? item.specification : (item.specificationEn || item.specification)}
                          </div>
                        </div>
                      )}

                      {/* 附加属性 */}
                      {item.optionalAttributes && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-2">
                            {language === 'zh' ? '附加属性' : 'Optional Attributes'}:
                          </p>
                          <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-900 inline-block">
                            {language === 'zh' ? item.optionalAttributes.nameZh : (item.optionalAttributes.nameEn || item.optionalAttributes.nameZh)}
                          </div>
                        </div>
                      )}

                      {/* 数量控制 */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{language === 'zh' ? '数量' : 'Quantity'}:</span>
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
                    <span>{language === 'zh' ? '已选商品' : 'Selected Items'}</span>
                    <span className="font-semibold">
                      {selectedItems.reduce((sum, skuId) => {
                        const item = items.find(i => i.skuId === skuId)
                        return sum + (item?.quantity || 0)
                      }, 0)} {t('cart.items')}
                    </span>
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

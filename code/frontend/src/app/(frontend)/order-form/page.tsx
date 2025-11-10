'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { parseBilingualText } from '@/lib/i18nHelper'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

function OrderFormContent() {
  const { customer, isAuthenticated, isLoading } = useAuth()
  const { items: cart, clearCart, selectedItems, removeSelectedItems } = useCart()
  const { t, language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [orderItems, setOrderItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formNumber, setFormNumber] = useState('')
  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  // Load order items from cart or localStorage FIRST, then check authentication
  useEffect(() => {
    const orderType = searchParams.get('type')

    if (orderType === 'buy-now') {
      // 从立即购买来的数据 - 先加载数据，不管是否登录
      const pendingOrder = localStorage.getItem('pendingOrder')
      if (pendingOrder) {
        try {
          const data = JSON.parse(pendingOrder)
          setOrderItems(data.items || [])
          // 不要在这里清除 localStorage - 等登录后再清除
        } catch (e) {
          console.error('Failed to parse pending order:', e)
          setError('订单数据加载失败')
        }
      }
    } else {
      // 从购物车来的数据 - 只显示选中的商品
      if (cart && cart.length > 0 && selectedItems && selectedItems.length > 0) {
        const selected = cart.filter(item => selectedItems.includes(item.skuId))
        setOrderItems(selected)
      }
    }
  }, [searchParams, cart, selectedItems])

  // Check authentication and redirect if needed - BUT wait for auth to finish loading first
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (isLoading) {
      return
    }

    if (!isAuthenticated) {
      // Save the current URL for redirect after login
      sessionStorage.setItem('redirect_after_login', window.location.pathname + window.location.search)
      router.push('/login')
    } else {
      // User is authenticated, now we can safely clear the pending order
      const orderType = searchParams.get('type')
      if (orderType === 'buy-now') {
        // 登录后清除 localStorage
        localStorage.removeItem('pendingOrder')
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Pre-fill form with customer data
  useEffect(() => {
    if (customer) {
      setFormData({
        contactName: customer.contactPerson || customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: '',
      })
    }
  }, [customer])

  // Scroll to top when success screen is shown
  useEffect(() => {
    if (success) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [success])

  // Calculate total
  const totalAmount = orderItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.contactName || !formData.phone || !formData.email || !formData.address) {
      setError(t('order_form.validation_error'))
      return
    }

    if (orderItems.length === 0) {
      setError('订单为空')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('customer_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Prepare items data
      const items = orderItems.map((item) => ({
        product_id: item.skuId,
        product_code: item.sku,
        product_name: item.groupName,
        quantity: item.quantity,
        unit_price: item.price,
        configuration: item.colorCombination || {},
      }))

      const response = await fetch(`${API_URL}/order-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items,
          totalAmount: totalAmount.toFixed(2),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('order_form.submit_error'))
      }

      const result = await response.json()

      // Success!
      setFormNumber(result.formNumber)
      setSuccess(true)

      // 只有从购物车来的才清除已选商品（保留未选中的商品）
      const orderType = searchParams.get('type')
      if (orderType !== 'buy-now') {
        removeSelectedItems()
      }
    } catch (err: any) {
      setError(err.message || t('order_form.submit_error'))
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-36 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('order_form.success_title')}</h2>
            <p className="text-gray-600 mb-2">{t('order_form.success_message')}</p>

            <div className="my-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('order_form.form_number')}</p>
              <p className="text-2xl font-bold text-gray-900">{formNumber}</p>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/account"
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-lg shadow-primary/30"
              >
                {t('order_form.view_inquiries')}
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-lg hover:border-primary hover:text-primary transition"
              >
                {t('order_form.continue_shopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-36 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Brand Color */}
          <div className="bg-gradient-to-r from-primary to-primary-dark p-8 text-white">
            <h1 className="text-3xl font-bold">{t('order_form.title')}</h1>
            <p className="mt-2 text-white/90">{t('order_form.subtitle')}</p>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('order_form.contact_info')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.contact_name')} *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('order_form.contact_name_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('order_form.phone_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('order_form.email_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.address')} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder={t('order_form.address_placeholder')}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('order_form.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder={t('order_form.notes_placeholder')}
                  />
                </div>
              </div>

              {/* Products Summary */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('order_form.products')}</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200">
                        <img
                          src={item.mainImage}
                          alt={item.groupName}
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{parseBilingualText(item.groupName, language)}</p>
                          <p className="text-sm text-gray-600">{item.sku}</p>
                          {item.colorCombination && Object.keys(item.colorCombination).length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1.5">{language === 'zh' ? '配色方案' : 'Color Scheme'}:</p>
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(item.colorCombination).map(([componentCode, colorData]: [string, any]) => {
                                  // 新格式: { schemeName, colors: ColorPart[] }
                                  if (colorData.colors && Array.isArray(colorData.colors)) {
                                    return (
                                      <div
                                        key={componentCode}
                                        className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                                      >
                                        <div className="text-xs font-semibold text-gray-700 mb-1">
                                          [{componentCode}] {colorData.componentName ? parseBilingualText(colorData.componentName, language) : ''}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {colorData.colors.map((colorPart: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-1">
                                              <div
                                                className="w-3 h-3 rounded-full border border-gray-300"
                                                style={{ backgroundColor: colorPart.hexColor }}
                                              />
                                              <span className="text-xs text-gray-600">
                                                {parseBilingualText(colorPart.part, language)}: {parseBilingualText(colorPart.color, language)}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )
                                  }
                                  // 旧格式: { hex, name }
                                  return (
                                    <div
                                      key={componentCode}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                                    >
                                      <div
                                        className="w-4 h-4 rounded-full border border-gray-300"
                                        style={{ backgroundColor: colorData.hex }}
                                      />
                                      <span className="text-xs text-gray-700">
                                        {componentCode}: {colorData.name}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">x{item.quantity}</p>
                          <p className="font-medium text-gray-900">￥{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t('order_form.total_amount')}</span>
                      <span className="text-2xl font-bold text-primary">￥{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Link
                  href="/cart"
                  className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-primary hover:text-primary transition text-center"
                >
                  {t('order_form.back_to_cart')}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 shadow-lg shadow-primary/30"
                >
                  {loading ? t('order_form.submitting') : t('order_form.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// 用 Suspense 包裹导出
export default function OrderFormPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderFormContent />
    </Suspense>
  )
}

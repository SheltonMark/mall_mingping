'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import { User, Mail, Calendar, Package, ChevronRight, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react'
import { parseBilingualText } from '@/lib/i18nHelper'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface OrderForm {
  id: string
  formNumber: string
  contactName: string
  phone: string
  email: string
  address: string
  notes?: string
  items: any[]
  totalAmount: string
  status: string
  submittedAt: string
  createdAt: string
}

export default function ProfilePage() {
  const { customer, isAuthenticated, isLoading } = useAuth()
  const { t, language } = useLanguage()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderForm[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Load orders
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    setLoadingOrders(true)
    try {
      const token = localStorage.getItem('customer_token')
      const response = await fetch(`${API_URL}/order-forms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to load orders:', error)
    } finally {
      setLoadingOrders(false)
    }
  }

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="text-lg text-gray-600">{t('profile.loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated || !customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Page Header - 奢华标题 */}
        <div className="mb-12">
          <h1 className="text-5xl font-light text-black tracking-wide mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            {t('profile.my_account')}
          </h1>
          <div className="w-24 h-[2px] bg-gradient-to-r from-primary to-transparent"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Profile Card - 头像区域 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-none shadow-sm border border-gray-100 p-10 h-full transition-all duration-300 hover:shadow-md flex flex-col">
              {/* Avatar with Gold Border */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center ring-4 ring-primary ring-offset-4">
                    <User className="w-16 h-16 text-primary" strokeWidth={1.5} />
                  </div>
                  {/* Gold Dot Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-primary rounded-full border-4 border-white"></div>
                </div>
              </div>

              {/* Name & Role */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-light text-black mb-1 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  {customer.name || customer.email?.split('@')[0] || 'Customer'}
                </h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest" style={{ fontSize: '11px' }}>
                  {t('profile.valued_customer')}
                </p>
              </div>

              {/* Divider */}
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mb-8"></div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mt-auto">
                <div className="text-center">
                  <div className="text-3xl font-light text-black mb-1">{orders.length}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.orders')}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-light text-black mb-1">
                    {customer.createdAt ? Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{t('profile.days')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Account Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-none shadow-sm border border-gray-100 p-10 h-full transition-all duration-300 hover:shadow-md">
              {/* Section Title */}
              <div className="mb-8">
                <h3 className="text-xl font-light text-black tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {t('profile.account_information')}
                </h3>
                <div className="w-16 h-[1px] bg-primary"></div>
              </div>

              <div className="space-y-8">
                {/* Email */}
                <div className="group">
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-100 transition-all duration-300 group-hover:border-primary">
                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50 transition-colors">
                      <Mail className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 pt-1">
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {t('profile.email_address')}
                      </label>
                      <p className="text-base text-black font-light">{customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                {customer.name && (
                  <div className="group">
                    <div className="flex items-start gap-4 pb-6 border-b border-gray-100 transition-all duration-300 group-hover:border-primary">
                      <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50 transition-colors">
                        <User className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 pt-1">
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                          {t('profile.full_name')}
                        </label>
                        <p className="text-base text-black font-light">{customer.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Date */}
                <div className="group">
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-100 transition-all duration-300 group-hover:border-primary">
                    <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gold-50 transition-colors">
                      <Calendar className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 pt-1">
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {t('profile.member_since')}
                      </label>
                      <p className="text-base text-black font-light">
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: language === 'zh' ? 'numeric' : 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section - 同页面展示 */}
        <div className="bg-white rounded-none shadow-sm border border-gray-100 p-10 transition-all duration-300 hover:shadow-md">
          {/* Section Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-light text-black tracking-wide mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {t('profile.my_orders')}
              </h3>
              <div className="w-16 h-[1px] bg-primary"></div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Package className="w-4 h-4" strokeWidth={1.5} />
              <span className="font-light">{t('profile.total')}: {orders.length}</span>
            </div>
          </div>

          {loadingOrders ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-light">{t('profile.loading_orders')}</p>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State - 奢华空状态设计 */
            <div className="text-center py-20">
              <div className="mb-8 flex justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-neutral-50 to-primary/10 flex items-center justify-center ring-1 ring-primary ring-offset-8">
                  <ShoppingBag className="w-16 h-16 text-primary" strokeWidth={1} />
                </div>
              </div>

              <h4 className="text-2xl font-light text-black mb-3 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                {t('profile.no_orders_yet')}
              </h4>
              <p className="text-gray-500 mb-10 max-w-md mx-auto font-light leading-relaxed">
                {t('profile.no_orders_desc')}
              </p>

              <button
                onClick={() => router.push('/products')}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-light tracking-wider uppercase text-sm transition-all duration-300 hover:bg-primary-dark hover:shadow-lg"
              >
                <span>{t('profile.explore_products')}</span>
                <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-none p-8 transition-all duration-300 hover:border-primary hover:shadow-md">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-6 pb-6 border-b border-gray-100">
                    <div>
                      <h4 className="text-lg font-light text-black mb-2 tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                        {t('profile.order_number')}{order.formNumber}
                      </h4>
                      <p className="text-sm text-gray-500 font-light">
                        {new Date(order.submittedAt).toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: language === 'zh' ? 'numeric' : 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-none border-l-2 border-primary">
                      <span className="text-xs text-primary font-medium uppercase tracking-wider">{t('profile.submitted')}</span>
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
                        <span className="text-sm text-gray-600 font-light">{order.items.length} {order.items.length > 1 ? t('profile.items') : t('profile.item')}</span>
                      </div>
                      <button
                        onClick={() => toggleOrderDetails(order.id)}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
                      >
                        <span className="font-light">{expandedOrders.has(order.id) ? (language === 'zh' ? '隐藏详情' : 'Hide Details') : (language === 'zh' ? '查看详情' : 'View Details')}</span>
                        {expandedOrders.has(order.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Order Items Details - Expandable */}
                  {expandedOrders.has(order.id) && (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <h5 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wider">
                        {language === 'zh' ? '订单详情' : 'Order Details'}
                      </h5>
                      <div className="space-y-4">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                            {/* Product Image */}
                            <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {item.mainImage ? (
                                <img
                                  src={item.mainImage}
                                  alt={item.product_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                              <h6 className="font-medium text-gray-900 mb-1">{parseBilingualText(item.product_name, language)}</h6>
                              <p className="text-sm text-gray-600 mb-2">{item.product_code}</p>

                              {/* 品名 */}
                              {item.productName && (
                                <p className="text-sm text-gray-700 mb-1">
                                  <span className="font-semibold">{language === 'zh' ? '品名' : 'Product Name'}:</span>{' '}
                                  {language === 'zh' ? item.productName : (item.productNameEn || item.productName)}
                                </p>
                              )}

                              {/* 货品规格 */}
                              {((language === 'zh' && item.specification) || (language === 'en' && item.specificationEn)) && (
                                <div className="p-2 bg-white rounded border border-gray-200 mb-2">
                                  <p className="text-xs text-gray-500 font-semibold mb-1">
                                    {language === 'zh' ? '货品规格' : 'Specifications'}:
                                  </p>
                                  <div className="text-sm text-gray-700 whitespace-pre-line">
                                    {language === 'zh' ? item.specification : (item.specificationEn || item.specification)}
                                  </div>
                                </div>
                              )}

                              {/* 附加属性 */}
                              {item.optionalAttributes && (
                                <p className="text-sm text-gray-700 mb-2">
                                  <span className="font-semibold">{language === 'zh' ? '附加属性' : 'Optional Attributes'}:</span>{' '}
                                  {language === 'zh' ? item.optionalAttributes.nameZh : (item.optionalAttributes.nameEn || item.optionalAttributes.nameZh)}
                                </p>
                              )}

                              {/* Configuration Details */}
                              {item.configuration && Object.keys(item.configuration).length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-500 mb-1.5">{language === 'zh' ? '配色方案' : 'Color Scheme'}:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(item.configuration).map(([componentCode, colorData]: [string, any]) => {
                                      // 新格式: { schemeName, colors: ColorPart[] }
                                      if (colorData.colors && Array.isArray(colorData.colors)) {
                                        return (
                                          <div
                                            key={componentCode}
                                            className="px-3 py-1.5 bg-white rounded-lg border border-gray-200"
                                          >
                                            <div className="text-xs font-semibold text-gray-700 mb-1">
                                              [{componentCode}] {colorData.componentName ? parseBilingualText(colorData.componentName, language) : ''}
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                              {colorData.colors.map((colorPart: any, colorIdx: number) => (
                                                <div key={colorIdx} className="flex items-center gap-1">
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
                                          className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200"
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

                            {/* Quantity only - NO PRICE */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm text-gray-600 font-light">x{item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 font-light">{t('profile.contact')}:</span>{' '}
                      <span className="text-black font-light">{order.contactName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 font-light">{t('profile.phone')}:</span>{' '}
                      <span className="text-black font-light">{order.phone}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 font-light">{t('profile.address')}:</span>{' '}
                      <span className="text-black font-light">{order.address}</span>
                    </div>
                    {order.notes && (
                      <div className="md:col-span-2">
                        <span className="text-gray-500 font-light">{t('profile.notes')}:</span>{' '}
                        <span className="text-black font-light">{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Note - 奢华品牌提示 */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-light">
            {t('profile.thank_you')}
          </p>
          <div className="flex justify-center mt-3">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
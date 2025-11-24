'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/common/ToastContainer'
import { Package, User, Calendar, FileText } from 'lucide-react'
import SearchableSelect from '@/components/common/SearchableSelect'
import CustomSelect from '@/components/common/CustomSelect'
import DatePicker from '@/components/common/DatePicker'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email: string
  contactPerson?: string
  phone?: string
  address?: string
  country?: string
  customerType: 'NEW' | 'OLD'
  remarks?: string
}

interface OrderItem {
  skuId: string
  sku: string
  groupName: string
  productName?: string
  specification?: string
  optionalAttributes?: any
  quantity: number
  price?: number  // 改为可选，默认为空
  mainImage?: string
  productCategory?: string
  // 订单明细字段
  customerProductCode?: string  // 客户料号
  packagingConversion?: number
  packagingUnit?: string
  weightUnit?: string
  netWeight?: number  // 包装净重
  grossWeight?: number  // 包装毛重
  packagingType?: string
  packagingSize?: string
  packingQuantity?: number
  cartonQuantity?: number
  packagingMethod?: string
  paperCardCode?: string
  washLabelCode?: string
  outerCartonCode?: string
  cartonSpecification?: string
  volume?: number
  supplierNote?: string  // 厂商备注
  untaxedLocalCurrency?: number  // 未税本位币
  summary?: string
  expectedDeliveryDate?: string  // 预交日
}

export default function OrderConfirmationPage() {
  const router = useRouter()
  const toast = useToast()
  const { salesperson, isAuthenticated, isLoading } = useSalespersonAuth()
  const { items: cartItems, selectedItems, removeSelectedItems } = useCart()

  // 订单基本信息
  const [orderDate, setOrderDate] = useState('')
  const [orderType, setOrderType] = useState<'FORMAL' | 'INTENTION'>('FORMAL')

  // 客户信息
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // 订单明细
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  // 关于我们配置（联系方式）
  const [aboutConfig, setAboutConfig] = useState<any>(null)

  // UI 状态
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 初始化
  useEffect(() => {
    // 检查登录状态
    if (isLoading) return
    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
      return
    }

    // 设置当前日期
    const today = new Date().toISOString().split('T')[0]
    setOrderDate(today)

    // 加载客户列表和订单商品
    loadCustomers()
    loadOrderItems()
    loadAboutConfig()
  }, [isAuthenticated, isLoading])

  // 加载关于我们配置
  const loadAboutConfig = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${API_URL}/system-config/about`)
      if (response.ok) {
        const data = await response.json()
        setAboutConfig(data)
      }
    } catch (error) {
      console.error('Failed to load about config:', error)
    }
  }

  // 加载客户列表
  const loadCustomers = async () => {
    try {
      const token = localStorage.getItem('salesperson_token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

      const response = await fetch(`${API_URL}/customers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || data)
      }
    } catch (err) {
      console.error('加载客户列表失败:', err)
    }
  }

  // 加载订单商品（从购物车或立即购买）
  const loadOrderItems = () => {
    // 先检查是否从立即购买来的
    const pendingOrder = sessionStorage.getItem('pendingOrder')
    if (pendingOrder) {
      try {
        const data = JSON.parse(pendingOrder)
        const items = (data.items || []).map((item: any) => ({
          ...item,
          price: undefined, // 单价默认为空，让业务员自己填写
          productCategory: 'new' // 默认值
        }))
        setOrderItems(items)
        sessionStorage.removeItem('pendingOrder')
        return
      } catch (e) {
        console.error('解析待处理订单失败:', e)
      }
    }

    // 从购物车加载选中的商品
    if (cartItems && cartItems.length > 0 && selectedItems && selectedItems.length > 0) {
      const selected = cartItems.filter(item => selectedItems.includes(item.skuId)).map(item => ({
        ...item,
        price: undefined, // 单价默认为空，让业务员自己填写
        productCategory: 'new' // 默认值
      }))
      setOrderItems(selected)
    }
  }

  // 客户选择变化
  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
  }

  // 更新订单明细字段
  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...orderItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setOrderItems(newItems)
  }

  // 提交订单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomerId) {
      toast.error('请选择客户')
      return
    }

    if (orderItems.length === 0) {
      toast.error('订单明细不能为空')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('salesperson_token')
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

      // 生成订单号
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      const seconds = String(now.getSeconds()).padStart(2, '0')
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const orderNumber = `SO${year}${month}${day}${hours}${minutes}${seconds}-${random}`

      // 准备订单数据
      const orderData = {
        orderNumber,
        customerId: selectedCustomerId,
        salespersonId: salesperson?.id,
        customerType: selectedCustomer?.customerType || 'NEW',
        orderType,
        orderDate: new Date(orderDate).toISOString(),
        items: orderItems.map((item, index) => ({
          productSkuId: item.skuId,
          itemNumber: index + 1,
          productImage: item.mainImage,
          productSpec: item.specification,
          additionalAttributes: item.optionalAttributes ? JSON.stringify(item.optionalAttributes) : null,
          quantity: item.quantity,
          price: item.price || 0,
          customerProductCode: item.customerProductCode,
          packagingConversion: item.packagingConversion,
          packagingUnit: item.packagingUnit,
          weightUnit: item.weightUnit,
          netWeight: item.netWeight,
          grossWeight: item.grossWeight,
          packagingType: item.packagingType,
          packagingSize: item.packagingSize,
          packingQuantity: item.packingQuantity,
          cartonQuantity: item.cartonQuantity,
          packagingMethod: item.packagingMethod,
          paperCardCode: item.paperCardCode,
          washLabelCode: item.washLabelCode,
          outerCartonCode: item.outerCartonCode,
          cartonSpecification: item.cartonSpecification,
          volume: item.volume,
          supplierNote: item.supplierNote,
          untaxedLocalCurrency: item.untaxedLocalCurrency,
          summary: item.summary,
          expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toISOString() : null,
        }))
      }

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '创建订单失败')
      }

      const result = await response.json()

      toast.success('订单创建成功！')

      // 清除购物车中的已选商品
      removeSelectedItems()

      // 跳转到订单详情页
      router.push(`/salesperson/orders/${result.id}`)
    } catch (err: any) {
      toast.error(err.message || '创建订单失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">订单确认</h1>
          <p className="mt-2 text-gray-600">请填写订单详细信息</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 公司信息表头 */}
          <div className="bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl p-8 border border-primary/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                东阳市铭品日用品有限公司
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 业务员信息 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase">业务员信息</h3>
                </div>
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">姓名:</span>
                    <span className="text-sm font-medium text-gray-900">{salesperson?.name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-600">工号:</span>
                    <span className="text-sm font-medium text-gray-900">{salesperson?.accountId || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 联系方式 */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <h3 className="text-sm font-bold text-gray-700 uppercase">联系方式</h3>
                </div>
                <div className="space-y-2 text-gray-700 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-sm">{aboutConfig?.email || 'XXL7702@163.com'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="text-sm">{aboutConfig?.phone || '13806777702'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-sm">{aboutConfig?.addressZh || '浙江省东阳市'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 订单基本信息 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-gray-900">订单信息</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  订单日期 <span className="text-red-500">*</span>
                </label>
                <DatePicker
                  value={orderDate}
                  onChange={setOrderDate}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  订单类型 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setOrderType('FORMAL')}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${
                      orderType === 'FORMAL'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    正式订单
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('INTENTION')}
                    className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all ${
                      orderType === 'INTENTION'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                    }`}
                  >
                    意向订单
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 客户信息 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <User className="text-primary" size={24} />
                <h2 className="text-xl font-bold text-gray-900">客户信息</h2>
              </div>
              <Link
                href="/salesperson/customer/new?returnUrl=/order-confirmation"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
              >
                + 新增客户
              </Link>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择客户 <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={customers.map(c => ({
                  value: c.id,
                  label: `${c.name} (${c.email})`
                }))}
                value={selectedCustomerId}
                onChange={handleCustomerChange}
                placeholder="搜索客户名称或邮箱"
              />
            </div>

            {selectedCustomer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">客户类型</label>
                  <p className="text-gray-900">{selectedCustomer.customerType === 'NEW' ? '新客户' : '老客户'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                  <p className="text-gray-900">{selectedCustomer.contactPerson || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                  <p className="text-gray-900">{selectedCustomer.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                  <p className="text-gray-900">{selectedCustomer.country || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                  <p className="text-gray-900">{selectedCustomer.address || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* 订单明细 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-gray-900">订单明细</h2>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p>暂无商品</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orderItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    {/* 产品基本信息 */}
                    <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200">
                      <img
                        src={item.mainImage || '/images/placeholder.jpg'}
                        alt={item.groupName}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">产品 #{index + 1}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          品号: <span className="font-mono font-semibold text-primary">{item.sku}</span>
                        </p>
                        {/* 品名 */}
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-semibold">品名:</span> {item.groupName || item.productName || '-'}
                        </p>
                      </div>
                    </div>

                    {/* 货品规格 */}
                    {item.specification && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1 font-semibold">货品规格:</p>
                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {item.specification}
                        </div>
                      </div>
                    )}

                    {/* 附加属性 */}
                    {item.optionalAttributes && Object.keys(item.optionalAttributes).length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <h4 className="text-sm font-bold text-gray-900 mb-3">附加属性</h4>
                        <div className="text-sm text-gray-900">
                          {(() => {
                            const attrs = item.optionalAttributes;
                            // 只显示nameZh的值，如果不存在则用nameEn
                            if (attrs.nameZh) {
                              return attrs.nameZh;
                            } else if (attrs.nameEn) {
                              return attrs.nameEn;
                            } else {
                              // 如果都没有，显示所有属性
                              return (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {Object.entries(attrs).map(([key, value]: [string, any]) => (
                                    <div key={key} className="text-sm">
                                      <span className="font-medium text-gray-700">{key}: </span>
                                      <span className="text-gray-900">
                                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* 产品类别 */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">产品类别</label>
                      <CustomSelect
                        options={[
                          { value: 'new', label: '新产品' },
                          { value: 'old', label: '老产品' },
                          { value: 'sample', label: '样品需求' }
                        ]}
                        value={item.productCategory || 'new'}
                        onChange={(value) => updateOrderItem(index, 'productCategory', value)}
                        placeholder="选择产品类别"
                      />
                    </div>

                    {/* 订单明细字段 */}
                    <div className="space-y-6">
                      {/* 基本信息 */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary">基本信息</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">数量 <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">单价 <span className="text-red-500">*</span></label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">客户料号</label>
                            <input
                              type="text"
                              value={item.customerProductCode || ''}
                              onChange={(e) => updateOrderItem(index, 'customerProductCode', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">未税本位币</label>
                            <input
                              type="number"
                              value={item.untaxedLocalCurrency || ''}
                              onChange={(e) => updateOrderItem(index, 'untaxedLocalCurrency', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">预交日</label>
                            <DatePicker
                              value={item.expectedDeliveryDate || ''}
                              onChange={(value) => updateOrderItem(index, 'expectedDeliveryDate', value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* 包装信息 */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary flex items-center gap-2">
                          <span>📦</span>
                          <span>包装信息</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装换算</label>
                            <input
                              type="number"
                              value={item.packagingConversion || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingConversion', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              placeholder="如: 24"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装单位</label>
                            <input
                              type="text"
                              value={item.packagingUnit || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingUnit', e.target.value)}
                              placeholder="如: 箱"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">重量单位</label>
                            <input
                              type="text"
                              value={item.weightUnit || ''}
                              onChange={(e) => updateOrderItem(index, 'weightUnit', e.target.value)}
                              placeholder="如: kg"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装净重</label>
                            <input
                              type="number"
                              value={item.netWeight || ''}
                              onChange={(e) => updateOrderItem(index, 'netWeight', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装毛重</label>
                            <input
                              type="number"
                              value={item.grossWeight || ''}
                              onChange={(e) => updateOrderItem(index, 'grossWeight', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装类型</label>
                            <input
                              type="text"
                              value={item.packagingType || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingType', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装大小</label>
                            <input
                              type="text"
                              value={item.packagingSize || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingSize', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">装箱数</label>
                            <input
                              type="number"
                              value={item.packingQuantity || ''}
                              onChange={(e) => updateOrderItem(index, 'packingQuantity', parseInt(e.target.value) || undefined)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">箱数</label>
                            <input
                              type="number"
                              value={item.cartonQuantity || ''}
                              onChange={(e) => updateOrderItem(index, 'cartonQuantity', parseInt(e.target.value) || undefined)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">包装方式</label>
                            <input
                              type="text"
                              value={item.packagingMethod || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingMethod', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">纸卡编码</label>
                            <input
                              type="text"
                              value={item.paperCardCode || ''}
                              onChange={(e) => updateOrderItem(index, 'paperCardCode', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">水洗标编码</label>
                            <input
                              type="text"
                              value={item.washLabelCode || ''}
                              onChange={(e) => updateOrderItem(index, 'washLabelCode', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">外箱编码</label>
                            <input
                              type="text"
                              value={item.outerCartonCode || ''}
                              onChange={(e) => updateOrderItem(index, 'outerCartonCode', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">箱规</label>
                            <input
                              type="text"
                              value={item.cartonSpecification || ''}
                              onChange={(e) => updateOrderItem(index, 'cartonSpecification', e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">体积</label>
                            <input
                              type="number"
                              value={item.volume || ''}
                              onChange={(e) => updateOrderItem(index, 'volume', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 备注信息 */}
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary flex items-center gap-2">
                          <span>📝</span>
                          <span>备注信息</span>
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">厂商备注</label>
                            <textarea
                              value={item.supplierNote || ''}
                              onChange={(e) => updateOrderItem(index, 'supplierNote', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">摘要</label>
                            <textarea
                              value={item.summary || ''}
                              onChange={(e) => updateOrderItem(index, 'summary', e.target.value)}
                              rows={3}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 小计 - 右下角 */}
                    <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                      <span className="text-primary text-xl font-bold">
                        小计: ¥{(item.quantity * (item.price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 总计金额 - 在提交按钮上方右侧 */}
          <div className="flex justify-end mb-4">
            <div className="bg-primary/10 border-2 border-primary rounded-lg px-6 py-3">
              <span className="text-primary text-2xl font-bold">
                总计: ¥{orderItems.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Link
              href="/cart"
              className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:border-primary hover:text-primary transition text-center"
            >
              返回购物车
            </Link>
            <button
              type="submit"
              disabled={submitting || !selectedCustomerId || orderItems.length === 0}
              className="flex-1 py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {submitting ? '提交中...' : '确认订单'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

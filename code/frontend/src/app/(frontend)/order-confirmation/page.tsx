'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { productApi, orderApi, customerApi, salespersonApi, type OrderItem, type Customer, type ProductSku } from '@/lib/publicApi'
import { useToast } from '@/components/common/ToastContainer'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const toast = useToast()
  const { t } = useLanguage()

  // Form state
  const [orderDate, setOrderDate] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [customerType, setCustomerType] = useState<'NEW' | 'OLD'>('NEW')
  const [orderType, setOrderType] = useState<'FORMAL' | 'INTENTION'>('FORMAL')
  const [productCategory, setProductCategory] = useState('new')

  // Customer state
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [contactPerson, setContactPerson] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerRemarks, setCustomerRemarks] = useState('')

  // Order items state
  const [orderItems, setOrderItems] = useState<OrderItem[]>([
    {
      productSkuId: '',
      quantity: 1,
      price: 0,
      itemNumber: 1,
    }
  ])

  // Product SKU list for selection
  const [productSkus, setProductSkus] = useState<ProductSku[]>([])
  const [salespersonId, setSalespersonId] = useState('')

  // UI state
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0]))
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Set current date as default
    const today = new Date().toISOString().split('T')[0]
    setOrderDate(today)

    // Generate order number
    generateOrderNumber()

    // Load product SKUs and salesperson
    loadInitialData()

    // Load order items from localStorage (from cart or buy now)
    loadOrderItemsFromStorage()
  }, [])

  const generateOrderNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setOrderNumber(`SO${year}${month}${day}-${random}`)
  }

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Load product SKUs
      const groupsResponse = await productApi.getGroups({ limit: 100 })
      const skus: ProductSku[] = []
      groupsResponse.data.forEach(group => {
        if (group.skus && group.skus.length > 0) {
          group.skus.forEach(sku => {
            skus.push({
              ...sku,
              group: {
                id: group.id,
                groupNameZh: group.groupNameZh,
                groupNameEn: group.groupNameEn,
                prefix: group.prefix || '',
                isPublished: group.isPublished ?? true,
                displayOrder: group.displayOrder ?? 0,
                skus: []
              }
            })
          })
        }
      })
      setProductSkus(skus)

      // Load salesperson (use the first available salesperson or the existing one)
      const salespeopleResponse = await salespersonApi.getSalespeople()
      if (salespeopleResponse && salespeopleResponse.length > 0) {
        setSalespersonId(salespeopleResponse[0].id)
      }
    } catch (err) {
      console.error('Failed to load initial data:', err)
      setError('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const loadOrderItemsFromStorage = () => {
    try {
      const storedItems = localStorage.getItem('orderItems')
      if (storedItems) {
        const items = JSON.parse(storedItems)

        // Convert cart items to order items format
        const convertedItems: OrderItem[] = items.map((item: any, index: number) => ({
          productSkuId: item.skuId || '',
          productCode: item.sku || '',
          productName: item.productName || '',
          customerProductCode: item.sku || '',
          quantity: item.quantity || 1,
          price: item.unitPrice || 0,
          subtotal: item.totalPrice || 0,
          itemNumber: index + 1,
        }))

        if (convertedItems.length > 0) {
          setOrderItems(convertedItems)
          // Expand all items by default
          setExpandedItems(new Set(convertedItems.map((_, i) => i)))
        }

        // Clear localStorage after loading
        localStorage.removeItem('orderItems')
      }
    } catch (err) {
      console.error('Failed to load order items from storage:', err)
    }
  }

  const handleCustomerSearch = async (searchTerm: string) => {
    setCustomerSearch(searchTerm)
    if (searchTerm.length < 2) {
      setSelectedCustomer(null)
      return
    }

    try {
      const customers = await customerApi.searchCustomers(searchTerm)
      if (customers.length > 0) {
        const customer = customers[0]
        setSelectedCustomer(customer)
        setCustomerName(customer.name)
        setContactPerson(customer.contactPerson || '')
        setCustomerEmail(customer.email || '')
        setCustomerPhone(customer.phone || '')
        setCustomerAddress(customer.address || '')
      }
    } catch (err) {
      console.error('Failed to search customers:', err)
    }
  }

  const addOrderItem = () => {
    const newItem: OrderItem = {
      productSkuId: '',
      quantity: 1,
      price: 0,
      itemNumber: orderItems.length + 1,
    }
    setOrderItems([...orderItems, newItem])
    setExpandedItems(new Set([...expandedItems, orderItems.length]))
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length === 1) {
      toast.warning('至少需要保留一个订单明细')
      return
    }
    const newItems = orderItems.filter((_, i) => i !== index)
    // Renumber items
    newItems.forEach((item, i) => {
      item.itemNumber = i + 1
    })
    setOrderItems(newItems)
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...orderItems]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-calculate subtotal
    if (field === 'quantity' || field === 'price') {
      const item = newItems[index]
      item.subtotal = (item.quantity || 0) * (item.price || 0)
    }

    // If product SKU changed, auto-fill product info
    if (field === 'productSkuId' && value) {
      const sku = productSkus.find(s => s.id === value)
      if (sku) {
        newItems[index].productCode = sku.productCode
        newItems[index].productName = sku.group?.groupNameZh || ''
        newItems[index].price = sku.price
        newItems[index].subtotal = (newItems[index].quantity || 0) * sku.price
      }
    }

    setOrderItems(newItems)
  }

  const toggleItemExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedItems(newExpanded)
  }

  const calculateTotalAmount = () => {
    return orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  }

  const validateForm = () => {
    // Check required fields
    if (!orderNumber || !orderDate || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      setError(t('order_confirm.validation_error'))
      return false
    }

    // Check at least one order item with valid data
    if (orderItems.length === 0) {
      setError('至少需要一个订单明细')
      return false
    }

    for (const item of orderItems) {
      if (!item.productSkuId || item.quantity <= 0 || item.price <= 0) {
        setError('订单明细中的产品、数量和单价必须填写且有效')
        return false
      }
    }

    return true
  }

  const handleConfirmOrder = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    setError('')

    try {
      // Create customer if new
      let customerId = selectedCustomer?.id

      if (!customerId) {
        const newCustomer = await customerApi.createCustomer({
          name: customerName,
          type: customerType === 'NEW' ? 'new' : 'old',
          contactPerson,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress,
        })
        customerId = newCustomer.id
      }

      // Create order
      const orderData = {
        orderNumber,
        customerId,
        salespersonId,
        customerType,
        orderType,
        orderDate,
        companyName: '东阳市铭品日用品有限公司',
        items: orderItems,
        customParams: customerRemarks ? [
          { paramKey: '备注', paramValue: customerRemarks }
        ] : [],
      }

      const order = await orderApi.createOrder(orderData)

      setSuccess(true)

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/order-view')
      }, 3000)

    } catch (err: any) {
      console.error('Failed to create order:', err)
      setError(err.message || t('order_confirm.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('order_confirm.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-8">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Page Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-8">{t('order_confirm.title')}</h1>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-green-100 border-2 border-green-500 rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-xl font-bold text-green-800">{t('order_confirm.success')}</div>
                <div className="text-green-700">{t('order_confirm.redirecting')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-100 border-2 border-red-500 rounded-2xl">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xl font-bold text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Company Info */}
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl mb-12 border border-primary/10">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {t('order_confirm.company_name')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <h3 className="text-sm font-bold text-gray-700 uppercase">{t('order_confirm.contact_info')}</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <span className="text-sm">XXL7702@163.com</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    <span className="text-sm">13806777702</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-sm">{t('order_confirm.address_china')}</span>
                  </div>
                </div>
              </div>

              {/* Company Logo */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    铭
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t('order_confirm.company_name').split(' ')[0]}
                  </p>
                </div>
              </div>

              {/* Salesperson */}
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  <h3 className="text-sm font-bold text-gray-700 uppercase">{t('order_confirm.salesperson')}</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase">{t('order_confirm.account')}</span>
                    <span className="text-sm font-semibold">3579</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase">{t('order_confirm.name')}</span>
                    <span className="text-sm font-semibold">{t('order_confirm.name_qianqian')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Number */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.order_number')}</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={t('order_confirm.order_number_placeholder')}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                required
              />
              <button
                onClick={generateOrderNumber}
                className="px-6 py-3 bg-gray-100 border-2 border-gray-200 rounded-lg hover:bg-gray-200 transition-all font-semibold"
              >
                {t('order_confirm.generate_order_number')}
              </button>
            </div>
          </div>

          {/* Order Classification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.order_classification')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">{t('order_confirm.customer_type')}</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="customerType"
                      value="NEW"
                      checked={customerType === 'NEW'}
                      onChange={(e) => setCustomerType('NEW')}
                      className="peer sr-only"
                    />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.new_customer')}
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="customerType"
                      value="OLD"
                      checked={customerType === 'OLD'}
                      onChange={(e) => setCustomerType('OLD')}
                      className="peer sr-only"
                    />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.old_customer')}
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">{t('order_confirm.order_type')}</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="orderType"
                      value="FORMAL"
                      checked={orderType === 'FORMAL'}
                      onChange={(e) => setOrderType('FORMAL')}
                      className="peer sr-only"
                    />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.formal_order')}
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="orderType"
                      value="INTENTION"
                      checked={orderType === 'INTENTION'}
                      onChange={(e) => setOrderType('INTENTION')}
                      className="peer sr-only"
                    />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.intention_order')}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Category */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.product_category')}</h2>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" name="productCategory" value="new" checked={productCategory === 'new'} onChange={(e) => setProductCategory(e.target.value)} className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  {t('order_confirm.new_product')}
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="old" checked={productCategory === 'old'} onChange={(e) => setProductCategory(e.target.value)} className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  {t('order_confirm.old_product')}
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="sample" checked={productCategory === 'sample'} onChange={(e) => setProductCategory(e.target.value)} className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  {t('order_confirm.sample_request')}
                </div>
              </label>
            </div>
          </div>

          {/* Order Date */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.order_date')}</h2>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary max-w-xs"
              required
            />
          </div>

          {/* Customer Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.customer_information')}</h2>
            <div className="mb-4">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                placeholder={t('order_confirm.search_customer')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-2">
                {t('order_confirm.cant_find_customer')} <button onClick={() => router.push('/customer-profile')} className="text-primary hover:underline font-semibold">{t('order_confirm.create_new_customer')}</button>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.customer_company_name')}</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t('order_confirm.enter_company_name')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.contact_person')}</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder={t('order_confirm.enter_contact_name')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.email')}</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t('order_confirm.email_placeholder')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.phone')}</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t('order_confirm.phone_placeholder')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.address')}</label>
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={t('order_confirm.enter_full_address')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.remarks_summary')}</label>
                <textarea
                  value={customerRemarks}
                  onChange={(e) => setCustomerRemarks(e.target.value)}
                  placeholder={t('order_confirm.remarks_placeholder')}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Order Details - 28 Fields */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">{t('order_confirm.order_details')}</h2>
              <button
                onClick={addOrderItem}
                className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all"
              >
                + {t('order_confirm.add_product')}
              </button>
            </div>

            {/* Order Items */}
            <div className="space-y-6">
              {orderItems.map((item, index) => (
                <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden">
                  {/* Item Header */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-primary">#{item.itemNumber}</span>
                      <button
                        onClick={() => toggleItemExpanded(index)}
                        className="text-sm text-gray-600 hover:text-primary font-semibold"
                      >
                        {expandedItems.has(index) ? t('order_confirm.collapse') : t('order_confirm.expand')}
                      </button>
                      {item.productName && (
                        <span className="text-sm font-semibold text-gray-700">{item.productName}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {item.subtotal !== undefined && (
                        <span className="text-lg font-bold text-primary">¥{item.subtotal.toFixed(2)}</span>
                      )}
                      <button
                        onClick={() => removeOrderItem(index)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition-all"
                      >
                        {t('order_confirm.remove_item')}
                      </button>
                    </div>
                  </div>

                  {/* Item Details */}
                  {expandedItems.has(index) && (
                    <div className="p-6 space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-700">{t('order_confirm.basic_info')}</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.select_product')} *</label>
                            <select
                              value={item.productSkuId}
                              onChange={(e) => updateOrderItem(index, 'productSkuId', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              required
                            >
                              <option value="">{t('order_confirm.select_product')}</option>
                              {productSkus.map(sku => (
                                <option key={sku.id} value={sku.id}>
                                  {sku.productCode} - {sku.group?.groupNameZh}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.customer_product_code')}</label>
                            <input
                              type="text"
                              value={item.customerProductCode || ''}
                              onChange={(e) => updateOrderItem(index, 'customerProductCode', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.quantity')} *</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateOrderItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              min="1"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.unit_price')} *</label>
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateOrderItem(index, 'price', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                              required
                            />
                          </div>

                          <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.product_spec')}</label>
                            <textarea
                              value={item.productSpec || ''}
                              onChange={(e) => updateOrderItem(index, 'productSpec', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.additional_attributes')}</label>
                            <input
                              type="text"
                              value={item.additionalAttributes || ''}
                              onChange={(e) => updateOrderItem(index, 'additionalAttributes', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.expected_delivery_date')}</label>
                            <input
                              type="date"
                              value={item.expectedDeliveryDate || ''}
                              onChange={(e) => updateOrderItem(index, 'expectedDeliveryDate', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.untaxed_local_currency')}</label>
                            <input
                              type="number"
                              value={item.untaxedLocalCurrency || ''}
                              onChange={(e) => updateOrderItem(index, 'untaxedLocalCurrency', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Packaging Info */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-700">{t('order_confirm.packaging_info')}</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packaging_conversion')}</label>
                            <input
                              type="number"
                              value={item.packagingConversion || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingConversion', parseFloat(e.target.value) || undefined)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packaging_unit')}</label>
                            <input
                              type="text"
                              value={item.packagingUnit || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingUnit', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packing_quantity')}</label>
                            <input
                              type="number"
                              value={item.packingQuantity || ''}
                              onChange={(e) => updateOrderItem(index, 'packingQuantity', parseFloat(e.target.value) || undefined)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.carton_quantity')}</label>
                            <input
                              type="number"
                              value={item.cartonQuantity || ''}
                              onChange={(e) => updateOrderItem(index, 'cartonQuantity', parseFloat(e.target.value) || undefined)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.weight_unit')}</label>
                            <input
                              type="text"
                              value={item.weightUnit || ''}
                              onChange={(e) => updateOrderItem(index, 'weightUnit', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.net_weight')}</label>
                            <input
                              type="number"
                              value={item.netWeight || ''}
                              onChange={(e) => updateOrderItem(index, 'netWeight', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.gross_weight')}</label>
                            <input
                              type="number"
                              value={item.grossWeight || ''}
                              onChange={(e) => updateOrderItem(index, 'grossWeight', parseFloat(e.target.value) || undefined)}
                              step="0.01"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packaging_type')}</label>
                            <input
                              type="text"
                              value={item.packagingType || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingType', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packaging_size')}</label>
                            <input
                              type="text"
                              value={item.packagingSize || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingSize', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.packaging_method')}</label>
                            <input
                              type="text"
                              value={item.packagingMethod || ''}
                              onChange={(e) => updateOrderItem(index, 'packagingMethod', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.carton_specification')}</label>
                            <input
                              type="text"
                              value={item.cartonSpecification || ''}
                              onChange={(e) => updateOrderItem(index, 'cartonSpecification', e.target.value)}
                              placeholder="e.g., 74*44*20cm"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.volume')}</label>
                            <input
                              type="number"
                              value={item.volume || ''}
                              onChange={(e) => updateOrderItem(index, 'volume', parseFloat(e.target.value) || undefined)}
                              step="0.001"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Other Info */}
                      <div>
                        <h3 className="text-lg font-bold mb-4 text-gray-700">{t('order_confirm.other_info')}</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.paper_card_code')}</label>
                            <input
                              type="text"
                              value={item.paperCardCode || ''}
                              onChange={(e) => updateOrderItem(index, 'paperCardCode', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.wash_label_code')}</label>
                            <input
                              type="text"
                              value={item.washLabelCode || ''}
                              onChange={(e) => updateOrderItem(index, 'washLabelCode', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.outer_box_code')}</label>
                            <input
                              type="text"
                              value={item.outerCartonCode || ''}
                              onChange={(e) => updateOrderItem(index, 'outerCartonCode', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.supplier_note')}</label>
                            <input
                              type="text"
                              value={item.supplierNote || ''}
                              onChange={(e) => updateOrderItem(index, 'supplierNote', e.target.value)}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-500 mb-2">{t('order_confirm.summary')}</label>
                            <textarea
                              value={item.summary || ''}
                              onChange={(e) => updateOrderItem(index, 'summary', e.target.value)}
                              rows={2}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                  <span className="text-2xl font-bold">{t('order_confirm.total_amount')}</span>
                  <span className="text-3xl font-bold text-primary">¥{calculateTotalAmount().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="px-12 py-4 border-2 border-gray-300 rounded-full font-semibold hover:border-primary hover:bg-primary/5 transition-all"
              disabled={submitting}
            >
              {t('order_confirm.cancel')}
            </button>
            <button
              onClick={handleConfirmOrder}
              className="px-12 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? t('order_confirm.submitting') : t('order_confirm.confirm_order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { orderApi, customerApi, authApi } from '@/lib/salespersonApi'
import { useToast } from '@/components/common/ToastContainer'
import { User, Package, Users, Eye, Edit2, Save, X, Clock, CheckCircle, XCircle, AlertCircle, Check, RefreshCw, Lock, History, ChevronDown, ChevronUp } from 'lucide-react'

// 订单状态类型
type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SYNCED' | 'SYNC_FAILED'

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

interface EditingCustomer {
  id: string
  name: string
  email: string
  contactPerson: string
  phone: string
  address: string
  country: string
  customerType: 'NEW' | 'OLD'
  remarks: string
}

interface OrderItem {
  id: string
  itemNumber: number
  productSkuId?: string
  productImage?: string
  productSpec?: string
  customerProductCode?: string
  additionalAttributes?: any
  quantity: number
  price: number
  subtotal: number
  untaxedLocalCurrency?: number
  expectedDeliveryDate?: string
  // 包装信息
  packagingConversion?: string
  packagingUnit?: string
  weightUnit?: string
  netWeight?: number
  grossWeight?: number
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
  supplierNote?: string
  summary?: string
  productSku?: {
    id: string
    productCode: string
    productName?: string
    productNameEn?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  orderType: 'FORMAL' | 'INTENTION'
  status: OrderStatus
  rejectReason?: string
  erpOrderNo?: string
  totalAmount: number
  customer: {
    name: string
  }
  items: OrderItem[]
}

// 订单状态配置
const orderStatusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: '待审核', color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock },
  APPROVED: { label: '已审核', color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Check },
  REJECTED: { label: '已驳回', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  SYNCED: { label: '已同步ERP', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  SYNC_FAILED: { label: '同步失败', color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
}

export default function SalespersonProfilePage() {
  const router = useRouter()
  const toast = useToast()
  const { salesperson, isAuthenticated, isLoading: authLoading } = useSalespersonAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<OrderItem>>({})
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null)
  const [editingCustomerData, setEditingCustomerData] = useState<EditingCustomer | null>(null)
  const [savingCustomer, setSavingCustomer] = useState(false)
  const [resubmittingOrderId, setResubmittingOrderId] = useState<string | null>(null)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 历史订单相关状态
  const [sessionOrderIds, setSessionOrderIds] = useState<string[]>([])
  const [showHistoryOrders, setShowHistoryOrders] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState('')
  const [verifyingPassword, setVerifyingPassword] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
      return
    }

    // 从sessionStorage加载本次会话创建的订单ID
    const storedSessionOrderIds = sessionStorage.getItem('session_order_ids')
    if (storedSessionOrderIds) {
      try {
        setSessionOrderIds(JSON.parse(storedSessionOrderIds))
      } catch (e) {
        console.error('Failed to parse session order ids:', e)
      }
    }

    loadOrders()
    loadCustomers()
  }, [isAuthenticated, authLoading])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getAll({ limit: 100 })
      setOrders(Array.isArray(response) ? response : response.data || [])
    } catch (error: any) {
      toast.error(error.message || '加载订单失败')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll({ limit: 100 })
      setCustomers(Array.isArray(response) ? response : response.data || [])
    } catch (error: any) {
      toast.error(error.message || '加载客户失败')
    }
  }

  // 验证密码解锁历史订单
  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast.warning('请输入密码')
      return
    }

    setVerifyingPassword(true)
    try {
      await authApi.verifyPassword(password)
      setShowHistoryOrders(true)
      setShowPasswordModal(false)
      setPassword('')
      toast.success('验证成功')
    } catch (error: any) {
      toast.error(error.message || '密码错误')
    } finally {
      setVerifyingPassword(false)
    }
  }

  // 关闭历史订单
  const handleHideHistoryOrders = () => {
    setShowHistoryOrders(false)
  }

  // 分类订单：本次会话订单 和 历史订单
  const currentSessionOrders = orders.filter(order => sessionOrderIds.includes(order.id))
  const historyOrders = orders.filter(order => !sessionOrderIds.includes(order.id))

  // 重新提交审核（被驳回的订单）
  const handleResubmit = async (orderId: string) => {
    try {
      setResubmittingOrderId(orderId)
      await orderApi.resubmit(orderId)
      toast.success('订单已重新提交审核')
      await loadOrders()
    } catch (error: any) {
      toast.error(error.message || '重新提交审核失败')
    } finally {
      setResubmittingOrderId(null)
    }
  }

  const viewOrderDetail = (orderId: string) => {
    router.push(`/salesperson/orders/${orderId}?from=profile`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatAmount = (amount: any) => {
    return typeof amount === 'number' ? amount.toFixed(2) : Number(amount || 0).toFixed(2)
  }

  // 解析箱规并计算体积 (格式: number*number*number 或 number*number*numbercm)
  // 自动转换为立方米 (cm³ → m³)
  const calculateVolumeFromCartonSpec = (cartonSpec: string): number | undefined => {
    if (!cartonSpec) return undefined

    // 匹配格式: number*number*number[cm] (支持小数，可选cm单位)
    const match = cartonSpec.match(/^(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*(?:cm)?$/i)
    if (!match) return undefined

    const [, length, width, height] = match
    // 计算立方厘米
    const volumeCm3 = parseFloat(length) * parseFloat(width) * parseFloat(height)
    // 转换为立方米 (1 m³ = 1,000,000 cm³)
    const volumeM3 = volumeCm3 / 1000000
    // 保留6位小数
    return Math.round(volumeM3 * 1000000) / 1000000
  }

  const handleEditItem = (item: OrderItem) => {
    setEditingItemId(item.id)
    setEditingData({
      price: item.price,
      quantity: item.quantity,
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
      summary: item.summary,
    })
  }

  // 清理数据：将空字符串转换为undefined，将字符串数字转换为数字
  const cleanItemData = (data: any) => {
    const cleaned: any = {}
    for (const [key, value] of Object.entries(data)) {
      // 跳过undefined
      if (value === undefined) continue

      // 空字符串转为undefined
      if (value === '') {
        cleaned[key] = undefined
        continue
      }

      // 数字字段：尝试转换
      const numberFields = ['packagingConversion', 'netWeight', 'grossWeight', 'packingQuantity', 'cartonQuantity', 'volume', 'quantity', 'price']
      if (numberFields.includes(key) && typeof value === 'string') {
        const num = parseFloat(value)
        cleaned[key] = isNaN(num) ? undefined : num
      } else {
        cleaned[key] = value
      }
    }
    return cleaned
  }

  const handleSaveItem = async () => {
    if (!editingItemId) return

    try {
      // 找到包含该item的订单
      const order = orders.find(o => o.items.some(item => item.id === editingItemId))
      if (!order) {
        toast.error('未找到订单')
        return
      }

      // 更新订单中的item
      const updatedItems = order.items.map(item => {
        if (item.id === editingItemId) {
          // 验证数字字段
          if (editingData.price !== undefined && (isNaN(Number(editingData.price)) || Number(editingData.price) < 0)) {
            throw new Error('请输入有效的单价（必须是非负数字）')
          }
          if (editingData.quantity !== undefined && (isNaN(Number(editingData.quantity)) || Number(editingData.quantity) < 1)) {
            throw new Error('请输入有效的数量（必须是大于0的整数）')
          }

          // 清理编辑的数据
          const cleanedEditingData = cleanItemData(editingData)

          return {
            productSkuId: item.productSkuId || item.productSku?.id,
            itemNumber: item.itemNumber,
            customerProductCode: item.customerProductCode,
            productImage: item.productImage,
            productSpec: item.productSpec,
            additionalAttributes: item.additionalAttributes,
            quantity: cleanedEditingData.quantity !== undefined ? Number(cleanedEditingData.quantity) : Number(item.quantity),
            price: cleanedEditingData.price !== undefined ? Number(cleanedEditingData.price) : Number(item.price),
            expectedDeliveryDate: item.expectedDeliveryDate,
            // 更新包装信息 - 使用清理后的数据
            ...cleanedEditingData,
          }
        }
        return {
          productSkuId: item.productSkuId || item.productSku?.id,
          itemNumber: item.itemNumber,
          customerProductCode: item.customerProductCode,
          productImage: item.productImage,
          productSpec: item.productSpec,
          additionalAttributes: item.additionalAttributes,
          quantity: Number(item.quantity),
          price: Number(item.price),
          expectedDeliveryDate: item.expectedDeliveryDate,
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
          summary: item.summary,
        }
      })

      // 调用API更新订单
      await orderApi.update(order.id, { items: updatedItems })

      toast.success('保存成功')
      setEditingItemId(null)
      setEditingData({})

      // 重新加载订单列表
      await loadOrders()
    } catch (error: any) {
      toast.error(error.message || '保存失败')
    }
  }

  const handleCancelEdit = () => {
    setEditingItemId(null)
    setEditingData({})
  }

  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // 客户编辑功能
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomerId(customer.id)
    setEditingCustomerData({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      contactPerson: customer.contactPerson || '',
      phone: customer.phone || '',
      address: customer.address || '',
      country: customer.country || '',
      customerType: customer.customerType,
      remarks: customer.remarks || '',
    })
  }

  const handleSaveCustomer = async () => {
    if (!editingCustomerData) return

    setSavingCustomer(true)
    try {
      await customerApi.update(editingCustomerData.id, {
        name: editingCustomerData.name,
        email: editingCustomerData.email,
        contactPerson: editingCustomerData.contactPerson || undefined,
        phone: editingCustomerData.phone || undefined,
        address: editingCustomerData.address || undefined,
        country: editingCustomerData.country || undefined,
        customerType: editingCustomerData.customerType,
        remarks: editingCustomerData.remarks || undefined,
      })
      toast.success('客户信息更新成功')
      setEditingCustomerId(null)
      setEditingCustomerData(null)
      await loadCustomers()
    } catch (error: any) {
      toast.error(error.message || '更新客户信息失败')
    } finally {
      setSavingCustomer(false)
    }
  }

  const handleCancelCustomerEdit = () => {
    setEditingCustomerId(null)
    setEditingCustomerData(null)
  }

  // 渲染订单卡片
  const renderOrderCard = (order: Order, statusConfig: { label: string; color: string; bgColor: string; icon: any }, StatusIcon: any) => {
    return (
      <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        {/* 订单头部信息 */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{order.orderNumber}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  order.orderType === 'FORMAL' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.orderType === 'FORMAL' ? '正式订单' : '意向订单'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                客户: {order.customer?.name || '-'} | 日期: {formatDate(order.orderDate)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.color}`}>
              <StatusIcon size={14} />
              <span className="text-sm font-medium">{statusConfig.label}</span>
            </div>
            {order.status === 'REJECTED' && (
              <button
                onClick={() => handleResubmit(order.id)}
                disabled={resubmittingOrderId === order.id}
                className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw size={14} className={resubmittingOrderId === order.id ? 'animate-spin' : ''} />
                {resubmittingOrderId === order.id ? '提交中...' : '重新提交'}
              </button>
            )}
            <button
              onClick={() => viewOrderDetail(order.id)}
              className="px-4 py-2 border border-primary text-primary rounded-lg text-sm flex items-center gap-1 hover:bg-primary/5"
            >
              <Eye size={16} />
              查看详情
            </button>
          </div>
        </div>

        {/* 驳回原因 */}
        {order.status === 'REJECTED' && order.rejectReason && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <XCircle size={16} className="text-red-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-700">驳回原因</div>
                <div className="text-sm text-red-600">{order.rejectReason}</div>
              </div>
            </div>
          </div>
        )}

        {/* ERP单号 */}
        {order.erpOrderNo && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm">
              <span className="text-green-700 font-medium">ERP单号: </span>
              <span className="text-green-800">{order.erpOrderNo}</span>
            </div>
          </div>
        )}

        {/* 订单商品列表 */}
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              {/* 商品基本信息 */}
              <div className="flex items-start gap-4 mb-4">
                {/* 商品图片 */}
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productSku?.productCode || '商品'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package size={24} />
                    </div>
                  )}
                </div>

                {/* 商品信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">
                    品号: <span className="font-mono text-primary">{item.productSku?.productCode || '-'}</span>
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    品名: {item.productSku?.productName || item.productSku?.productNameEn || '-'}
                  </div>
                  {item.productSpec && (
                    <div className="text-sm text-gray-600 mt-1">{item.productSpec}</div>
                  )}
                  {item.customerProductCode && (
                    <div className="text-sm text-gray-500">客户货号: {item.customerProductCode}</div>
                  )}
                </div>
              </div>

              {/* 价格和数量区域 - 可编辑 */}
              <div className="grid grid-cols-3 gap-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                {editingItemId === item.id && expandedItems.has(item.id) ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">单价 *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingData.price ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditingData({...editingData, price: val ? parseFloat(val) : 0})
                        }}
                        className="w-full px-3 py-2 border rounded text-sm font-semibold"
                        placeholder="请输入单价"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">数量 *</label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        value={editingData.quantity ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          const newQuantity = val ? parseInt(val) : 1
                          const newData = {...editingData, quantity: newQuantity}
                          // 自动计算箱数
                          if (editingData.packingQuantity && newQuantity) {
                            newData.cartonQuantity = Math.ceil(newQuantity / editingData.packingQuantity)
                          }
                          setEditingData(newData)
                        }}
                        className="w-full px-3 py-2 border rounded text-sm font-semibold"
                        placeholder="请输入数量"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">未税本位币</label>
                      <div className="text-lg font-bold text-primary bg-white px-3 py-2 border rounded">
                        ¥{formatAmount((Number(editingData.price) || 0) * (Number(editingData.quantity) || 0))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">单价</label>
                      <div className="text-sm font-semibold text-gray-900">¥{formatAmount(item.price)}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">数量</label>
                      <div className="text-sm font-semibold text-gray-900">{item.quantity}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1">未税本位币</label>
                      <div className="text-sm font-bold text-primary">¥{formatAmount(item.untaxedLocalCurrency ?? item.subtotal)}</div>
                    </div>
                  </>
                )}
              </div>

              {/* 包装信息展开/收起 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => toggleItemExpand(item.id)}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {expandedItems.has(item.id) ? (
                      <>
                        <ChevronUp size={16} />
                        <span>收起包装信息</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        <span>展开包装信息</span>
                      </>
                    )}
                  </button>
                  {expandedItems.has(item.id) && editingItemId !== item.id && (
                    <button
                      onClick={() => handleEditItem(item)}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-primary border border-primary rounded hover:bg-primary/5"
                    >
                      <Edit2 size={14} />
                      编辑
                    </button>
                  )}
                </div>

                {expandedItems.has(item.id) && (
                  editingItemId === item.id ? (
                    // 编辑模式
                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div>
                          <label className="text-xs text-gray-600">装箱数</label>
                          <input
                            type="number"
                            value={editingData.packingQuantity || ''}
                            onChange={(e) => {
                              const packingQty = parseInt(e.target.value) || undefined
                              const newData = {...editingData, packingQuantity: packingQty}
                              // 自动计算箱数
                              if (packingQty && editingData.quantity) {
                                newData.cartonQuantity = Math.ceil(editingData.quantity / packingQty)
                              }
                              setEditingData(newData)
                            }}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">箱数</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={editingData.cartonQuantity || ''}
                              onChange={(e) => setEditingData({...editingData, cartonQuantity: parseInt(e.target.value) || undefined})}
                              className={`w-full mt-1 px-2 py-1 border rounded text-sm ${
                                editingData.packingQuantity && editingData.quantity && editingData.quantity % editingData.packingQuantity !== 0
                                  ? 'border-orange-400 bg-orange-50'
                                  : ''
                              }`}
                            />
                            {editingData.packingQuantity && editingData.quantity && editingData.quantity % editingData.packingQuantity !== 0 && (
                              <div className="text-xs text-orange-600 mt-1">⚠️ 不能整除</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">包装方式</label>
                          <input
                            type="text"
                            value={editingData.packagingMethod || ''}
                            onChange={(e) => setEditingData({...editingData, packagingMethod: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">纸卡编码</label>
                          <input
                            type="text"
                            value={editingData.paperCardCode || ''}
                            onChange={(e) => setEditingData({...editingData, paperCardCode: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">水洗标编码</label>
                          <input
                            type="text"
                            value={editingData.washLabelCode || ''}
                            onChange={(e) => setEditingData({...editingData, washLabelCode: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">外箱编码</label>
                          <input
                            type="text"
                            value={editingData.outerCartonCode || ''}
                            onChange={(e) => setEditingData({...editingData, outerCartonCode: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">箱规 (cm)</label>
                          <input
                            type="text"
                            value={editingData.cartonSpecification || ''}
                            onChange={(e) => {
                              const newCartonSpec = e.target.value
                              const calculatedVolume = calculateVolumeFromCartonSpec(newCartonSpec)
                              setEditingData({
                                ...editingData,
                                cartonSpecification: newCartonSpec,
                                volume: calculatedVolume !== undefined ? calculatedVolume : editingData.volume
                              })
                            }}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            placeholder="例如: 74*44*20"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">体积 (m³)</label>
                          <input
                            type="number"
                            value={editingData.volume || ''}
                            onChange={(e) => setEditingData({...editingData, volume: parseFloat(e.target.value) || undefined})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-xs text-gray-600">厂商备注</label>
                          <textarea
                            value={editingData.supplierNote || ''}
                            onChange={(e) => setEditingData({...editingData, supplierNote: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            rows={2}
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-xs text-gray-600">摘要</label>
                          <textarea
                            value={editingData.summary || ''}
                            onChange={(e) => setEditingData({...editingData, summary: e.target.value})}
                            className="w-full mt-1 px-2 py-1 border rounded text-sm"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1"
                        >
                          <X size={14} />
                          取消
                        </button>
                        <button
                          onClick={handleSaveItem}
                          className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-1"
                        >
                          <Save size={14} />
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 查看模式
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                      {[
                        { key: 'customerProductCode', label: '客户料号' },
                        { key: 'packingQuantity', label: '装箱数' },
                        { key: 'cartonQuantity', label: '箱数', highlight: (i: any) =>
                          i.packingQuantity && i.quantity && i.quantity % i.packingQuantity !== 0
                        },
                        { key: 'packagingMethod', label: '包装方式' },
                        { key: 'paperCardCode', label: '纸卡编码' },
                        { key: 'washLabelCode', label: '水洗标编码' },
                        { key: 'outerCartonCode', label: '外箱编码' },
                        { key: 'cartonSpecification', label: '箱规' },
                        { key: 'volume', label: '体积' },
                      ].map(({ key, label, highlight }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                          <div className={`text-sm ${highlight && highlight(item) ? 'text-orange-600' : 'text-gray-900'}`}>
                            {(item as any)[key] ?? '-'}
                            {key === 'cartonQuantity' && item.packingQuantity && item.quantity && item.quantity % item.packingQuantity !== 0 && (
                              <span className="ml-1 text-orange-600">⚠️ 不能整除</span>
                            )}
                          </div>
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">预交日</label>
                        <div className="text-sm text-gray-900">
                          {item.expectedDeliveryDate
                            ? new Date(item.expectedDeliveryDate).toLocaleDateString('zh-CN')
                            : '-'
                          }
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">厂商备注</label>
                        <div className="text-sm text-gray-900">{item.supplierNote || '-'}</div>
                      </div>
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-gray-500 mb-1">摘要</label>
                        <div className="text-sm text-gray-900">{item.summary || '-'}</div>
                      </div>
                      {/* 小计 - 右下角 */}
                      <div className="md:col-span-4 flex justify-end">
                        <span className="text-lg font-bold text-primary">
                          小计: ¥{formatAmount(item.subtotal)}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 订单金额 */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-right">
          <span className="text-gray-600">订单总额: </span>
          <span className="text-xl font-bold text-primary">${formatAmount(order.totalAmount)}</span>
        </div>
      </div>
    )
  }

  if (authLoading || !isAuthenticated || !salesperson) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">加载中...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* 业务员信息卡片 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
              {salesperson.name ? salesperson.name.charAt(0) : 'S'}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{salesperson.name}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>工号: {salesperson.accountId}</span>
                </div>
                {salesperson.email && (
                  <div className="flex items-center gap-2">
                    <span>📧 {salesperson.email}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">总订单数</div>
              <div className="text-3xl font-bold text-primary">{orders.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">客户数</div>
              <div className="text-3xl font-bold text-blue-600">{customers.length}</div>
            </div>
          </div>
        </div>

        {/* 我的订单模块 */}
        <div id="my-orders" className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Package size={28} className="text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">我的订单</h2>
          </div>

          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Package size={48} className="mb-4 text-gray-300" />
                <p>暂无订单</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 本次会话订单 */}
                {currentSessionOrders.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-primary">
                      <Package size={20} className="text-primary" />
                      <h3 className="text-lg font-bold text-gray-900">本次订单</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm rounded-full">
                        {currentSessionOrders.length}
                      </span>
                    </div>
                    <div className="space-y-6">
                      {currentSessionOrders.map((order) => {
                        const statusConfig = orderStatusConfig[order.status] || orderStatusConfig.PENDING
                        const StatusIcon = statusConfig.icon
                        return renderOrderCard(order, statusConfig, StatusIcon)
                      })}
                    </div>
                  </div>
                )}

                {/* 历史订单区域 - 始终显示 */}
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-300">
                    <div className="flex items-center gap-2">
                      <History size={20} className="text-gray-500" />
                      <h3 className="text-lg font-bold text-gray-700">历史订单</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                        {historyOrders.length}
                      </span>
                    </div>
                    {showHistoryOrders ? (
                      <button
                        onClick={handleHideHistoryOrders}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition flex items-center gap-2"
                      >
                        <Lock size={16} />
                        隐藏历史订单
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center gap-2"
                      >
                        <Lock size={16} />
                        查看历史订单
                      </button>
                    )}
                  </div>

                  {showHistoryOrders ? (
                    historyOrders.length > 0 ? (
                      <div className="space-y-6">
                        {historyOrders.map((order) => {
                          const statusConfig = orderStatusConfig[order.status] || orderStatusConfig.PENDING
                          const StatusIcon = statusConfig.icon
                          return renderOrderCard(order, statusConfig, StatusIcon)
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                        <Package size={32} className="mb-3" />
                        <p className="text-sm">暂无历史订单</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <Lock size={32} className="mb-3" />
                      <p className="text-sm">历史订单已隐藏</p>
                      <p className="text-xs mt-1">点击上方按钮输入密码查看</p>
                    </div>
                  )}
                </div>

                {/* 如果没有本次会话订单，显示提示 */}
                {currentSessionOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <Package size={48} className="mb-4 text-gray-300" />
                    <p>本次会话暂无新订单</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 我的客户模块 */}
        <div id="my-customers" className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Users size={28} className="text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">我的客户</h2>
          </div>

          <div>
            {customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Users size={48} className="mb-4 text-gray-300" />
                <p>暂无客户</p>
              </div>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    {editingCustomerId === customer.id && editingCustomerData ? (
                      /* 编辑模式 */
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-900 text-xl">编辑客户</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveCustomer}
                              disabled={savingCustomer}
                              className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-1 disabled:opacity-50"
                            >
                              <Save size={16} />
                              {savingCustomer ? '保存中...' : '保存'}
                            </button>
                            <button
                              onClick={handleCancelCustomerEdit}
                              className="px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-1"
                            >
                              <X size={16} />
                              取消
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">客户名称 *</label>
                            <input
                              type="text"
                              value={editingCustomerData.name}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                            <input
                              type="email"
                              value={editingCustomerData.email}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, email: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">联系人</label>
                            <input
                              type="text"
                              value={editingCustomerData.contactPerson}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, contactPerson: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">电话</label>
                            <input
                              type="tel"
                              value={editingCustomerData.phone}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, phone: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">国家</label>
                            <input
                              type="text"
                              value={editingCustomerData.country}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, country: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">客户类型</label>
                            <select
                              value={editingCustomerData.customerType}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, customerType: e.target.value as 'NEW' | 'OLD'})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              <option value="NEW">新客户</option>
                              <option value="OLD">老客户</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">地址</label>
                            <input
                              type="text"
                              value={editingCustomerData.address}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, address: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                            <textarea
                              value={editingCustomerData.remarks}
                              onChange={(e) => setEditingCustomerData({...editingCustomerData, remarks: e.target.value})}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 显示模式 */
                      <div className="flex items-start justify-between gap-6">
                        {/* 客户基本信息 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h3 className="font-bold text-gray-900 text-xl">{customer.name}</h3>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                              customer.customerType === 'NEW'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.customerType === 'NEW' ? '新客户' : '老客户'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {customer.email && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">邮箱</div>
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                  <span>📧</span>
                                  <span>{customer.email}</span>
                                </div>
                              </div>
                            )}
                            {customer.phone && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">电话</div>
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                  <span>📞</span>
                                  <span>{customer.phone}</span>
                                </div>
                              </div>
                            )}
                            {customer.country && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">国家</div>
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                  <span>🌍</span>
                                  <span>{customer.country}</span>
                                </div>
                              </div>
                            )}
                            {customer.contactPerson && (
                              <div>
                                <div className="text-xs text-gray-500 mb-1">联系人</div>
                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                  <span>👤</span>
                                  <span>{customer.contactPerson}</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {customer.address && (
                            <div className="mt-4">
                              <div className="text-xs text-gray-500 mb-1">地址</div>
                              <div className="flex items-start gap-2 text-sm text-gray-900">
                                <span>📍</span>
                                <span className="flex-1">{customer.address}</span>
                              </div>
                            </div>
                          )}

                          {customer.remarks && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">备注</div>
                              <div className="text-sm text-gray-900">{customer.remarks}</div>
                            </div>
                          )}
                        </div>

                        {/* 编辑按钮 */}
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="px-4 py-2 border border-primary text-primary rounded-lg text-sm flex items-center gap-1 hover:bg-primary/5"
                        >
                          <Edit2 size={16} />
                          编辑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 密码验证模态框 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Lock size={24} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">验证身份</h3>
                <p className="text-sm text-gray-500">请输入您的登录密码以查看历史订单</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerifyPassword()
                  }
                }}
                placeholder="请输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false)
                  setPassword('')
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleVerifyPassword}
                disabled={verifyingPassword}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifyingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    验证中...
                  </>
                ) : (
                  '确认'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

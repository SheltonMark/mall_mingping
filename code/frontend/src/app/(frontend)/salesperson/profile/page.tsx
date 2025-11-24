'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { orderApi, customerApi } from '@/lib/salespersonApi'
import { useToast } from '@/components/common/ToastContainer'
import { User, Package, Users, Eye, Edit2, Save, X } from 'lucide-react'

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
  totalAmount: number
  customer: {
    name: string
  }
  items: OrderItem[]
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

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
      return
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

  const viewOrderDetail = (orderId: string) => {
    router.push(`/salesperson/orders/${orderId}?from=profile`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatAmount = (amount: any) => {
    return typeof amount === 'number' ? amount.toFixed(2) : Number(amount || 0).toFixed(2)
  }

  const handleEditItem = (item: OrderItem) => {
    setEditingItemId(item.id)
    setEditingData({
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
          // 清理编辑的数据
          const cleanedEditingData = cleanItemData(editingData)

          return {
            productSkuId: item.productSkuId || item.productSku?.id,
            itemNumber: item.itemNumber,
            customerProductCode: item.customerProductCode,
            productImage: item.productImage,
            productSpec: item.productSpec,
            additionalAttributes: item.additionalAttributes,
            quantity: item.quantity,
            price: item.price,
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
          quantity: item.quantity,
          price: item.price,
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

  if (authLoading || !isAuthenticated || !salesperson) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">加载中...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* 订单头部 */}
                    <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          订单号: {order.orderNumber}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          order.orderType === 'FORMAL'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {order.orderType === 'FORMAL' ? '正式订单' : '意向订单'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-sm text-gray-600">{formatDate(order.orderDate)}</div>
                        <div className="text-xl font-bold text-primary">¥{formatAmount(order.totalAmount)}</div>
                        <button
                          onClick={() => viewOrderDetail(order.id)}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                        >
                          <Eye size={16} />
                          查看详情
                        </button>
                      </div>
                    </div>

                    {/* 订单商品列表 */}
                    <div className="p-6 space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-4 flex-1">
                              {item.productImage && (
                                <img
                                  src={item.productImage}
                                  alt="产品"
                                  className="w-20 h-20 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-1">
                                  品号: <span className="font-mono font-semibold text-primary">{item.productSku?.productCode || '-'}</span>
                                </p>
                                <p className="text-sm text-gray-700 mb-2">
                                  品名: {item.productSku?.productName || item.productSku?.productNameEn || '-'}
                                </p>
                                {item.customerProductCode && (
                                  <p className="text-sm text-gray-600 font-mono mb-1">
                                    客户料号: {item.customerProductCode}
                                  </p>
                                )}
                                {item.expectedDeliveryDate && (
                                  <div className="text-xs text-orange-600 mt-1">
                                    期望交期: {formatDate(item.expectedDeliveryDate)}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end">
                              <div className="text-lg font-bold text-primary mb-2">¥{formatAmount(item.subtotal)}</div>
                              <div className="text-sm text-gray-500">x{item.quantity}</div>
                            </div>
                          </div>

                          {/* 货品规格 */}
                          {item.productSpec && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <p className="text-xs text-gray-500 mb-1 font-semibold">货品规格:</p>
                              <div className="text-sm text-gray-700 whitespace-pre-line">
                                {item.productSpec}
                              </div>
                            </div>
                          )}

                          {/* 附加属性 */}
                          {item.additionalAttributes && Object.keys(item.additionalAttributes).length > 0 && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs text-gray-500 mb-1 font-semibold">附加属性:</p>
                              <div className="text-sm text-gray-900">
                                {(() => {
                                  try {
                                    const attrs = typeof item.additionalAttributes === 'string'
                                      ? JSON.parse(item.additionalAttributes)
                                      : item.additionalAttributes;

                                    if (attrs.nameZh) {
                                      return attrs.nameZh;
                                    } else if (attrs.nameEn) {
                                      return attrs.nameEn;
                                    } else {
                                      return JSON.stringify(attrs);
                                    }
                                  } catch (e) {
                                    return String(item.additionalAttributes);
                                  }
                                })()}
                              </div>
                            </div>
                          )}

                          {/* 包装信息 - 可编辑 */}
                          {editingItemId === item.id ? (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-gray-700">编辑包装信息</h4>
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleSaveItem}
                                    className="px-3 py-1 bg-primary text-white rounded text-sm flex items-center gap-1"
                                  >
                                    <Save size={14} />
                                    保存
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center gap-1"
                                  >
                                    <X size={14} />
                                    取消
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-4 gap-3">
                                <div>
                                  <label className="text-xs text-gray-600">包装换算</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingConversion || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingConversion: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装单位</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingUnit || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingUnit: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">重量单位</label>
                                  <input
                                    type="text"
                                    value={editingData.weightUnit || ''}
                                    onChange={(e) => setEditingData({...editingData, weightUnit: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">净重</label>
                                  <input
                                    type="number"
                                    value={editingData.netWeight || ''}
                                    onChange={(e) => setEditingData({...editingData, netWeight: parseFloat(e.target.value)})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">毛重</label>
                                  <input
                                    type="number"
                                    value={editingData.grossWeight || ''}
                                    onChange={(e) => setEditingData({...editingData, grossWeight: parseFloat(e.target.value)})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装类型</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingType || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingType: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">包装尺寸</label>
                                  <input
                                    type="text"
                                    value={editingData.packagingSize || ''}
                                    onChange={(e) => setEditingData({...editingData, packagingSize: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">装箱数量</label>
                                  <input
                                    type="number"
                                    value={editingData.packingQuantity || ''}
                                    onChange={(e) => setEditingData({...editingData, packingQuantity: parseInt(e.target.value)})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">外箱数量</label>
                                  <input
                                    type="number"
                                    value={editingData.cartonQuantity || ''}
                                    onChange={(e) => setEditingData({...editingData, cartonQuantity: parseInt(e.target.value)})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
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
                                  <label className="text-xs text-gray-600">纸卡编号</label>
                                  <input
                                    type="text"
                                    value={editingData.paperCardCode || ''}
                                    onChange={(e) => setEditingData({...editingData, paperCardCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">水洗标编号</label>
                                  <input
                                    type="text"
                                    value={editingData.washLabelCode || ''}
                                    onChange={(e) => setEditingData({...editingData, washLabelCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">外箱编号</label>
                                  <input
                                    type="text"
                                    value={editingData.outerCartonCode || ''}
                                    onChange={(e) => setEditingData({...editingData, outerCartonCode: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">外箱规格</label>
                                  <input
                                    type="text"
                                    value={editingData.cartonSpecification || ''}
                                    onChange={(e) => setEditingData({...editingData, cartonSpecification: e.target.value})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-gray-600">体积</label>
                                  <input
                                    type="number"
                                    value={editingData.volume || ''}
                                    onChange={(e) => setEditingData({...editingData, volume: parseFloat(e.target.value)})}
                                    className="w-full mt-1 px-2 py-1 border rounded text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
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
                            </div>
                          ) : (
                            <div className="mt-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
                                <div>包装换算: {item.packagingConversion || '-'}</div>
                                <div>包装单位: {item.packagingUnit || '-'}</div>
                                <div>重量单位: {item.weightUnit || '-'}</div>
                                <div>净重: {item.netWeight ?? '-'}</div>
                                <div>毛重: {item.grossWeight ?? '-'}</div>
                                <div>包装类型: {item.packagingType || '-'}</div>
                                <div>包装尺寸: {item.packagingSize || '-'}</div>
                                <div>装箱数量: {item.packingQuantity ?? '-'}</div>
                                <div>外箱数量: {item.cartonQuantity ?? '-'}</div>
                                <div>包装方式: {item.packagingMethod || '-'}</div>
                                <div>纸卡: {item.paperCardCode || '-'}</div>
                                <div>水洗标: {item.washLabelCode || '-'}</div>
                                <div>外箱: {item.outerCartonCode || '-'}</div>
                                <div>外箱规格: {item.cartonSpecification || '-'}</div>
                                <div>体积: {item.volume ?? '-'}</div>
                                <div className="col-span-2">厂商备注: {item.supplierNote || '-'}</div>
                                <div className="col-span-2">摘要: {item.summary || '-'}</div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="px-3 py-1 border border-primary text-primary rounded text-sm flex items-center gap-1 hover:bg-primary/5"
                                >
                                  <Edit2 size={14} />
                                  编辑
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

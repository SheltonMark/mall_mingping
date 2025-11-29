'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { orderApi } from '@/lib/salespersonApi'
import { useToast } from '@/components/common/ToastContainer'

interface OrderItem {
  id: string
  itemNumber: number
  productSkuId: string
  customerProductCode?: string
  productImage?: string
  productSpec?: string
  additionalAttributes?: any
  quantity: number
  packagingConversion?: string
  packagingUnit?: string
  weightUnit?: string
  netWeight?: number
  grossWeight?: number
  packagingType?: string
  packagingSize?: string
  supplierNote?: string
  expectedDeliveryDate?: string
  price: number
  untaxedLocalCurrency?: number
  packingQuantity?: number
  cartonQuantity?: number
  packagingMethod?: string
  paperCardCode?: string
  washLabelCode?: string
  outerCartonCode?: string
  cartonSpecification?: string
  volume?: number
  summary?: string
  subtotal: number
  productSku?: {
    productCode: string
    productName?: string
    productNameEn?: string
    specification?: string
  }
}

interface Order {
  id: string
  orderNumber: string
  orderDate: string
  orderType: 'FORMAL' | 'INTENTION'
  customerType: 'NEW' | 'OLD'
  totalAmount: number
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
    country?: string
    companyName?: string
    contactPerson?: string
    contactEmail?: string
    contactPhone?: string
    address?: string
    remarks?: string
  }
  salesperson: {
    id: string
    accountId: string
    chineseName: string
  }
  items: OrderItem[]
  createdAt: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string
  const toast = useToast()
  const { salesperson, isAuthenticated, isLoading: authLoading } = useSalespersonAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
      return
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId, isAuthenticated, authLoading])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const data = await orderApi.getOne(orderId)
      setOrder(data)
    } catch (error: any) {
      toast.error(error.message || '加载订单失败')
      router.push('/salesperson/profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleBackToProfile = () => {
    router.push('/salesperson/profile#my-orders')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  const formatAmount = (amount: any) => {
    return typeof amount === 'number' ? amount.toFixed(2) : Number(amount || 0).toFixed(2)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          /* 隐藏浏览器页眉页脚（URL、日期等） */
          @page {
            margin: 10mm;
            size: A4;
          }

          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 pt-32 pb-20">
        {/* 返回按钮 */}
        <div className="no-print max-w-[1440px] mx-auto px-6 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>返回</span>
          </button>
        </div>

        {/* 打印区域 */}
        <div className="print-area max-w-[1440px] mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {/* 公司信息 */}
            <div className="mb-12 p-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl border border-primary/10">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  东阳市铭品日用品有限公司
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* 联系信息 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">联系信息</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">📧</span>
                      <span>XXL7702@163.com</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">📞</span>
                      <span>13806777702</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">📍</span>
                      <span>浙江省东阳市</span>
                    </div>
                  </div>
                </div>

                {/* 公司Logo */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      铭
                    </div>
                    <p className="text-sm text-gray-600 font-medium">铭品日用品</p>
                  </div>
                </div>

                {/* 业务员信息 */}
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-700 uppercase">业务员信息</h3>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-500">工号:</span>
                      <span className="font-semibold">{order.salesperson.accountId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">姓名:</span>
                      <span className="font-semibold">{order.salesperson.chineseName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单基本信息 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">订单信息</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">订单号</label>
                  <div className="py-2 bg-gray-50 rounded text-sm font-semibold">
                    {order.orderNumber}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">订单日期</label>
                  <div className="py-2 bg-gray-50 rounded text-sm">
                    {formatDate(order.orderDate)}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">订单类型</label>
                  <div className="py-2 bg-gray-50 rounded text-sm">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.orderType === 'FORMAL'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {order.orderType === 'FORMAL' ? '正式订单' : '意向订单'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">客户类型</label>
                  <div className="py-2 bg-gray-50 rounded text-sm">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.customerType === 'NEW'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.customerType === 'NEW' ? '新客户' : '老客户'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 客户信息 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">客户信息</h2>
              {(() => {
                const customer = order.customer || order.erpCustomer;
                if (!customer) return <div className="text-gray-500">暂无客户信息</div>;
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">客户名称</label>
                      <div className="py-2 bg-gray-50 rounded text-sm">
                        {customer.name}
                      </div>
                    </div>
                    {(customer as any).cusNo && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">客户编号</label>
                        <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                          {(customer as any).cusNo}
                        </div>
                      </div>
                    )}
                    {customer.contactPerson && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">联系人</label>
                        <div className="py-2 bg-gray-50 rounded text-sm">
                          {customer.contactPerson}
                        </div>
                      </div>
                    )}
                    {customer.email && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">邮箱</label>
                        <div className="py-2 bg-gray-50 rounded text-sm">
                          {customer.email}
                        </div>
                      </div>
                    )}
                    {customer.phone && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">电话</label>
                        <div className="py-2 bg-gray-50 rounded text-sm">
                          {customer.phone}
                        </div>
                      </div>
                    )}
                    {customer.country && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">国家</label>
                        <div className="py-2 bg-gray-50 rounded text-sm">
                          {customer.country}
                        </div>
                      </div>
                    )}
                    {customer.address && (
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">地址</label>
                        <div className="py-2 bg-gray-50 rounded text-sm">
                          {customer.address}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* 订单商品明细 */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">订单商品明细</h2>

              {order.items.map((item, index) => (
                <div key={item.id} className="mb-8 p-6 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-primary">产品 #{item.itemNumber}</h3>
                    <span className="text-sm text-gray-500">序号: {item.itemNumber}</span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* 产品图片 */}
                    {item.productImage && (
                      <div className="md:col-span-3">
                        <label className="block text-sm font-semibold text-gray-500 mb-2">产品图片</label>
                        <img
                          src={item.productImage}
                          alt="产品"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {/* 产品信息 */}
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">品号</label>
                          <div className="py-2 bg-gray-50 rounded text-sm font-mono font-semibold text-primary">
                            {item.productSku?.productCode || '-'}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1">品名</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.productSku?.productName || item.productSku?.productNameEn || '-'}
                          </div>
                        </div>
                        {item.customerProductCode && (
                          <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">客户料号</label>
                            <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                              {item.customerProductCode}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.productSpec && (
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">货品规格</label>
                        <div className="py-2 bg-gray-50 rounded text-sm whitespace-pre-line">
                          {item.productSpec}
                        </div>
                      </div>
                    )}

                    {/* 附加属性 */}
                    {item.additionalAttributes && Object.keys(item.additionalAttributes).length > 0 && (
                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">附加属性</label>
                        <div className="py-2 bg-blue-50 rounded text-sm border border-blue-200">
                          {(() => {
                            try {
                              const attrs = typeof item.additionalAttributes === 'string'
                                ? JSON.parse(item.additionalAttributes)
                                : item.additionalAttributes;

                              // 提取nameZh值，如果不存在则用nameEn，都不存在则显示整个对象
                              if (attrs.nameZh) {
                                return <span className="text-gray-900">{attrs.nameZh}</span>;
                              } else if (attrs.nameEn) {
                                return <span className="text-gray-900">{attrs.nameEn}</span>;
                              } else {
                                return <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(attrs, null, 2)}</pre>;
                              }
                            } catch (e) {
                              return <span className="text-gray-900">{String(item.additionalAttributes)}</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* 订单数量和价格 */}
                    <div className="md:col-span-3">
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-2">订单数量</label>
                          <div className="py-2 bg-blue-50 rounded-lg text-sm font-semibold text-blue-900">
                            {item.quantity}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-2">单价</label>
                          <div className="py-2 bg-green-50 rounded-lg text-sm font-semibold text-green-900">
                            ¥{formatAmount(item.price)}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-500 mb-2">小计</label>
                          <div className="py-2 bg-primary/10 rounded-lg text-sm font-bold text-primary">
                            ¥{formatAmount(item.subtotal)}
                          </div>
                        </div>

                        {item.untaxedLocalCurrency !== null && item.untaxedLocalCurrency !== undefined && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-500 mb-2">未税本位币</label>
                            <div className="py-2 bg-gray-50 rounded-lg text-sm">
                              ¥{formatAmount(item.untaxedLocalCurrency)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 包装信息 - 精简显示 */}
                    <div className="md:col-span-3 mt-4">
                      <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-primary">📦</span>
                        包装信息
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">装箱数</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.packingQuantity ?? '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">箱数</label>
                          <div className={`py-2 rounded text-sm ${
                            item.packingQuantity && item.quantity && item.quantity % item.packingQuantity !== 0
                              ? 'bg-orange-50 border border-orange-200'
                              : 'bg-gray-50'
                          }`}>
                            {item.cartonQuantity ?? '-'}
                            {item.packingQuantity && item.quantity && item.quantity % item.packingQuantity !== 0 && (
                              <span className="text-xs text-orange-600 ml-1">⚠️ 不能整除</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">包装方式</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.packagingMethod || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">箱规</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.cartonSpecification || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">体积 (m³)</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.volume ?? '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 辅助信息 - 始终显示 */}
                    <div className="md:col-span-3 mt-4">
                      <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-primary">🏷️</span>
                        辅助信息
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">纸卡编号</label>
                          <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                            {item.paperCardCode || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">水洗标编号</label>
                          <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                            {item.washLabelCode || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">外箱编号</label>
                          <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                            {item.outerCartonCode || '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 其他信息 - 始终显示 */}
                    <div className="md:col-span-3 mt-4">
                      <h4 className="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="text-primary">📝</span>
                        其他信息
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">客户料号</label>
                          <div className="py-2 bg-gray-50 rounded text-sm font-mono">
                            {item.customerProductCode || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">期望交期</label>
                          <div className="py-2 bg-gray-50 rounded text-sm">
                            {item.expectedDeliveryDate ? formatDate(item.expectedDeliveryDate) : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">厂商备注</label>
                          <div className="py-2 bg-yellow-50 rounded-lg text-sm border border-yellow-200 min-h-[60px]">
                            {item.supplierNote || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">摘要</label>
                          <div className="py-2 bg-gray-50 rounded-lg text-sm min-h-[80px]">
                            {item.summary || '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 订单总计 */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border-2 border-primary/20">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">订单总额:</span>
                <span className="text-3xl font-bold text-primary">
                  ¥{formatAmount(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* 打印日期 */}
            <div className="text-right text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
              打印日期: {new Date().toLocaleString('zh-CN')}
            </div>
          </div>

          {/* 底部操作按钮 - 固定显示 */}
          <div className="no-print mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 w-48 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-lg font-semibold"
            >
              <Printer size={24} />
              <span>打印订单</span>
            </button>
            <button
              onClick={handleBackToProfile}
              className="flex items-center justify-center gap-2 w-48 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              <span>返回个人中心</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

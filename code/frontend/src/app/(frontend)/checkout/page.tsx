'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Package, FileText, User, Phone, MapPin } from 'lucide-react'
import { useToast } from '@/components/common/ToastContainer'

interface OrderFormData {
  customerName: string
  customerPhone: string
  customerAddress: string
  deliveryDate: string
  boxCount: number
  cardCode: string
  summary: string
  notes: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const toast = useToast()
  const [formData, setFormData] = useState<OrderFormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    deliveryDate: '',
    boxCount: 1,
    cardCode: '',
    summary: '',
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // TODO: Submit order to backend
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    // Redirect to success page or orders list
    toast.success('订单创建成功！')
    router.push('/orders')
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-8">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">创建订单</h1>
          <p className="mt-2 text-gray-600">
            请填写订单信息，完成后可在订单管理中继续编辑
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  客户信息
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      客户姓名 *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="请输入客户姓名"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      联系电话 *
                    </label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="请输入联系电话"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      收货地址 *
                    </label>
                    <input
                      type="text"
                      name="customerAddress"
                      value={formData.customerAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="请输入收货地址"
                    />
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  订单详情
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      交货日期 *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleInputChange}
                        required
                        className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      箱数 *
                    </label>
                    <input
                      type="number"
                      name="boxCount"
                      value={formData.boxCount}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="请输入箱数"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      卡号
                    </label>
                    <input
                      type="text"
                      name="cardCode"
                      value={formData.cardCode}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="请输入卡号（可选）"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      摘要
                    </label>
                    <input
                      type="text"
                      name="summary"
                      value={formData.summary}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                      placeholder="订单摘要（可选）"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      备注
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors resize-none"
                      placeholder="其他备注信息（可选）"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items Preview (Mock) */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  订单商品
                </h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div>
                        <p className="font-semibold text-gray-900">可旋转拖把套装</p>
                        <p className="text-sm text-gray-500">品号: MOP-BLU-WHT-BLU</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">x2</p>
                      <p className="text-sm text-primary">¥178.00</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    提示: 订单创建后可在订单管理中编辑商品和参数
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">订单概览</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>商品金额</span>
                    <span className="font-semibold">¥178.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>商品数量</span>
                    <span className="font-semibold">2</span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-gray-900">订单总额</span>
                      <span className="text-3xl font-bold text-primary">¥178.00</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full h-14 rounded-xl font-bold text-white text-lg transition-all transform shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark hover:scale-[1.02] shadow-primary/30'
                  }`}
                >
                  {isSubmitting ? '提交中...' : '提交订单'}
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>订单创建后可随时编辑</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>可修改客户信息和订单参数</p>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <p>支持增删订单商品</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

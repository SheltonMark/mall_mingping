'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { customerApi } from '@/lib/salespersonApi'
import { useToast } from '@/components/common/ToastContainer'
import { UserPlus, Save, X } from 'lucide-react'
import CustomSelect from '@/components/common/CustomSelect'

function NewCustomerForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnUrl = searchParams.get('returnUrl')
  const toast = useToast()
  const { isAuthenticated, isLoading: authLoading } = useSalespersonAuth()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    country: '',
    customerType: 'NEW' as 'NEW' | 'OLD',
    remarks: '',
  })

  // 检查登录状态
  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
    }
  }, [isAuthenticated, authLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('请先登录')
      router.push('/login')
      return
    }

    setSaving(true)

    try {
      await customerApi.create(formData)
      toast.success('客户创建成功!')

      // 如果有 returnUrl，返回来源页面，否则跳转到个人中心
      router.push(returnUrl || '/salesperson/profile')
    } catch (error: any) {
      toast.error(error.message || '创建客户失败')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // 加载中或未登录时显示加载状态
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">加载中...</p>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">新增客户</h1>
                <p className="text-sm text-gray-500">填写客户信息</p>
              </div>
            </div>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 客户名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入客户名称"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入邮箱地址"
                />
              </div>

              {/* 联系人 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  联系人
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入联系人姓名"
                />
              </div>

              {/* 电话 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电话
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入联系电话"
                />
              </div>

              {/* 客户类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  客户类型 <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  options={[
                    { value: 'NEW', label: '新客户' },
                    { value: 'OLD', label: '老客户' }
                  ]}
                  value={formData.customerType}
                  onChange={(value) => setFormData(prev => ({ ...prev, customerType: value as 'NEW' | 'OLD' }))}
                  placeholder="选择客户类型"
                />
              </div>

              {/* 国家 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  国家
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="请输入国家"
                />
              </div>
            </div>

            {/* 地址 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地址
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="请输入详细地址"
              />
            </div>

            {/* 备注 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注
              </label>
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="请输入备注信息"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save size={20} />
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function NewCustomerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">加载中...</p>
      </div>
    }>
      <NewCustomerForm />
    </Suspense>
  )
}

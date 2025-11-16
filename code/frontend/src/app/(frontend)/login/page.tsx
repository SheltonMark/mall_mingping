'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// 将使用 useSearchParams 的部分抽取到单独组件
function LoginForm() {
  const { login } = useAuth()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Store redirect parameter from URL to sessionStorage
  useEffect(() => {
    const redirectParam = searchParams.get('redirect')
    if (redirectParam) {
      sessionStorage.setItem('redirect_after_login', redirectParam)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError(t('auth.required_field'))
      return
    }

    setLoading(true)

    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || t('auth.login_failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">"欢迎回来"</h2>
            <p className="mt-2 text-sm text-gray-600">"登录您的账户"</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                "邮箱地址"
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="请输入邮箱"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                "密码"
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
                placeholder="请输入密码"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
            >
              {loading ? t('common.loading') : t('auth.login_button')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dont_have_account')}{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                {t('auth.register_here')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 用 Suspense 包裹导出
// Temporary stub for remaining translation calls
const t = (key: string) => key

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

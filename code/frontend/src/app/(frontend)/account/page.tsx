'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

interface Stats {
  totalForms: number
  recentForm: OrderForm | null
}

export default function AccountPage() {
  const { customer, isAuthenticated, logout, updateProfile } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<'overview' | 'inquiries' | 'profile'>('overview')
  const [inquiries, setInquiries] = useState<OrderForm[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [profileData, setProfileData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    country: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Load data when tab changes
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'overview') {
        loadStats()
      } else if (activeTab === 'inquiries') {
        loadInquiries()
      } else if (activeTab === 'profile' && customer) {
        setProfileData({
          name: customer.name || '',
          contactPerson: customer.contactPerson || '',
          phone: customer.phone || '',
          address: customer.address || '',
          country: customer.country || '',
        })
      }
    }
  }, [activeTab, isAuthenticated, customer])

  const loadStats = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('customer_token')
      const response = await fetch(`${API_URL}/order-forms/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInquiries = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('customer_token')
      const response = await fetch(`${API_URL}/order-forms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (response.ok) {
        const data = await response.json()
        setInquiries(data)
      }
    } catch (error) {
      console.error('Failed to load inquiries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess(false)
    setProfileLoading(true)

    try {
      await updateProfile(profileData)
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err: any) {
      setProfileError(err.message || t('account.profile.error'))
    } finally {
      setProfileLoading(false)
    }
  }

  const handleLogout = () => {
    if (confirm(t('account.logout_confirm'))) {
      logout()
    }
  }

  if (!isAuthenticated || !customer) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('account.title')}</h1>
              <p className="mt-2 text-gray-600">
                {t('account.welcome')}, {customer.contactPerson || customer.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              {t('account.menu.logout')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'overview'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('account.menu.overview')}
                </button>
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'inquiries'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('account.menu.inquiries')}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-black text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t('account.menu.profile')}
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.overview.title')}</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                      <p className="text-sm text-blue-600 font-medium mb-2">{t('account.overview.total_inquiries')}</p>
                      <p className="text-3xl font-bold text-blue-900">{stats?.totalForms || 0}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                      <p className="text-sm text-green-600 font-medium mb-2">{t('account.overview.member_since')}</p>
                      <p className="text-lg font-bold text-green-900">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                      <p className="text-sm text-purple-600 font-medium mb-2">{t('account.overview.recent_inquiry')}</p>
                      <p className="text-lg font-bold text-purple-900">
                        {stats?.recentForm ? stats.recentForm.formNumber : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.inquiries.title')}</h2>

                {loading ? (
                  <p className="text-gray-600">{t('common.loading')}</p>
                ) : inquiries.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">{t('account.inquiries.empty')}</p>
                    <p className="text-sm text-gray-500 mb-6">{t('account.inquiries.empty_desc')}</p>
                    <Link
                      href="/products"
                      className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                    >
                      {t('cart.browse')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {t('account.inquiries.form_number')}: {inquiry.formNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(inquiry.submittedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            {t('account.inquiries.status_submitted')}
                          </span>
                        </div>

                        <div className="border-t border-gray-200 pt-4 mb-4">
                          <p className="text-sm text-gray-600 mb-2">{inquiry.items.length} {t('account.inquiries.items_count')}</p>
                          <p className="text-xl font-bold text-gray-900">${inquiry.totalAmount}</p>
                        </div>

                        <div className="text-sm text-gray-600">
                          <p><strong>{t('order_form.contact_name')}:</strong> {inquiry.contactName}</p>
                          <p><strong>{t('order_form.phone')}:</strong> {inquiry.phone}</p>
                          <p><strong>{t('order_form.address')}:</strong> {inquiry.address}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('account.profile.title')}</h2>

                {profileError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{profileError}</p>
                  </div>
                )}

                {profileSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600">{t('account.profile.success')}</p>
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.email')}
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.company_name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.contact_name')}
                    </label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={profileData.contactPerson}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.phone')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.address')}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('account.profile.country')}
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={profileData.country}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {profileLoading ? t('account.profile.saving') : t('account.profile.save')}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

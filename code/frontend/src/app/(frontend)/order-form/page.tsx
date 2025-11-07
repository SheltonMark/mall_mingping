'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function OrderFormPage() {
  const { customer, isAuthenticated } = useAuth()
  const { cart, clearCart } = useCart()
  const { t } = useLanguage()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formNumber, setFormNumber] = useState('')
  const [formData, setFormData] = useState({
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Pre-fill form with customer data
  useEffect(() => {
    if (customer) {
      setFormData({
        contactName: customer.contactPerson || customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        notes: '',
      })
    }
  }, [customer])

  // Calculate total
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.contactName || !formData.phone || !formData.email || !formData.address) {
      setError(t('order_form.validation_error'))
      return
    }

    if (cart.length === 0) {
      setError('Cart is empty')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('customer_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Prepare items data
      const items = cart.map((item) => ({
        product_id: item.productId,
        product_code: item.productCode,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.price,
        configuration: item.colorCombination || {},
      }))

      const response = await fetch(`${API_URL}/order-forms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          items,
          totalAmount: totalAmount.toFixed(2),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || t('order_form.submit_error'))
      }

      const result = await response.json()

      // Success!
      setFormNumber(result.formNumber)
      setSuccess(true)
      clearCart()
    } catch (err: any) {
      setError(err.message || t('order_form.submit_error'))
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('order_form.success_title')}</h2>
            <p className="text-gray-600 mb-2">{t('order_form.success_message')}</p>

            <div className="my-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t('order_form.form_number')}</p>
              <p className="text-2xl font-bold text-gray-900">{formNumber}</p>
            </div>

            <div className="flex gap-4 justify-center mt-8">
              <Link
                href="/account"
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                {t('order_form.view_inquiries')}
              </Link>
              <Link
                href="/products"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                {t('order_form.continue_shopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Form screen
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
            <h1 className="text-3xl font-bold">{t('order_form.title')}</h1>
            <p className="mt-2 text-gray-300">{t('order_form.subtitle')}</p>
          </div>

          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('order_form.contact_info')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.contact_name')} *
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                      placeholder={t('order_form.contact_name_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                      placeholder={t('order_form.phone_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                      placeholder={t('order_form.email_placeholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('order_form.address')} *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                      placeholder={t('order_form.address_placeholder')}
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('order_form.notes')}
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                    placeholder={t('order_form.notes_placeholder')}
                  />
                </div>
              </div>

              {/* Products Summary */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">{t('order_form.products')}</h2>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-sm text-gray-600">{item.productCode}</p>
                          {item.colorCombination && (
                            <p className="text-xs text-gray-500 mt-1">
                              {Object.entries(item.colorCombination).map(([key, value]: [string, any]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value.name || value}
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-600">x{item.quantity}</p>
                          <p className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{t('order_form.total_amount')}</span>
                      <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Link
                  href="/cart"
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-center"
                >
                  {t('order_form.back_to_cart')}
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {loading ? t('order_form.submitting') : t('order_form.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

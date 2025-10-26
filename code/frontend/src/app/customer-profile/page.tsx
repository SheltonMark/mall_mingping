'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function CustomerProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    remarks: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.customerName || !formData.email || !formData.phone || !formData.address) {
      alert(t('customer_profile.required_fields_message'))
      return
    }

    try {
      // TODO: Save to backend API
      const customerData = {
        name: formData.customerName,
        contact: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        remarks: formData.remarks,
        createdAt: new Date().toISOString()
      }

      console.log('Saving customer:', customerData)

      // Show success message
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
        // Navigate back
        router.back()
      }, 2000)
    } catch (error) {
      console.error('Error saving customer:', error)
      alert(t('customer_profile.save_error'))
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">{t('customer_profile.title')}</h1>
          <p className="text-xl text-gray-600">{t('customer_profile.subtitle')}</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Customer Information Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('customer_profile.customer_information')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.customer_company_name')} *</label>
                <input
                  type="text"
                  id="customerName"
                  placeholder={t('customer_profile.enter_company_name')}
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.contact_person')}</label>
                <input
                  type="text"
                  id="contactPerson"
                  placeholder={t('customer_profile.enter_contact_name')}
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.email')} *</label>
                <input
                  type="email"
                  id="email"
                  placeholder={t('customer_profile.email_placeholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.phone')} *</label>
                <input
                  type="tel"
                  id="phone"
                  placeholder={t('customer_profile.phone_placeholder')}
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.address')} *</label>
                <textarea
                  id="address"
                  placeholder={t('customer_profile.enter_full_address')}
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors resize-vertical"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_profile.remarks_summary')}</label>
                <textarea
                  id="remarks"
                  placeholder={t('customer_profile.remarks_placeholder')}
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors resize-vertical"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200">
            <button
              onClick={handleCancel}
              className="px-12 py-4 bg-white border-2 border-gray-200 rounded-full font-semibold text-gray-900 hover:border-primary hover:bg-primary/5 transition-all"
            >
              {t('customer_profile.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-12 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              {t('customer_profile.save_customer')}
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed bottom-8 right-8 px-6 py-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/30 animate-fade-in z-50">
          {t('customer_profile.success_message')}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [orderDate, setOrderDate] = useState('')

  useEffect(() => {
    // Set current date as default
    const today = new Date().toISOString().split('T')[0]
    setOrderDate(today)
  }, [])

  const handleConfirmOrder = () => {
    // TODO: Submit order to backend
    router.push('/order-view')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Page Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-8">{t('order_confirm.title')}</h1>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Company Info */}
          <div className="p-8 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-2xl mb-12 border border-primary/10">
            {/* Company Name - Main Title */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {t('order_confirm.company_name')}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto"></div>
            </div>

            {/* Contact Info Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left: Contact Information */}
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

              {/* Middle: Company Description (Optional) */}
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

              {/* Right: Salesperson */}
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

          {/* Order Classification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.order_classification')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">{t('order_confirm.customer_type')}</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input type="radio" name="customerType" value="new" defaultChecked className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.new_customer')}
                    </div>
                  </label>
                  <label className="flex-1">
                    <input type="radio" name="customerType" value="old" className="peer sr-only" />
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
                    <input type="radio" name="orderType" value="formal" defaultChecked className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      {t('order_confirm.formal_order')}
                    </div>
                  </label>
                  <label className="flex-1">
                    <input type="radio" name="orderType" value="intention" className="peer sr-only" />
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
                <input type="radio" name="productCategory" value="new" defaultChecked className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  {t('order_confirm.new_product')}
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="old" className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  {t('order_confirm.old_product')}
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="sample" className="peer sr-only" />
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
            />
          </div>

          {/* Customer Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.customer_information')}</h2>
            <div className="mb-4">
              <input
                type="text"
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
                <input type="text" placeholder={t('order_confirm.enter_company_name')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.contact_person')}</label>
                <input type="text" placeholder={t('order_confirm.enter_contact_name')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.email')}</label>
                <input type="email" placeholder={t('order_confirm.email_placeholder')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.phone')}</label>
                <input type="tel" placeholder={t('order_confirm.phone_placeholder')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.address')}</label>
                <textarea placeholder={t('order_confirm.enter_full_address')} rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.remarks_summary')}</label>
                <textarea placeholder={t('order_confirm.remarks_placeholder')} rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.product_information')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.number_of_boxes')}</label>
                <input type="number" placeholder="0" min="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.quantity_per_box')}</label>
                <input type="number" placeholder="0" min="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.packaging_method')}</label>
                <input type="text" placeholder={t('order_confirm.packaging_placeholder')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.card_code')}</label>
                <input type="text" placeholder={t('order_confirm.enter_card_code')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.care_label_code')}</label>
                <input type="text" placeholder={t('order_confirm.enter_care_label_code')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.outer_box_code')}</label>
                <input type="text" placeholder={t('order_confirm.enter_outer_box_code')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.box_specification')}</label>
                <input type="text" placeholder={t('order_confirm.box_spec_placeholder')} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">{t('order_confirm.expected_delivery_date')}</label>
                <input type="date" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">{t('order_confirm.order_details')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.image')}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.product_name')}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.product_code')}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.unit_price')}</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.quantity')}</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">{t('order_confirm.total')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ" alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold">Premium Microfiber Mop</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs mr-1">Handle: Blue</span>
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs mr-1">Head: Gray</span>
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs">Cloth: White</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="text" defaultValue="MOP-001" className="w-24 px-2 py-1 border border-gray-300 rounded text-center" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="45.00" step="0.01" className="w-24 px-2 py-1 border border-gray-300 rounded text-center" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="20" className="w-20 px-2 py-1 border border-gray-300 rounded text-center" />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">￥900.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                  <span className="text-2xl font-bold">{t('order_confirm.total_amount')}</span>
                  <span className="text-3xl font-bold text-primary">￥900.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-8 border-t-2 border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="px-12 py-4 border-2 border-gray-300 rounded-full font-semibold hover:border-primary hover:bg-primary/5 transition-all"
            >
              {t('order_confirm.cancel')}
            </button>
            <button
              onClick={handleConfirmOrder}
              className="px-12 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              {t('order_confirm.confirm_order')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

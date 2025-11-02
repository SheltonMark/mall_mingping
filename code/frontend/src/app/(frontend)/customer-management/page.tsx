'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, User, Mail, Phone, MapPin, Calendar, Building2 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Customer {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  createdAt: string
  lastOrderDate?: string
  totalOrders: number
  totalAmount: number
}

export default function CustomerManagementPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')

  // Mock customer data - 业务员倩倩名下的客户
  const mockCustomers: Customer[] = [
    {
      id: 'cust-001',
      name: 'ABC Trading Co.',
      contactPerson: 'John Smith',
      email: 'john@abctrading.com',
      phone: '+1-555-0123',
      address: '123 Business St, New York, NY 10001, USA',
      createdAt: '2023-01-15',
      lastOrderDate: '2024-10-26',
      totalOrders: 15,
      totalAmount: 45680.50
    },
    {
      id: 'cust-002',
      name: 'XYZ International',
      contactPerson: 'Mary Johnson',
      email: 'mary@xyzintl.com',
      phone: '+1-555-0456',
      address: '456 Commerce Ave, Los Angeles, CA 90001, USA',
      createdAt: '2023-03-20',
      lastOrderDate: '2024-10-24',
      totalOrders: 22,
      totalAmount: 78900.00
    },
    {
      id: 'cust-003',
      name: 'Global Supplies Ltd',
      contactPerson: 'David Lee',
      email: 'david@globalsupplies.com',
      phone: '+1-555-0789',
      address: '789 Trade Blvd, Chicago, IL 60601, USA',
      createdAt: '2023-06-10',
      lastOrderDate: '2024-10-20',
      totalOrders: 8,
      totalAmount: 23450.99
    },
    {
      id: 'cust-004',
      name: 'Premium Retailers',
      contactPerson: 'Sarah Wilson',
      email: 'sarah@premiumretail.com',
      phone: '+1-555-0147',
      address: '147 Retail Park, Miami, FL 33101, USA',
      createdAt: '2023-08-05',
      lastOrderDate: '2024-09-15',
      totalOrders: 18,
      totalAmount: 52300.00
    },
    {
      id: 'cust-005',
      name: 'Mega Store Chain',
      contactPerson: 'Michael Brown',
      email: 'michael@megastore.com',
      phone: '+1-555-0258',
      address: '258 Shopping Center, Seattle, WA 98101, USA',
      createdAt: '2023-10-12',
      lastOrderDate: '2024-08-25',
      totalOrders: 25,
      totalAmount: 95670.50
    },
    {
      id: 'cust-006',
      name: 'Elite Wholesale Inc',
      contactPerson: 'Jennifer Davis',
      email: 'jennifer@elitewholesale.com',
      phone: '+1-555-0369',
      address: '369 Distribution Dr, Houston, TX 77001, USA',
      createdAt: '2024-01-08',
      lastOrderDate: '2024-10-15',
      totalOrders: 6,
      totalAmount: 18990.00
    }
  ]

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return mockCustomers

    const searchLower = searchTerm.toLowerCase()
    return mockCustomers.filter(customer =>
      customer.name.toLowerCase().includes(searchLower) ||
      customer.contactPerson.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm)
    )
  }, [searchTerm])

  const handleCustomerClick = (customerId: string) => {
    // TODO: Navigate to customer detail page
    console.log('View customer:', customerId)
  }

  const handleAddCustomer = () => {
    router.push('/customer-profile')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-6 py-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-5xl font-bold text-gray-900">{t('customer_management.title')}</h1>
            </div>
            <button
              onClick={handleAddCustomer}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              <Plus className="w-5 h-5" />
              {t('customer_management.add_customer')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('customer_management.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors text-lg"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_management.total_customers')}</div>
            <div className="text-4xl font-bold text-primary">{mockCustomers.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_management.total_orders')}</div>
            <div className="text-4xl font-bold text-primary">
              {mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('customer_management.total_revenue')}</div>
            <div className="text-4xl font-bold text-primary">
              ￥{mockCustomers.reduce((sum, c) => sum + c.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6">{t('customer_management.customer_list')}</h2>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                <Building2 className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('customer_management.no_customers_found')}</h3>
              <p className="text-lg text-gray-600">{t('customer_management.try_different_search')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map(customer => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer.id)}
                  className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{customer.name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{customer.contactPerson}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary mb-1">
                        ￥{customer.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.totalOrders} {t('customer_management.orders')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{customer.address}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{t('customer_management.created')}: {formatDate(customer.createdAt)}</span>
                    </div>
                    {customer.lastOrderDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{t('customer_management.last_order')}: {formatDate(customer.lastOrderDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

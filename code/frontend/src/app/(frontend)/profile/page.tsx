'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Calendar, Clock, User } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Order {
  id: string
  date: string
  customer: string
  amount: number
  products: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const { t } = useLanguage()

  const sampleOrders: Order[] = [
    {
      id: 'ORD-20241026-001',
      date: '2024-10-26',
      customer: 'ABC Trading Co.',
      amount: 2452.50,
      products: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiIeS_8I9cg8G2DxKoNSd2c4etQEF_eM1nrAXWr0fMOS5V9nIi-7waq9GJ1zVBS5CYwejTNYxnqdeDa6f7z6akHTU1fzmm-Q_XaSUWF7VQO5JuN63-WE_ThhDV89_hq72MKk950Cc_D8dtl4HYUhmfjPrRMzJsjFq_Ks1gB91gY6MMk8Eg-k2cmp5lX_lowkNXZ6iyx-ZtZrlq-9CriHkS0R0EN-sm3Yg_0lwz4K3nZIj9F-zDq3e9qRP6QOMxfY_827bfXZ4pJWt'
      ]
    },
    {
      id: 'ORD-20241024-002',
      date: '2024-10-24',
      customer: 'XYZ International',
      amount: 3850.00,
      products: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-xhSQMIXCEToPuBIcgJtoEhRyFOe3go7GPbACC5duLevFYOO0vNn-TtoCja7pky40tgPS9KzdFnJDakuDg-YIdwVUy8_xFG6eDySJUr_IkFkq7j6ect3gAHPg3ca0YeZBWsdUutEvOzU0bi0aPxAVI6K-igFBtHPb-hkRzKUsyijzulrD1EBRnUCg6OrNYig7_onhy7Cez4gb7FN6Life15OLW58Vk5sRoMDzLOO_3YStL7D5_tYGEkxN5n-JrNGIqFn3FyeiB1g',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBvR4ZS6iXxPFjf_owlhSPtxe5rlS3z6hvFKe58cv5BSORe-WqryNsuUX_Ne8neN4gnS5YUYF57Kpw4fgtLFvpdeMCyaQ7EShr8TANoGQDzKAWI1g5vXgFc8kSegkeQJKZ70F2cv_jf5loG3XNcmwWVgpGa4gneqxJW7baf_rbz21PvoQWOTf_JjdUV8u6OuSMgKZJoL4xWM9xjckJwXmc8kJgjKjXhJvooJrhFFhBXBC4GTBR5obA_oAOsSRNjWKAMpOOHO9HAwj_8'
      ]
    },
    {
      id: 'ORD-20241020-003',
      date: '2024-10-20',
      customer: 'Global Supplies Ltd',
      amount: 1599.99,
      products: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB7HMh6_hD8cR25jo_qnZrPerFSibHYfq3qUFo3yuEBu2nypqaS3eZLsyXuJkHUojmccp2Rkio67iXcCjle1fHtIRUCyUTVZ9utbo0t6z9YsGGGskD_nTqe--S39RKW3GqQ7JgZ_6gzMCERuKagWAgvDHoXv71IDkekp1GVvMYqgtqnIKqXYVLo6GsUgzq_dY-dpZAELLoHjVmB-ikVgM0djfG9Vn6cReRTwGSrQiur71JTyMBLS0Q2cHE4H02vXUSq78lCX9vbHOvh'
      ]
    },
    {
      id: 'ORD-20240915-004',
      date: '2024-09-15',
      customer: 'Premium Retailers',
      amount: 4200.00,
      products: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD8iYKG9Q6fWrGYECfhPmGXcZc_hNXBMUyW0PJr6ZNVbTDKm7vbpkdyAJg3hQMIs_-GocOdbSFK239oKZQLt6vAHrwP7dS2ZHAxunoh40m3EtGoUsY_OStSXfnXWSd3e-hGA7PsOHj83GrMO2fLu6F0ydlSdBTalHC13f4hw-OgBsyB9gUsriWAO-J856P32M731sPLE1rsUO4LOrb1uEX3Tr6tMgfHcdPFVmmBO3AMkqFra11lvgOQdDwlvCoAykCI9UEtUg-yESwK',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBLec0-ffJPhk8M2dQ7MUnHmW_Rp2Sk6hccVVPuyc72bDKZPcv9CHofV5PnP2JBg6oaaf3QWSy11zRjctoMcuc_WttLHRjP6T4O2E4iCLysEyYTv3mnzevnhvLSJ6wu8LF_hMf_DH32cZqBwxogFQkqj-jCcut3kCAgERfimgjh3IC9EX5OhgnseLJDz4b3OTZfb4rvTz756d4LZSMbXKTGNZUjzpV7YPU3mrMAy2LtsWNmtU5EXVK1WSWdB81mg0MwXUFJQESfVzhC',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAElHmxmAAKqpCz_QAUtI6vpZUmjHCwFt3PNNY2nHFc_GZVSzS4hWOfrcTHXlZSsgZThq5RkO-GGc2TaKin2KHJdBMiS4HedYoi_anO5X33xBpI95-WSPdeIlU0CyWQPp11cOAAJl5SyZ04TBykepwn-m8mkV0H5cPF_AsUAnyWEzKqF7YjqxTiPsH3v8-eHZf4tQCu5EGfSse3JWepKrgKQB0aeJtbDCMR7_gUnU5eGquWJp08jWIM6CUPJcdu5wea9IVtjQlmcStZ'
      ]
    },
    {
      id: 'ORD-20240825-005',
      date: '2024-08-25',
      customer: 'Mega Store Chain',
      amount: 5670.50,
      products: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ'
      ]
    }
  ]

  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')

  // Get unique years and months for filter dropdowns
  const years = useMemo(() => {
    return Array.from(
      new Set(sampleOrders.map(order => new Date(order.date).getFullYear()))
    ).sort((a, b) => b - a)
  }, [])

  const months = [
    t('profile.january'), t('profile.february'), t('profile.march'),
    t('profile.april'), t('profile.may'), t('profile.june'),
    t('profile.july'), t('profile.august'), t('profile.september'),
    t('profile.october'), t('profile.november'), t('profile.december')
  ]

  // Filter orders
  const filteredOrders = useMemo(() => {
    return sampleOrders.filter(order => {
      const orderDate = new Date(order.date)

      // Year filter
      if (yearFilter && orderDate.getFullYear() !== parseInt(yearFilter)) {
        return false
      }

      // Month filter
      if (monthFilter && (orderDate.getMonth() + 1) !== parseInt(monthFilter)) {
        return false
      }

      // Search filter
      if (searchTerm) {
        const searchableText = `${order.id} ${order.customer}`.toLowerCase()
        if (!searchableText.includes(searchTerm.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }, [searchTerm, yearFilter, monthFilter, t])

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      totalOrders: filteredOrders.length,
      totalAmount: filteredOrders.reduce((sum, order) => sum + order.amount, 0)
    }
  }, [filteredOrders])

  const handleOrderClick = (orderId: string) => {
    router.push(`/order-view`)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return t('profile.today')
    if (diffDays === 1) return t('profile.yesterday')
    return `${diffDays} ${t('profile.days_ago')}`
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
      {/* Profile Header */}
      <div className="bg-white py-12">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
              QQ
            </div>
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-gray-900 mb-3">{t('order_confirm.name_qianqian')}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-xl text-sm font-semibold text-primary">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  {t('profile.sales_manager')}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-xl text-sm font-semibold text-primary">
                  {t('profile.account')}: 3579
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-xl text-sm font-semibold text-primary">
                  {t('profile.member_since')} 2023
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        {/* Statistics */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('profile.order_statistics')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('profile.total_orders')}</div>
              <div className="text-6xl font-bold text-primary">{stats.totalOrders}</div>
            </div>
            <div className="bg-white rounded-2xl p-8 border border-gray-200">
              <div className="text-sm font-semibold text-gray-500 uppercase mb-3">{t('profile.total_amount')}</div>
              <div className="text-6xl font-bold text-primary">
                ￥{stats.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{t('profile.all_orders')}</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('profile.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors bg-white min-w-40 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] bg-no-repeat"
              >
                <option value="">{t('profile.all_years')}</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="px-4 py-3 pr-10 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors bg-white min-w-40 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA2TDggMTBMMTIgNiIgc3Ryb2tlPSIjOUI5QjlCIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==')] bg-[center_right_0.75rem] bg-no-repeat"
              >
                <option value="">{t('profile.all_months')}</option>
                {months.map((month, idx) => (
                  <option key={idx + 1} value={idx + 1}>{month}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Order List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-300">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">{t('profile.no_orders_found')}</h3>
              <p className="text-lg text-gray-600">{t('profile.try_adjusting')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer bg-white"
                >
                  <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                    <div className="text-lg font-semibold text-gray-900">#{order.id}</div>
                    <div className="text-2xl font-bold text-primary">
                      ￥{order.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-sm text-gray-600 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(order.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{order.customer}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 overflow-x-auto pt-4 border-t border-gray-200">
                    {order.products.map((product, idx) => (
                      <img
                        key={idx}
                        src={product}
                        alt={`Product ${idx + 1}`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ))}
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

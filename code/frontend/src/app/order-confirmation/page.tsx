'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrderConfirmationPage() {
  const router = useRouter()
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
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Order Confirmation</h1>

        {/* Main Container */}
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Company Info */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 p-8 bg-gray-50 rounded-xl mb-12">
            <div className="flex-1 text-center md:text-left">
              <div className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact Info</div>
              <div className="text-gray-700">
                XXL7702@163.com<br />
                13806777702<br />
                Dongyang, Zhejiang, China
              </div>
            </div>
            <div className="flex-1 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-primary">
                Dongyang Mingpin Commodity Co., Ltd
              </h2>
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="text-sm font-semibold text-gray-500 uppercase mb-2">Salesperson</div>
              <div className="text-gray-700">
                Account: 3579<br />
                Name: Qianqian
              </div>
            </div>
          </div>

          {/* Order Classification */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Order Classification</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">Customer Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input type="radio" name="customerType" value="new" defaultChecked className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      New Customer
                    </div>
                  </label>
                  <label className="flex-1">
                    <input type="radio" name="customerType" value="old" className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      Old Customer
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">Order Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input type="radio" name="orderType" value="formal" defaultChecked className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      Formal Order
                    </div>
                  </label>
                  <label className="flex-1">
                    <input type="radio" name="orderType" value="intention" className="peer sr-only" />
                    <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                      Intention Order
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Category */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Product Category</h2>
            <div className="flex gap-4">
              <label className="flex-1">
                <input type="radio" name="productCategory" value="new" defaultChecked className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  New Product
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="old" className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  Old Product
                </div>
              </label>
              <label className="flex-1">
                <input type="radio" name="productCategory" value="sample" className="peer sr-only" />
                <div className="px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl cursor-pointer transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold">
                  Sample Request
                </div>
              </label>
            </div>
          </div>

          {/* Order Date */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Order Date</h2>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary max-w-xs"
            />
          </div>

          {/* Customer Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Customer Information</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search customer by name, phone, email, or address..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-2">
                Can't find your customer? <button onClick={() => router.push('/customer-profile')} className="text-primary hover:underline font-semibold">+ Create New Customer</button>
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Customer/Company Name *</label>
                <input type="text" placeholder="Enter company name" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Contact Person</label>
                <input type="text" placeholder="Enter contact name" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Email *</label>
                <input type="email" placeholder="example@company.com" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Phone *</label>
                <input type="tel" placeholder="+86 138 0000 0000" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Address *</label>
                <textarea placeholder="Enter full address" rows={3} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Remarks / Summary</label>
                <textarea placeholder="Any special requirements or notes..." rows={4} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Product Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Number of Boxes</label>
                <input type="number" placeholder="0" min="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Quantity per Box</label>
                <input type="number" placeholder="0" min="0" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Packaging Method</label>
                <input type="text" placeholder="e.g., Carton Box" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Card Code</label>
                <input type="text" placeholder="Enter card code" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Care Label Code</label>
                <input type="text" placeholder="Enter care label code" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Outer Box Code</label>
                <input type="text" placeholder="Enter outer box code" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Box Specification</label>
                <input type="text" placeholder="e.g., 60x40x50cm" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Expected Delivery Date</label>
                <input type="date" className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary" />
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 pb-3 border-b-2 border-primary">Order Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Product Code</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</th>
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
                    <td className="px-4 py-4 text-right font-semibold">$900.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                  <span className="text-2xl font-bold">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">$900.00</span>
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
              Cancel
            </button>
            <button
              onClick={handleConfirmOrder}
              className="px-12 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

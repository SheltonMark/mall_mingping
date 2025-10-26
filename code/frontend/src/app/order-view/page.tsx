'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer } from 'lucide-react'

export default function OrderViewPage() {
  const router = useRouter()
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [originalData, setOriginalData] = useState<any>({})

  // Order data state
  const [orderData, setOrderData] = useState({
    orderNumber: 'ORD-20241026-001',
    customerType: 'old',
    orderType: 'formal',
    productCategory: 'new',
    orderDate: '2024-10-26',
    customer: {
      name: 'ABC Trading Co.',
      contact: 'John Doe',
      email: 'john.doe@abctrading.com',
      phone: '+86 138 0013 8000',
      address: 'Building 5, Industrial Park, Futian District, Shenzhen, Guangdong, 518000, China',
      remarks: 'Urgent delivery required. Please use express shipping.'
    },
    product: {
      boxes: 50,
      qtyPerBox: 20,
      packaging: 'Carton Box',
      cardCode: 'CARD-2024-A',
      careLabelCode: 'CL-2024-001',
      outerBoxCode: 'BOX-2024-X',
      boxSpec: '60x40x50cm',
      deliveryDate: '2024-11-10'
    }
  })

  const handleEdit = (section: string) => {
    if (editingSection === section) {
      // Save mode - show confirmation
      setShowConfirmModal(true)
    } else {
      // Enter edit mode
      setEditingSection(section)
      setOriginalData({ ...orderData })
    }
  }

  const confirmSave = () => {
    setEditingSection(null)
    setShowConfirmModal(false)
    // TODO: Save to backend
    alert('Changes saved successfully!')
  }

  const cancelSave = () => {
    setOrderData(originalData)
    setEditingSection(null)
    setShowConfirmModal(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const isEditing = (section: string) => editingSection === section

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Order View</h1>
              <div className="text-lg text-gray-600">
                Order Number: <span className="font-semibold text-primary">#{orderData.orderNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-6 py-8">
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
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Order Classification</h2>
              <button
                onClick={() => handleEdit('classification')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('classification')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('classification') ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">Customer Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="customerType"
                      value="new"
                      checked={orderData.customerType === 'new'}
                      onChange={(e) => setOrderData({ ...orderData, customerType: e.target.value })}
                      disabled={!isEditing('classification')}
                      className="peer sr-only"
                    />
                    <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('classification') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      New Customer
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="customerType"
                      value="old"
                      checked={orderData.customerType === 'old'}
                      onChange={(e) => setOrderData({ ...orderData, customerType: e.target.value })}
                      disabled={!isEditing('classification')}
                      className="peer sr-only"
                    />
                    <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('classification') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      Old Customer
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-3">Order Type</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="orderType"
                      value="formal"
                      checked={orderData.orderType === 'formal'}
                      onChange={(e) => setOrderData({ ...orderData, orderType: e.target.value })}
                      disabled={!isEditing('classification')}
                      className="peer sr-only"
                    />
                    <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('classification') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      Formal Order
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="orderType"
                      value="intention"
                      checked={orderData.orderType === 'intention'}
                      onChange={(e) => setOrderData({ ...orderData, orderType: e.target.value })}
                      disabled={!isEditing('classification')}
                      className="peer sr-only"
                    />
                    <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('classification') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                      Intention Order
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Product Category */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Product Category</h2>
              <button
                onClick={() => handleEdit('category')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('category')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('category') ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="flex gap-4">
              <label className="flex-1">
                <input
                  type="radio"
                  name="productCategory"
                  value="new"
                  checked={orderData.productCategory === 'new'}
                  onChange={(e) => setOrderData({ ...orderData, productCategory: e.target.value })}
                  disabled={!isEditing('category')}
                  className="peer sr-only"
                />
                <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('category') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  New Product
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="productCategory"
                  value="old"
                  checked={orderData.productCategory === 'old'}
                  onChange={(e) => setOrderData({ ...orderData, productCategory: e.target.value })}
                  disabled={!isEditing('category')}
                  className="peer sr-only"
                />
                <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('category') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  Old Product
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="productCategory"
                  value="sample"
                  checked={orderData.productCategory === 'sample'}
                  onChange={(e) => setOrderData({ ...orderData, productCategory: e.target.value })}
                  disabled={!isEditing('category')}
                  className="peer sr-only"
                />
                <div className={`px-6 py-3 text-center bg-gray-100 border-2 border-gray-200 rounded-xl transition-all peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary font-semibold ${!isEditing('category') ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  Sample Request
                </div>
              </label>
            </div>
          </div>

          {/* Order Date */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Order Date</h2>
              <button
                onClick={() => handleEdit('orderDate')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('orderDate')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('orderDate') ? 'Save' : 'Edit'}
              </button>
            </div>
            <input
              type="date"
              value={orderData.orderDate}
              onChange={(e) => setOrderData({ ...orderData, orderDate: e.target.value })}
              disabled={!isEditing('orderDate')}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary max-w-xs disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          {/* Customer Information */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Customer Information</h2>
              <button
                onClick={() => handleEdit('customer')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('customer')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('customer') ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Customer/Company Name *</label>
                <input
                  type="text"
                  value={orderData.customer.name}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, name: e.target.value } })}
                  disabled={!isEditing('customer')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Contact Person</label>
                <input
                  type="text"
                  value={orderData.customer.contact}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, contact: e.target.value } })}
                  disabled={!isEditing('customer')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Email *</label>
                <input
                  type="email"
                  value={orderData.customer.email}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, email: e.target.value } })}
                  disabled={!isEditing('customer')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Phone *</label>
                <input
                  type="tel"
                  value={orderData.customer.phone}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, phone: e.target.value } })}
                  disabled={!isEditing('customer')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Address *</label>
                <textarea
                  value={orderData.customer.address}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, address: e.target.value } })}
                  disabled={!isEditing('customer')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Remarks / Summary</label>
                <textarea
                  value={orderData.customer.remarks}
                  onChange={(e) => setOrderData({ ...orderData, customer: { ...orderData.customer, remarks: e.target.value } })}
                  disabled={!isEditing('customer')}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Product Information</h2>
              <button
                onClick={() => handleEdit('product')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('product')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('product') ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Number of Boxes</label>
                <input
                  type="number"
                  value={orderData.product.boxes}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, boxes: parseInt(e.target.value) } })}
                  disabled={!isEditing('product')}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Quantity per Box</label>
                <input
                  type="number"
                  value={orderData.product.qtyPerBox}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, qtyPerBox: parseInt(e.target.value) } })}
                  disabled={!isEditing('product')}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Packaging Method</label>
                <input
                  type="text"
                  value={orderData.product.packaging}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, packaging: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Card Code</label>
                <input
                  type="text"
                  value={orderData.product.cardCode}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, cardCode: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Care Label Code</label>
                <input
                  type="text"
                  value={orderData.product.careLabelCode}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, careLabelCode: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Outer Box Code</label>
                <input
                  type="text"
                  value={orderData.product.outerBoxCode}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, outerBoxCode: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Box Specification</label>
                <input
                  type="text"
                  value={orderData.product.boxSpec}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, boxSpec: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase mb-2">Expected Delivery Date</label>
                <input
                  type="date"
                  value={orderData.product.deliveryDate}
                  onChange={(e) => setOrderData({ ...orderData, product: { ...orderData.product, deliveryDate: e.target.value } })}
                  disabled={!isEditing('product')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-primary">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => handleEdit('orderDetails')}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-all ${
                  isEditing('orderDetails')
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                }`}
              >
                {isEditing('orderDetails') ? 'Save' : 'Edit'}
              </button>
            </div>
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
                      <input type="text" defaultValue="MOP-001" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="45.00" step="0.01" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="20" disabled={!isEditing('orderDetails')} className="w-20 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">$900.00</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe" alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold">Professional Cleaning Kit</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs mr-1">Bucket: Red</span>
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs mr-1">Brush: Black</span>
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs">Squeegee: Yellow</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="text" defaultValue="KIT-002" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="65.00" step="0.01" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="15" disabled={!isEditing('orderDetails')} className="w-20 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">$975.00</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-4">
                      <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbiIeS_8I9cg8G2DxKoNSd2c4etQEF_eM1nrAXWr0fMOS5V9nIi-7waq9GJ1zVBS5CYwejTNYxnqdeDa6f7z6akHTU1fzmm-Q_XaSUWF7VQO5JuN63-WE_ThhDV89_hq72MKk950Cc_D8dtl4HYUhmfjPrRMzJsjFq_Ks1gB91gY6MMk8Eg-k2cmp5lX_lowkNXZ6iyx-ZtZrlq-9CriHkS0R0EN-sm3Yg_0lwz4K3nZIj9F-zDq3e9qRP6QOMxfY_827bfXZ4pJWt" alt="Product" className="w-16 h-16 rounded-lg object-cover" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold">Heavy Duty Broom Set</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs mr-1">Handle: Green</span>
                        <span className="inline-block px-2 py-1 bg-primary/10 rounded text-xs">Bristles: Brown</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="text" defaultValue="BRM-003" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="38.50" step="0.01" disabled={!isEditing('orderDetails')} className="w-24 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <input type="number" defaultValue="15" disabled={!isEditing('orderDetails')} className="w-20 px-2 py-1 border border-gray-300 rounded text-center disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70" />
                    </td>
                    <td className="px-4 py-4 text-right font-semibold">$577.50</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-sm">
                <div className="flex justify-between items-center py-4 border-t-2 border-gray-200">
                  <span className="text-2xl font-bold">Total Amount</span>
                  <span className="text-3xl font-bold text-primary">$2,452.50</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-8 border-t-2 border-gray-200">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-12 py-4 border-2 border-gray-300 rounded-full font-semibold hover:border-primary hover:bg-primary/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-12 py-4 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all shadow-lg shadow-primary/30"
            >
              <Printer className="w-5 h-5" />
              Print Order
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={cancelSave}>
          <div className="bg-white rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Confirm Changes</h3>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to save these changes?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={cancelSave}
                className="px-8 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-primary transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmSave}
                className="px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

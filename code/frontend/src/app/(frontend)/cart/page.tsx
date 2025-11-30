'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Edit2, X } from 'lucide-react'
import { useCart, CartItem } from '@/context/CartContext'
import { useSalespersonAuth } from '@/context/SalespersonAuthContext'
import { useLanguage } from '@/context/LanguageContext'
import { useToast } from '@/components/common/ToastContainer'
import { parseBilingualText } from '@/lib/i18nHelper'
import DatePicker from '@/components/common/DatePicker'

// 编辑模态框类型
type EditSection = 'category' | 'basic' | 'packaging' | 'notes' | null

export default function CartPage() {
  const router = useRouter()
  const toast = useToast()
  const { items, removeItem, updateQuantity, updateItem, selectedItems, setSelectedItems } = useCart()
  const { isAuthenticated, isLoading } = useSalespersonAuth()
  const { t, language } = useLanguage()

  // 编辑模态框状态
  const [editingItem, setEditingItem] = useState<CartItem | null>(null)
  const [editSection, setEditSection] = useState<EditSection>(null)
  const [editFormData, setEditFormData] = useState<Partial<CartItem>>({})

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.warning('请先登录')
      router.push('/login')
      return
    }

    if (items.length === 0) {
      toast.warning(t('cart.empty'))
      return
    }

    if (selectedItems.length === 0) {
      toast.warning(t('cart.select_at_least_one'))
      return
    }

    router.push('/order-confirmation')
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map(item => item.skuId))
    }
  }

  const toggleItemSelection = (skuId: string) => {
    if (selectedItems.includes(skuId)) {
      setSelectedItems(selectedItems.filter(id => id !== skuId))
    } else {
      setSelectedItems([...selectedItems, skuId])
    }
  }

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      toast.warning(t('cart.select_items_to_delete'))
      return
    }
    selectedItems.forEach(skuId => removeItem(skuId))
    setSelectedItems([])
  }

  // 打开编辑模态框
  const openEditModal = (item: CartItem, section: EditSection) => {
    setEditingItem(item)
    setEditSection(section)
    setEditFormData({
      productCategory: item.productCategory,
      price: item.price,
      customerProductCode: item.customerProductCode,
      untaxedLocalCurrency: item.untaxedLocalCurrency,
      expectedDeliveryDate: item.expectedDeliveryDate,
      packingQuantity: item.packingQuantity,
      cartonQuantity: item.cartonQuantity,
      packagingMethod: item.packagingMethod,
      paperCardCode: item.paperCardCode,
      washLabelCode: item.washLabelCode,
      outerCartonCode: item.outerCartonCode,
      cartonSpecification: item.cartonSpecification,
      volume: item.volume,
      supplierNote: item.supplierNote,
      summary: item.summary,
    })
  }

  // 关闭编辑模态框
  const closeEditModal = () => {
    setEditingItem(null)
    setEditSection(null)
    setEditFormData({})
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingItem) {
      updateItem(editingItem.skuId, editFormData)
      toast.success(language === 'zh' ? '已保存' : 'Saved')
    }
    closeEditModal()
  }

  // 更新编辑表单字段
  const updateEditField = (field: keyof CartItem, value: any) => {
    setEditFormData(prev => {
      const updated = { ...prev, [field]: value }
      // 如果修改的是箱规，自动计算体积
      if (field === 'cartonSpecification' && typeof value === 'string') {
        const match = value.match(/^(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*(?:cm)?$/i)
        if (match) {
          const [, length, width, height] = match
          const volumeCm3 = parseFloat(length) * parseFloat(width) * parseFloat(height)
          const volumeM3 = volumeCm3 / 1000000
          updated.volume = Math.round(volumeM3 * 1000000) / 1000000
        }
      }
      // 如果修改装箱数，自动计算箱数
      if (field === 'packingQuantity' && typeof value === 'number' && value > 0 && editingItem) {
        updated.cartonQuantity = Math.ceil(editingItem.quantity / value)
      }
      return updated
    })
  }

  // 获取产品类别显示文本
  const getCategoryLabel = (category?: string) => {
    if (!category) return '-'
    const labels: Record<string, { zh: string, en: string }> = {
      'new': { zh: '新产品', en: 'New Product' },
      'old': { zh: '老产品', en: 'Old Product' },
      'sample': { zh: '样品需求', en: 'Sample Request' },
    }
    return labels[category] ? (language === 'zh' ? labels[category].zh : labels[category].en) : '-'
  }

  // 格式化显示值
  const formatValue = (value: any, suffix?: string) => {
    if (value === undefined || value === null || value === '') return '-'
    return suffix ? `${value}${suffix}` : value
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">{t('cart.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-100 pt-36 pb-8">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              {t('cart.title')}
            </h1>
            <p className="mt-3 text-gray-600 ml-15">
              {items.length > 0 ? `${items.length} ${items.length > 1 ? t('cart.items') : t('cart.item')}` : t('cart.empty')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 pb-12 -mt-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('cart.empty')}</h2>
              <p className="text-gray-600 mb-8">{t('cart.empty_desc')}</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all transform hover:scale-105 shadow-lg shadow-primary/30"
              >
                {t('cart.browse')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Select All and Bulk Actions */}
              <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === items.length}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {t('cart.select_all')} ({selectedItems.length}/{items.length})
                  </span>
                </div>
                <button
                  onClick={handleDeleteSelected}
                  disabled={selectedItems.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('cart.delete_selected')}
                </button>
              </div>

              {items.map((item) => (
                <div
                  key={item.skuId}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                    selectedItems.includes(item.skuId)
                      ? 'ring-2 ring-primary ring-opacity-50'
                      : 'hover:shadow-md'
                  }`}
                >
                  {/* 商品基本信息 */}
                  <div className="p-6">
                    <div className="flex gap-6">
                      <div className="flex items-start pt-2">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.skuId)}
                          onChange={() => toggleItemSelection(item.skuId)}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </div>

                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 border border-gray-200"
                           style={{
                             backgroundImage: `url(${item.mainImage})`,
                             backgroundSize: 'cover',
                             backgroundPosition: 'center'
                           }}>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {parseBilingualText(item.groupName, language)}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {language === 'zh' ? '品号' : 'Product Code'}: <span className="font-mono font-semibold text-primary">{item.sku}</span>
                            </p>
                            {item.productName && (
                              <p className="text-sm text-gray-700 mt-2">
                                <span className="font-semibold">{language === 'zh' ? '品名' : 'Product Name'}:</span>{' '}
                                {language === 'zh' ? item.productName : (item.productNameEn || item.productName)}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.skuId)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title={t('cart.remove')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* 货品规格 */}
                        {((language === 'zh' && item.specification) || (language === 'en' && item.specificationEn)) && (
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 mb-1 font-semibold">
                              {language === 'zh' ? '货品规格' : 'Specifications'}:
                            </p>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                              {language === 'zh' ? item.specification : (item.specificationEn || item.specification)}
                            </div>
                          </div>
                        )}

                        {/* 附加属性 */}
                        {item.optionalAttributes && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">
                              {language === 'zh' ? '附加属性' : 'Optional Attributes'}:
                            </p>
                            <div className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-900 inline-block">
                              {language === 'zh' ? item.optionalAttributes.nameZh : (item.optionalAttributes.nameEn || item.optionalAttributes.nameZh)}
                            </div>
                          </div>
                        )}

                        {/* 数量控制 */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{language === 'zh' ? '数量' : 'Quantity'}:</span>
                          <button
                            onClick={() => updateQuantity(item.skuId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const val = parseInt(e.target.value)
                              if (!isNaN(val) && val >= 1) {
                                updateQuantity(item.skuId, val)
                              }
                            }}
                            min="1"
                            className="w-16 h-8 text-center font-bold text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            onClick={() => updateQuantity(item.skuId, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 订单明细信息 */}
                  <div className="border-t border-gray-100">
                    {/* 产品类别 */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-gray-700">{language === 'zh' ? '产品类别' : 'Category'}:</span>
                        <span className="text-sm text-gray-900">{getCategoryLabel(item.productCategory)}</span>
                      </div>
                      <button
                        onClick={() => openEditModal(item, 'category')}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 基本信息 */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-700">{language === 'zh' ? '基本信息' : 'Basic Info'}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-x-3">
                          <span>{language === 'zh' ? '单价' : 'Price'}: {formatValue(item.price, item.price ? '' : '')}</span>
                          <span>|</span>
                          <span>{language === 'zh' ? '客户料号' : 'Customer Code'}: {formatValue(item.customerProductCode)}</span>
                          <span>|</span>
                          <span>{language === 'zh' ? '未税本位币' : 'Untaxed'}: {formatValue(item.untaxedLocalCurrency)}</span>
                          <span>|</span>
                          <span>{language === 'zh' ? '预交日' : 'Delivery'}: {item.expectedDeliveryDate ? item.expectedDeliveryDate.split('T')[0] : '-'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(item, 'basic')}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 包装信息 */}
                    <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-700">📦 {language === 'zh' ? '包装信息' : 'Packaging'}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div className="space-x-3">
                            <span>{language === 'zh' ? '装箱数' : 'Packing'}: {formatValue(item.packingQuantity)}</span>
                            <span>|</span>
                            <span>{language === 'zh' ? '箱数' : 'Cartons'}: {formatValue(item.cartonQuantity)}</span>
                            <span>|</span>
                            <span>{language === 'zh' ? '包装方式' : 'Method'}: {formatValue(item.packagingMethod)}</span>
                          </div>
                          <div className="space-x-3 mt-1">
                            <span>{language === 'zh' ? '箱规' : 'Spec'}: {formatValue(item.cartonSpecification)}</span>
                            <span>|</span>
                            <span>{language === 'zh' ? '体积' : 'Volume'}: {formatValue(item.volume, item.volume ? ' m³' : '')}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(item, 'packaging')}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 备注信息 */}
                    <div className="px-6 py-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-700">📝 {language === 'zh' ? '备注信息' : 'Notes'}</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>{language === 'zh' ? '厂商备注' : 'Supplier Note'}: {formatValue(item.supplierNote)}</div>
                          <div>{language === 'zh' ? '摘要' : 'Summary'}: {formatValue(item.summary)}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => openEditModal(item, 'notes')}
                        className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('cart.order_summary')}</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'zh' ? '已选商品' : 'Selected Items'}</span>
                    <span className="font-semibold">
                      {selectedItems.reduce((sum, skuId) => {
                        const item = items.find(i => i.skuId === skuId)
                        return sum + (item?.quantity || 0)
                      }, 0)} {t('cart.items')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="block w-full h-14 bg-primary text-white font-bold text-lg rounded-xl hover:bg-primary-dark transition-all transform hover:scale-[1.02] shadow-lg shadow-primary/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {t('cart.proceed_to_confirm')}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <Link
                  href="/products"
                  className="block w-full h-12 mt-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-primary hover:text-primary transition-all text-center leading-[2.75rem]"
                >
                  {t('cart.continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 编辑模态框 */}
      {editingItem && editSection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* 模态框头部 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editSection === 'category' && (language === 'zh' ? '编辑产品类别' : 'Edit Category')}
                {editSection === 'basic' && (language === 'zh' ? '编辑基本信息' : 'Edit Basic Info')}
                {editSection === 'packaging' && (language === 'zh' ? '编辑包装信息' : 'Edit Packaging')}
                {editSection === 'notes' && (language === 'zh' ? '编辑备注信息' : 'Edit Notes')}
              </h2>
              <button
                onClick={closeEditModal}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 模态框内容 */}
            <div className="p-6 space-y-4">
              {/* 产品类别 */}
              {editSection === 'category' && (
                <div className="flex gap-3">
                  {[
                    { value: 'new', labelZh: '新产品', labelEn: 'New Product' },
                    { value: 'old', labelZh: '老产品', labelEn: 'Old Product' },
                    { value: 'sample', labelZh: '样品需求', labelEn: 'Sample Request' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateEditField('productCategory', option.value as 'new' | 'old' | 'sample')}
                      className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all text-sm ${
                        editFormData.productCategory === option.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {language === 'zh' ? option.labelZh : option.labelEn}
                    </button>
                  ))}
                </div>
              )}

              {/* 基本信息 */}
              {editSection === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '单价' : 'Unit Price'}
                    </label>
                    <input
                      type="number"
                      value={editFormData.price ?? ''}
                      onChange={(e) => updateEditField('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '客户料号' : 'Customer Code'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.customerProductCode ?? ''}
                      onChange={(e) => updateEditField('customerProductCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '未税本位币' : 'Untaxed Local Currency'}
                    </label>
                    <input
                      type="number"
                      value={editFormData.untaxedLocalCurrency ?? ''}
                      onChange={(e) => updateEditField('untaxedLocalCurrency', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '预交日' : 'Expected Delivery'}
                    </label>
                    <DatePicker
                      value={editFormData.expectedDeliveryDate ?? ''}
                      onChange={(value) => updateEditField('expectedDeliveryDate', value)}
                    />
                  </div>
                </div>
              )}

              {/* 包装信息 */}
              {editSection === 'packaging' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '装箱数' : 'Packing Qty'}
                    </label>
                    <input
                      type="number"
                      value={editFormData.packingQuantity ?? ''}
                      onChange={(e) => updateEditField('packingQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '箱数' : 'Carton Qty'}
                    </label>
                    <input
                      type="number"
                      value={editFormData.cartonQuantity ?? ''}
                      onChange={(e) => updateEditField('cartonQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '包装方式' : 'Packaging Method'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.packagingMethod ?? ''}
                      onChange={(e) => updateEditField('packagingMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '纸卡编码' : 'Paper Card Code'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.paperCardCode ?? ''}
                      onChange={(e) => updateEditField('paperCardCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '水洗标编码' : 'Wash Label Code'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.washLabelCode ?? ''}
                      onChange={(e) => updateEditField('washLabelCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '外箱编码' : 'Outer Carton Code'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.outerCartonCode ?? ''}
                      onChange={(e) => updateEditField('outerCartonCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '箱规 (cm)' : 'Carton Spec (cm)'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.cartonSpecification ?? ''}
                      onChange={(e) => updateEditField('cartonSpecification', e.target.value)}
                      placeholder={language === 'zh' ? '例如: 74*44*20' : 'e.g., 74*44*20'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '体积 (m³)' : 'Volume (m³)'}
                    </label>
                    <input
                      type="number"
                      value={editFormData.volume ?? ''}
                      onChange={(e) => updateEditField('volume', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.000001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                </div>
              )}

              {/* 备注信息 */}
              {editSection === 'notes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '厂商备注' : 'Supplier Note'}
                    </label>
                    <textarea
                      value={editFormData.supplierNote ?? ''}
                      onChange={(e) => updateEditField('supplierNote', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '摘要' : 'Summary'}
                    </label>
                    <textarea
                      value={editFormData.summary ?? ''}
                      onChange={(e) => updateEditField('summary', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 模态框底部 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-medium"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium"
              >
                {language === 'zh' ? '保存' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

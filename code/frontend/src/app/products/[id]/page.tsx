'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { mockProductGroups, findSKUByColors } from '@/lib/mockData'
import { ProductGroup, ProductSKU } from '@/types'
import { ShoppingCart, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { t } = useLanguage()
  const { addItem } = useCart()

  const [productGroup, setProductGroup] = useState<ProductGroup | null>(null)
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})
  const [currentSKU, setCurrentSKU] = useState<ProductSKU | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const group = mockProductGroups.find((g) => g.id === productId)
    if (group) {
      setProductGroup(group)

      // Initialize with first SKU's colors
      const firstSKU = group.skus[0]
      const initialColors: Record<string, string> = {}
      Object.entries(firstSKU.colorCombination).forEach(([component, colorInfo]) => {
        initialColors[component] = colorInfo.name
      })
      setSelectedColors(initialColors)
      setCurrentSKU(firstSKU)
    }
  }, [productId])

  useEffect(() => {
    if (productGroup && Object.keys(selectedColors).length > 0) {
      const sku = findSKUByColors(productGroup, selectedColors)
      setCurrentSKU(sku)
    }
  }, [selectedColors, productGroup])

  const handleColorSelect = (component: string, colorName: string) => {
    setSelectedColors((prev) => ({
      ...prev,
      [component]: colorName,
    }))
  }

  const handleAddToCart = () => {
    if (currentSKU && productGroup) {
      addItem({
        skuId: currentSKU.id,
        sku: currentSKU.sku,
        groupName: productGroup.groupName,
        translationKey: productGroup.translationKey,
        colorCombination: currentSKU.colorCombination,
        quantity: quantity,
        price: currentSKU.price,
        mainImage: currentSKU.mainImage,
      })
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  if (!productGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('detail.product_not_found')}</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            {t('detail.back_to_products')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            {t('nav.products')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {productGroup.translationKey ? t(productGroup.translationKey) : productGroup.groupName}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center"
                 style={{
                   backgroundImage: currentSKU ? `url(${currentSKU.mainImage})` : 'none',
                   backgroundSize: 'cover',
                   backgroundPosition: 'center'
                 }}>
              {!currentSKU && (
                <div className="text-center text-gray-400 p-12">
                  <svg className="w-40 h-40 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">{productGroup.groupName}</p>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-4">
              {[
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-xhSQMIXCEToPuBIcgJtoEhRyFOe3go7GPbACC5duLevFYOO0vNn-TtoCja7pky40tgPS9KzdFnJDakuDg-YIdwVUy8_xFG6eDySJUr_IkFkq7j6ect3gAHPg3ca0YeZBWsdUutEvOzU0bi0aPxAVI6K-igFBtHPb-hkRzKUsyijzulrD1EBRnUCg6OrNYig7_onhy7Cez4gb7FN6Life15OLW58Vk5sRoMDzLOO_3YStL7D5_tYGEkxN5n-JrNGIqFn3FyeiB1g',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuBvR4ZS6iXxPFjf_owlhSPtxe5rlS3z6hvFKe58cv5BSORe-WqryNsuUX_Ne8neN4gnS5YUYF57Kpw4fgtLFvpdeMCyaQ7EShr8TANoGQDzKAWI1g5vXgFc8kSegkeQJKZ70F2cv_jf5loG3XNcmwWVgpGa4gneqxJW7baf_rbz21PvoQWOTf_JjdUV8u6OuSMgKZJoL4xWM9xjckJwXmc8kJgjKjXhJvooJrhFFhBXBC4GTBR5obA_oAOsSRNjWKAMpOOHO9HAwj_8'
              ].map((imageUrl, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:border-primary transition-colors"
                  style={{
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {productGroup.translationKey ? t(productGroup.translationKey) : productGroup.groupName}
              </h1>
              <p className="text-lg text-gray-600">
                {productGroup.descriptionKey ? t(productGroup.descriptionKey) : productGroup.description}
              </p>
            </div>

            {/* Current SKU Info */}
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t('detail.current_sku')}</span>
                {currentSKU ? (
                  <span className="text-xl font-bold text-primary">{currentSKU.sku}</span>
                ) : (
                  <span className="text-sm text-red-500">{t('detail.out_of_stock')}</span>
                )}
              </div>
              {currentSKU && (
                <div className="text-3xl font-bold text-gray-900">
                  ￥{currentSKU.price.toFixed(2)}
                </div>
              )}
            </div>

            {/* Color Selector */}
            <div className="space-y-6 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900">{t('detail.select_colors')}</h3>

              {Object.entries(productGroup.availableColors).map(([component, colors]) => (
                <div key={component} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">{component}</span>
                    <span className="text-sm text-primary font-medium">
                      {selectedColors[component]}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {colors.map((color) => {
                      const isSelected = selectedColors[component] === color.name
                      return (
                        <button
                          key={color.id}
                          onClick={() => handleColorSelect(component, color.name)}
                          className={`relative group transition-all duration-200 ${
                            isSelected ? 'scale-110' : 'hover:scale-105'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                              isSelected
                                ? 'border-primary shadow-lg shadow-primary/30'
                                : 'border-gray-200 group-hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          />
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white drop-shadow-lg" strokeWidth={3} />
                            </div>
                          )}
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            {color.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">{t('detail.quantity')}</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all font-bold text-gray-700"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-all font-bold text-gray-700"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!currentSKU}
                className={`w-full h-14 rounded-xl font-bold text-white text-lg transition-all transform ${
                  currentSKU
                    ? addedToCart
                      ? 'bg-green-500 scale-95'
                      : 'bg-primary hover:bg-primary-dark hover:scale-[1.02] shadow-lg shadow-primary/30'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-6 h-6" />
                    {t('detail.added_to_cart')}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    {t('detail.add_to_cart')}
                  </span>
                )}
              </button>

              <Link
                href="/cart"
                className="block w-full h-14 rounded-xl border-2 border-primary text-primary font-bold text-lg hover:bg-primary/5 transition-all flex items-center justify-center"
              >
                {t('detail.buy_now')}
              </Link>
            </div>

            {/* Product Details */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">{t('detail.product_details')}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>{t('detail.components')}:</strong> {productGroup.baseComponents.join(' + ')}</p>
                <p><strong>{t('detail.available_combinations')}:</strong> {productGroup.skus.length} {t('detail.options')}</p>
                <p><strong>{t('detail.status')}:</strong> {productGroup.status === 'active' ? t('detail.in_stock') : t('detail.out_of_stock')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

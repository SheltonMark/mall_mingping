'use client'

import Link from 'next/link'
import { useState } from 'react'
import { mockProductGroups, mockCategories, mockMaterials } from '@/lib/mockData'
import { ChevronDown, Grid3x3, List, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ProductsPage() {
  const { t } = useLanguage()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 })
  const [addedItem, setAddedItem] = useState<string | null>(null)
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent, productGroup: typeof mockProductGroups[0]) => {
    e.preventDefault()

    const defaultSKU = productGroup.skus[0]

    addItem({
      skuId: defaultSKU.skuId,
      sku: defaultSKU.sku,
      groupName: productGroup.groupName,
      translationKey: productGroup.translationKey,
      colorCombination: defaultSKU.colorCombination || {},
      quantity: 1,
      price: defaultSKU.price,
      mainImage: defaultSKU.mainImage,
    })

    // Show feedback
    setAddedItem(productGroup.id)
    setTimeout(() => setAddedItem(null), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            {t('nav.products')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('products.breadcrumb')}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Filtering Sidebar */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="sticky top-32">
              <h3 className="text-lg font-bold mb-8 text-gray-900">{t('products.filters')}</h3>
              <div className="space-y-10">
                {/* Categories */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('products.categories')}</h4>
                  <ul className="space-y-3 text-sm">
                    {mockCategories.map((category) => (
                      <li key={category.id}>
                        <a className="text-gray-600 hover:text-primary transition-colors cursor-pointer" href="#">
                          {category.translationKey ? t(category.translationKey) : category.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('products.price_range')}</h4>
                  <div className="relative pt-1">
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
                      <div
                        className="absolute h-2 bg-primary rounded-lg"
                        style={{
                          left: `${(priceRange.min / 200) * 100}%`,
                          right: `${100 - (priceRange.max / 200) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max - 1) })}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      />
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min + 1) })}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-4 text-gray-600">
                    <span>${priceRange.min}</span>
                    <span>${priceRange.max}</span>
                  </div>
                </div>

                {/* Color Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('products.color')}</h4>
                  <div className="flex flex-wrap gap-3">
                    <button className="size-8 rounded-full bg-white border-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark hover:border-primary transition-colors" title="White"></button>
                    <button className="size-8 rounded-full bg-gray-800 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark hover:ring-2 hover:ring-primary transition-all" title="Black"></button>
                    <button className="size-8 rounded-full bg-gray-400 border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark hover:ring-2 hover:ring-primary transition-all" title="Gray"></button>
                    <button className="size-8 rounded-full bg-[#BDB76B] border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background-dark hover:ring-2 hover:ring-primary transition-all" title="Gold"></button>
                  </div>
                </div>

                {/* Material Filter */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('products.material')}</h4>
                  <ul className="space-y-3 text-sm">
                    {mockMaterials.map((material) => (
                      <li key={material.id}>
                        <a className="text-gray-600 hover:text-primary transition-colors cursor-pointer" href="#">
                          {material.translationKey ? t(material.translationKey) : material.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{t('products.title')}</h1>
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select className="appearance-none rounded-lg bg-gray-200/50 dark:bg-gray-800/50 border-transparent focus:ring-2 focus:ring-primary focus:border-transparent py-2 pl-3 pr-8 text-sm">
                    <option>{t('products.sort_popularity')}</option>
                    <option>{t('products.sort_new')}</option>
                    <option>{t('products.sort_price_low')}</option>
                    <option>{t('products.sort_price_high')}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-lg ${
                      view === 'grid'
                        ? 'bg-gray-200/50 dark:bg-gray-800/50 text-primary'
                        : 'text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <Grid3x3 size={20} />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 rounded-lg ${
                      view === 'list'
                        ? 'bg-gray-200/50 dark:bg-gray-800/50 text-primary'
                        : 'text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProductGroups.map((productGroup) => {
                const defaultSKU = productGroup.skus[0]
                const isAdded = addedItem === productGroup.id

                return (
                  <div key={productGroup.id} className="group relative flex flex-col gap-3 pb-3">
                    {/* Product Image */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                      <Link href={`/products/${productGroup.id}`}>
                        <div
                          className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${defaultSKU.mainImage})` }}
                        >
                        </div>
                      </Link>

                      {/* Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, productGroup)}
                        className={`absolute bottom-4 right-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center size-10 rounded-full shadow-lg ${
                          isAdded
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-white hover:bg-primary-dark'
                        }`}
                        title={isAdded ? t('products.added_to_cart') : t('products.add_to_cart')}
                      >
                        <ShoppingCart size={18} />
                      </button>

                      {/* Added Feedback */}
                      {isAdded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
                          <span className="text-white font-semibold text-sm">{t('products.added_message')}</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <Link href={`/products/${productGroup.id}`}>
                      <div>
                        <p className="text-base font-medium hover:text-primary transition-colors">
                          {productGroup.translationKey ? t(productGroup.translationKey) : productGroup.groupName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ￥{defaultSKU.price.toFixed(2)}
                        </p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
              <a className="flex size-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800" href="#">
                <ChevronDown className="rotate-90" size={20} />
              </a>
              <a className="text-sm font-bold leading-normal flex size-10 items-center justify-center text-white rounded-lg bg-primary mx-1" href="#">1</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 mx-1" href="#">2</a>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 mx-1" href="#">3</a>
              <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center rounded-lg mx-1">...</span>
              <a className="text-sm font-normal leading-normal flex size-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 mx-1" href="#">10</a>
              <a className="flex size-10 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800" href="#">
                <ChevronDown className="-rotate-90" size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

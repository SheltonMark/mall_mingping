'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronDown } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { productApi, type ProductGroup, type Category } from '@/lib/publicApi'
import { useToast } from '@/components/common/ToastContainer'
import CustomSelect from '@/components/common/CustomSelect'
import { useRouter } from 'next/navigation'

// 分页配置常量 - 修改此值即可调整每页显示数量
const PRODUCTS_PER_PAGE = 9

export default function ProductsPage() {
  const { t, language } = useLanguage()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [addedItem, setAddedItem] = useState<string | null>(null)
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest')
  const [currentPage, setCurrentPage] = useState(1) // 当前页码
  const { addItem } = useCart()

  // State for API data
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 动态价格范围
  const [maxPrice, setMaxPrice] = useState(200)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200 })

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch groups and categories
        const [groupsRes, categoriesRes] = await Promise.all([
          productApi.getGroups({ limit: 100 }),
          productApi.getCategories(),
        ])

        setProductGroups(groupsRes.data || [])
        setCategories(categoriesRes || [])

        // 动态计算价格最大值
        const prices = (groupsRes.data || []).map(group => Number(group.skus?.[0]?.price || 0))
        const calculatedMaxPrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 200
        setMaxPrice(calculatedMaxPrice)
        setPriceRange({ min: 0, max: calculatedMaxPrice })
      } catch (err: any) {
        console.error('Failed to load products:', err)
        setError(err.message || 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (e: React.MouseEvent, productGroup: ProductGroup) => {
    e.preventDefault()

    // 检查登录状态
    if (!isAuthenticated) {
      toast.warning(t('auth.please_login_first') || '请先登录')
      router.push(`/login?redirect=/products`)
      return
    }

    if (!productGroup.skus || productGroup.skus.length === 0) {
      toast.warning(t('products.no_skus_available'))
      return
    }

    const defaultSKU = productGroup.skus[0]

    // 解析图片
    let mainImage = '/images/placeholder.jpg'
    if (defaultSKU.images) {
      if (Array.isArray(defaultSKU.images) && defaultSKU.images.length > 0) {
        mainImage = defaultSKU.images[0].startsWith('http')
          ? defaultSKU.images[0]
          : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${defaultSKU.images[0]}`
      } else if (typeof defaultSKU.images === 'string') {
        try {
          const imgs = JSON.parse(defaultSKU.images)
          if (Array.isArray(imgs) && imgs.length > 0) {
            mainImage = imgs[0].startsWith('http')
              ? imgs[0]
              : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imgs[0]}`
          }
        } catch (e) {
          console.error('Failed to parse images:', e)
        }
      }
    }

    // 构建颜色组合 - 选择每个组件的第一个配色方案
    // 从productSpec获取组件的双语名称
    const componentInfoMap = new Map<string, { name: string; spec?: string }>()

    if (defaultSKU.productSpec && Array.isArray(defaultSKU.productSpec)) {
      defaultSKU.productSpec.forEach((comp: any) => {
        // 合并组件中英文名称为"中文/English"格式
        const bilingualName = comp.nameEn
          ? `${comp.name}/${comp.nameEn}`
          : comp.name
        componentInfoMap.set(comp.code, {
          name: bilingualName || comp.code,
          spec: comp.spec || ''
        })
      })
    }

    const colorCombination: Record<string, any> = {}
    if (defaultSKU.additionalAttributes && Array.isArray(defaultSKU.additionalAttributes)) {
      defaultSKU.additionalAttributes.forEach((attr: any) => {
        if (attr.colorSchemes && Array.isArray(attr.colorSchemes) && attr.colorSchemes.length > 0) {
          const firstScheme = attr.colorSchemes[0]
          // 从productSpec获取双语组件名称
          const compInfo = componentInfoMap.get(attr.componentCode)

          // Backend enriches both part and color to bilingual format
          // part格式: "布料/Fabric" (enriched by enrichAdditionalAttributesWithParts)
          // color格式: "米色/Beige" (enriched by enrichColorSchemes)
          // 所以我们直接使用即可
          const processedColors = firstScheme.colors.map((colorPart: any) => ({
            ...colorPart,
            part: colorPart.part,
            color: colorPart.color
          }))

          colorCombination[attr.componentCode] = {
            componentName: compInfo?.name || attr.componentName || attr.componentCode,
            schemeName: firstScheme.name,
            colors: processedColors
          }
        }
      })
    }

    addItem({
      skuId: defaultSKU.id,
      sku: defaultSKU.productCode,
      groupName: productGroup.groupNameEn
        ? `${productGroup.groupNameZh}/${productGroup.groupNameEn}`
        : productGroup.groupNameZh,
      productName: defaultSKU.productName,
      productNameEn: defaultSKU.productNameEn,
      specification: defaultSKU.specification,
      specificationEn: defaultSKU.specificationEn,
      optionalAttributes: null,
      colorCombination,
      quantity: 1,
      price: Number(defaultSKU.price) || 0,
      mainImage,
    })

    // Show feedback
    setAddedItem(productGroup.id)
    setTimeout(() => setAddedItem(null), 2000)
    toast.success(t('products.added_message'))
  }

  // Filter product groups by selected category
  const filteredProductGroups = selectedCategoryCode
    ? productGroups.filter(group => {
        // Match by prefix - if prefix starts with category code (e.g., MP007 starts with MP)
        return group.prefix?.startsWith(selectedCategoryCode) || group.categoryCode === selectedCategoryCode
      })
    : productGroups

  // Filter by price range (based on first SKU price)
  const priceFilteredGroups = filteredProductGroups.filter(group => {
    const firstSkuPrice = Number(group.skus?.[0]?.price || 0)
    return firstSkuPrice >= priceRange.min && firstSkuPrice <= priceRange.max
  })

  // Sort filtered products
  const sortedProductGroups = [...priceFilteredGroups].sort((a, b) => {
    if (sortBy === 'newest') {
      // 按 displayOrder 降序 (数值越大越新)
      return (b.displayOrder || 0) - (a.displayOrder || 0)
    } else if (sortBy === 'price_low') {
      // 价格从低到高
      const priceA = a.skus?.[0]?.price || 0
      const priceB = b.skus?.[0]?.price || 0
      return Number(priceA) - Number(priceB)
    } else if (sortBy === 'price_high') {
      // 价格从高到低
      const priceA = a.skus?.[0]?.price || 0
      const priceB = b.skus?.[0]?.price || 0
      return Number(priceB) - Number(priceA)
    }
    return 0
  })

  // 分页计算
  const totalPages = Math.ceil(sortedProductGroups.length / PRODUCTS_PER_PAGE)
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
  const endIndex = startIndex + PRODUCTS_PER_PAGE
  const currentProducts = sortedProductGroups.slice(startIndex, endIndex)

  // Handle category click
  const handleCategoryClick = (categoryCode: string) => {
    if (selectedCategoryCode === categoryCode) {
      setSelectedCategoryCode(null) // Deselect if clicking same category
    } else {
      setSelectedCategoryCode(categoryCode)
    }
    setCurrentPage(1) // 切换分类时重置到第1页
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' }) // 滚动到顶部
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('products.loading')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('products.load_failed')}</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-32">
      <div className="max-w-[1440px] mx-auto px-6 pb-8">
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
          {/* Filtering Sidebar - 排序框移到顶部 */}
          <aside className="w-full md:w-56 lg:w-64 shrink-0">
            <div className="sticky top-32">
              <h3 className="text-lg font-bold mb-8 text-gray-900">{t('products.filters')}</h3>
              <div className="space-y-14">
                {/* Sort Dropdown - 移到顶部 */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('home.hero.title').includes('Future') ? 'Sort' : '排序'}</h4>
                  <CustomSelect
                    options={[
                      { value: 'newest', label: t('products.sort_new') },
                      { value: 'price_low', label: t('products.sort_price_low') },
                      { value: 'price_high', label: t('products.sort_price_high') },
                    ]}
                    value={sortBy}
                    onChange={(value) => setSortBy(value as 'newest' | 'price_low' | 'price_high')}
                    className="w-full"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900">{t('products.categories')}</h4>
                  <ul className="space-y-4 text-sm">
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => handleCategoryClick(category.code)}
                          className={`text-left w-full transition-colors cursor-pointer ${
                            selectedCategoryCode === category.code
                              ? 'text-primary font-semibold'
                              : 'text-gray-600 hover:text-primary'
                          }`}
                        >
                          {language === 'en' ? category.nameEn : category.nameZh}
                        </button>
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
                          left: `${(priceRange.min / maxPrice) * 100}%`,
                          right: `${100 - (priceRange.max / maxPrice) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: Math.min(Number(e.target.value), priceRange.max - 1) })}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      />
                      <input
                        type="range"
                        min="0"
                        max={maxPrice}
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: Math.max(Number(e.target.value), priceRange.min + 1) })}
                        className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-sm mt-4 text-gray-600">
                    <span>¥{priceRange.min}</span>
                    <span>¥{priceRange.max}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid - 删除标题行，保留移动端排序 */}
          <div className="flex-1">
            {/* 仅在移动端显示排序下拉框 */}
            <div className="md:hidden mb-6">
              <CustomSelect
                options={[
                  { value: 'newest', label: t('products.sort_new') },
                  { value: 'price_low', label: t('products.sort_price_low') },
                  { value: 'price_high', label: t('products.sort_price_high') },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as 'newest' | 'price_low' | 'price_high')}
                className="w-full"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    {selectedCategoryCode
                      ? t('products.no_products_in_category')
                      : t('products.no_products_available')}
                  </p>
                </div>
              ) : (
                currentProducts.map((productGroup) => {
                  if (!productGroup.skus || productGroup.skus.length === 0) {
                    return null
                  }

                  const defaultSKU = productGroup.skus[0]
                  const isAdded = addedItem === productGroup.id

                  // Extract first image from first SKU's images array
                  let thumbnailImage = '/images/placeholder.jpg'
                  if (defaultSKU.images) {
                    try {
                      const imgs = typeof defaultSKU.images === 'string' ? JSON.parse(defaultSKU.images) : defaultSKU.images
                      if (Array.isArray(imgs) && imgs.length > 0) {
                        const firstImg = imgs[0]
                        thumbnailImage = firstImg.startsWith('http') ? firstImg : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${firstImg}`
                      }
                    } catch (e) {
                      console.error('Failed to parse images:', e)
                    }
                  }

                  return (
                    <div key={productGroup.id} className="group relative flex flex-col gap-3 pb-3">
                      {/* Product Image */}
                      <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800">
                        <Link href={`/products/${productGroup.id}`}>
                          <div
                            className="w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-300 group-hover:scale-105"
                            style={{ backgroundImage: `url(${thumbnailImage})` }}
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
                            {language === 'zh' ? productGroup.groupNameZh : (productGroup.groupNameEn || productGroup.groupNameZh)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ￥{Number(defaultSKU.price).toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination - 真实分页功能 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
                {/* 上一页 */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <ChevronDown className="rotate-90" size={20} />
                </button>

                {/* 页码 */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // 显示逻辑：第1页、最后1页、当前页及其前后1页
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`text-sm font-${page === currentPage ? 'bold' : 'normal'} leading-normal flex size-10 items-center justify-center rounded-lg mx-1 transition-colors ${
                          page === currentPage
                            ? 'text-white bg-primary'
                            : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    // 显示省略号
                    return (
                      <span key={page} className="text-sm font-normal leading-normal flex size-10 items-center justify-center rounded-lg mx-1">
                        ...
                      </span>
                    )
                  }
                  return null
                })}

                {/* 下一页 */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex size-10 items-center justify-center rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  <ChevronDown className="-rotate-90" size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

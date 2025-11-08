'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Check, Play, Image as ImageIcon, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/common/ToastContainer'
import { productApi, type ProductGroup, type ProductSku } from '@/lib/publicApi'
import { parseColorPart } from '@/lib/pantoneColors'

// 解析部件化颜色属性 (Apple风格渐进式)
interface ComponentColor {
  componentCode: string // [A], [B], [C]
  componentName: string // 拖把杆, 刷头, 抹布
  colorSchemes: string[][] // [["喷塑:3C冷灰", "塑件:10C冷灰"], ["喷塑:黑色", "塑件:白色"]]
}

function parseComponentColors(additionalAttributes: string | null): ComponentColor[] {
  if (!additionalAttributes) return []

  const components: ComponentColor[] = []
  // 匹配格式: [A] 部件名 规格 颜色方案1 | 颜色方案2; [B] ...
  const componentRegex = /\[([A-Z])\]\s*([^\s]+)[^;]*?([^;]+);?/g

  let match
  while ((match = componentRegex.exec(additionalAttributes)) !== null) {
    const componentCode = match[1]
    const componentName = match[2]
    const colorPart = match[3]

    // 提取颜色方案 (用 | 分割)
    const schemes = colorPart.split('|').map(scheme => {
      // 提取每个方案中的所有颜色部分 (例如: "喷塑:3C冷灰+塑件:10C冷灰")
      const parts = scheme.split('+').map(p => p.trim()).filter(Boolean)
      return parts
    }).filter(scheme => scheme.length > 0)

    if (schemes.length > 0) {
      components.push({
        componentCode,
        componentName,
        colorSchemes: schemes
      })
    }
  }

  return components
}

type ViewMode = 'gallery' | 'video' | 'params'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { t, language } = useLanguage()
  const { addItem } = useCart()
  const toast = useToast()

  const [productGroup, setProductGroup] = useState<ProductGroup | null>(null)
  const [selectedSku, setSelectedSku] = useState<ProductSku | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showSpecHint, setShowSpecHint] = useState(false) // 显示规格提示

  // 图片状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])

  // Apple风格渐进式颜色选择状态
  const [componentColors, setComponentColors] = useState<ComponentColor[]>([])
  const [selectedColorSchemes, setSelectedColorSchemes] = useState<number[]>([]) // 每个部件选择的方案索引
  const [visibleComponentIndex, setVisibleComponentIndex] = useState(-1) // 当前可见的部件索引 (-1表示未开始)

  // 视图模式: gallery(图集) / video(视频) / params(参数)
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productApi.getGroup(productId)
        setProductGroup(data)

        // 不自动选择规格，但加载第一个规格的图片、视频用于展示
        if (data.skus && data.skus.length > 0) {
          const firstSku = data.skus[0]

          // 解析图片 (1-5张)
          let parsedImages: string[] = []
          if (firstSku.images) {
            if (Array.isArray(firstSku.images)) {
              parsedImages = firstSku.images.slice(0, 5).map(img =>
                img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
              )
            } else if (typeof firstSku.images === 'string') {
              try {
                const imgs = JSON.parse(firstSku.images)
                if (Array.isArray(imgs)) {
                  parsedImages = imgs.slice(0, 5).map(img =>
                    img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
                  )
                }
              } catch (e) {
                console.error('Failed to parse images:', e)
              }
            }
          }
          setImages(parsedImages)
        }
      } catch (err: any) {
        console.error('Failed to load product:', err)
        setError(err.message || 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSkuSelect = (sku: ProductSku) => {
    setSelectedSku(sku)
    setCurrentImageIndex(0)
    setViewMode('gallery')

    // 解析图片 (1-5张)
    let parsedImages: string[] = []
    if (sku.images) {
      // Prisma已经自动解析JSON，所以images可能是数组或字符串
      if (Array.isArray(sku.images)) {
        // 添加服务器URL前缀
        parsedImages = sku.images.slice(0, 5).map(img =>
          img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
        )
      } else if (typeof sku.images === 'string') {
        try {
          const imgs = JSON.parse(sku.images)
          if (Array.isArray(imgs)) {
            parsedImages = imgs.slice(0, 5).map(img =>
              img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
            )
          }
        } catch (e) {
          console.error('Failed to parse images:', e)
        }
      }
    }
    setImages(parsedImages)

    // 解析部件颜色 - 现在数据库存储的是结构化对象
    let components: ComponentColor[] = []
    if (sku.additionalAttributes) {
      if (typeof sku.additionalAttributes === 'string') {
        // 字符串格式（旧数据）
        components = parseComponentColors(sku.additionalAttributes)
      } else if (Array.isArray(sku.additionalAttributes)) {
        // 结构化对象格式（新数据）
        components = sku.additionalAttributes.map((comp: any) => ({
          componentCode: comp.componentCode,
          componentName: comp.componentCode, // 暂时使用代码作为名称
          colorSchemes: comp.colorOptions.map((option: any) =>
            option.colors.map((c: any) => `${c.part}:${c.color}`)
          )
        }))
      }
    }
    setComponentColors(components)
    setSelectedColorSchemes([])

    // 如果有部件颜色，延迟300ms后显示第一个部件
    if (components.length > 0) {
      setTimeout(() => {
        setVisibleComponentIndex(0)
      }, 300)
    } else {
      setVisibleComponentIndex(-1)
    }
  }

  // 处理部件颜色方案选择
  const handleColorSchemeSelect = (componentIndex: number, schemeIndex: number) => {
    const newSchemes = [...selectedColorSchemes]
    newSchemes[componentIndex] = schemeIndex
    setSelectedColorSchemes(newSchemes)

    // 如果还有下一个部件，延迟300ms后显示
    if (componentIndex < componentColors.length - 1) {
      setTimeout(() => {
        setVisibleComponentIndex(componentIndex + 1)
      }, 300)
    }
  }

  const handleAddToCart = () => {
    if (!selectedSku || !productGroup) {
      toast.error('请先选择规格')
      return
    }

    // 构建颜色组合描述
    const colorCombination: Record<string, any> = {}
    componentColors.forEach((component, index) => {
      const schemeIndex = selectedColorSchemes[index]
      if (schemeIndex !== undefined) {
        colorCombination[component.componentCode] = component.colorSchemes[schemeIndex]
      }
    })

    addItem({
      skuId: selectedSku.id,
      sku: selectedSku.productCode,
      groupName: productGroup.groupNameZh,
      translationKey: '',
      colorCombination,
      quantity: quantity,
      price: Number(selectedSku.price),
      mainImage: images[0] || (productGroup as any).mainImage || '/images/placeholder.jpg',
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    toast.success('已加入购物车')
  }

  const handleBuyNow = () => {
    if (!selectedSku || !productGroup) {
      toast.error('请先选择规格')
      return
    }

    // 准备订单数据 - 使用与购物车相同的 CartItem 结构
    const orderData = {
      items: [{
        skuId: selectedSku.id,
        sku: selectedSku.sku,
        groupName: language === 'zh' ? productGroup.groupNameZh : productGroup.groupNameEn,
        translationKey: productGroup.translationKey,
        colorCombination: selectedSku.colorCombination,
        quantity: quantity,
        price: selectedSku.price,
        mainImage: images[0] || '/images/placeholder.jpg'
      }]
    }

    // 使用 localStorage 临时存储订单数据（比 sessionStorage 更可靠）
    localStorage.setItem('pendingOrder', JSON.stringify(orderData))

    // 使用 router.push 代替 window.location.href 避免状态丢失
    router.push('/order-form?type=buy-now')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !productGroup) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{error || '产品未找到'}</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            返回产品列表
          </Link>
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex] || (productGroup as any).mainImage || '/images/placeholder.jpg'

  return (
    <div className="min-h-screen bg-white pt-32">
      {/* 面包屑导航 - 移到内容区域 */}
      <div className="max-w-[1440px] mx-auto px-6 mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            {t('nav.products')}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {productGroup.groupNameZh}
          </span>
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* 左侧: 图片/视频/参数展示区 - 粘性布局 */}
          <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            {/* 主显示区域 */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
              {viewMode === 'gallery' && (
                <img
                  src={currentImage}
                  alt={selectedSku?.productName || productGroup.groupNameZh}
                  className="w-full h-full object-cover"
                />
              )}

              {viewMode === 'video' && (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  {(() => {
                    // 优先使用SKU的视频，如果没选择规格则使用第一个规格的视频，fallback到共享视频
                    let videoUrl = null;
                    const skuToUse = selectedSku || (productGroup?.skus && productGroup.skus[0])

                    if (skuToUse?.video) {
                      const videoData = typeof skuToUse.video === 'object' ? skuToUse.video :
                        (typeof skuToUse.video === 'string' ? JSON.parse(skuToUse.video) : null);

                      if (videoData?.url) {
                        videoUrl = videoData.url.startsWith('http') ? videoData.url :
                          `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${videoData.url}`;
                      }
                    } else if ((productGroup as any)?.sharedVideo) {
                      videoUrl = (productGroup as any).sharedVideo;
                    }

                    if (videoUrl) {
                      // 判断是YouTube还是本地视频
                      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                        return (
                          <iframe
                            width="100%"
                            height="100%"
                            src={videoUrl.replace('watch?v=', 'embed/')}
                            title="Product Video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        );
                      } else {
                        // 本地视频
                        return (
                          <video
                            className="w-full h-full object-contain"
                            controls
                            src={videoUrl}
                          >
                            您的浏览器不支持视频播放
                          </video>
                        );
                      }
                    } else {
                      return (
                        <div className="text-white text-center">
                          <Play size={48} className="mx-auto mb-4 opacity-50" />
                          <p>暂无视频</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {viewMode === 'params' && (
                <div className="w-full h-full bg-white p-8 overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">产品参数</h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                      <span className="font-semibold">产品系列:</span>
                      <span>{productGroup.prefix}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                      <span className="font-semibold">分类:</span>
                      <span>{productGroup.category?.nameZh} / {productGroup.category?.nameEn}</span>
                    </div>
                    {(() => {
                      // 显示选中的规格，如果没选则显示第一个规格
                      const skuToShow = selectedSku || (productGroup?.skus && productGroup.skus[0])
                      if (!skuToShow) return null

                      return (
                        <>
                          <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                            <span className="font-semibold">品号:</span>
                            <span className="font-mono">{skuToShow.productCode}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                            <span className="font-semibold">品名:</span>
                            <span>{skuToShow.productName}</span>
                          </div>
                          {skuToShow.specification && (
                            <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                              <span className="font-semibold">产品参数:</span>
                              <div className="whitespace-pre-line">{skuToShow.specification}</div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* 缩略图列表 - 4张小图 */}
            {viewMode === 'gallery' && images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(0, 4).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* 视频/图集/参数 切换按钮 */}
            <div className="flex gap-4 justify-center pt-2">
              <button
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'gallery'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon size={20} />
                图集
              </button>
              <button
                onClick={() => setViewMode('video')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'video'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Play size={20} />
                视频
              </button>
              <button
                onClick={() => setViewMode('params')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'params'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText size={20} />
                参数
              </button>
            </div>
          </div>

          {/* 右侧: 产品信息 */}
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {productGroup.groupNameZh}
              </h1>
              {productGroup.groupNameEn && (
                <p className="text-xl text-gray-600">{productGroup.groupNameEn}</p>
              )}
              {productGroup.descriptionZh && (
                <p className="text-lg text-gray-600 mt-4">
                  {productGroup.descriptionZh}
                </p>
              )}
            </div>

            {/* 分类标签和品号 - 同一行，品号右对齐 */}
            <div className="flex items-center justify-between gap-4">
              {productGroup.category && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {t(`category.${productGroup.category.code}`)}
                </span>
              )}
              {selectedSku && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-500">品号:</span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-mono font-semibold border border-gray-300">
                    {selectedSku.productCode}
                  </span>
                </div>
              )}
            </div>

            {/* 规格选择器 */}
            <div className="space-y-4 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900">选择规格 *</h3>
              <div className="grid grid-cols-1 gap-3">
                {productGroup.skus.map((sku) => (
                  <button
                    key={sku.id}
                    onClick={() => handleSkuSelect(sku)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedSku?.id === sku.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {/* 主标题 (优先使用title，fallback到productName) */}
                        <div className="font-semibold text-gray-900">
                          {sku.title || sku.productName}
                        </div>
                        {/* 副标题 (可选) */}
                        {sku.subtitle && (
                          <div className="text-sm text-gray-600 mt-1">{sku.subtitle}</div>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-primary ml-4">
                        ¥{Number(sku.price).toFixed(2)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择器 - Apple风格渐进式 (只在选择规格后显示) */}
            {selectedSku && componentColors.length > 0 && (
              <div className="space-y-6 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900">选择颜色</h3>

                {/* 依次显示每个部件的颜色选择器 */}
                <AnimatePresence>
                  {componentColors.map((component, componentIndex) => {
                    // 只显示到当前可见索引为止的部件
                    if (componentIndex > visibleComponentIndex) return null

                    const isSelected = selectedColorSchemes[componentIndex] !== undefined
                    const selectedSchemeIndex = selectedColorSchemes[componentIndex]

                    return (
                      <motion.div
                        key={component.componentCode}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        {/* 部件标题行：部件代码 + 材质组合 + 选中标记 */}
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary font-bold text-xs rounded">
                            [{component.componentCode}]
                          </span>

                          {/* 材质组合显示 - 从第一个颜色方案中提取 */}
                          {component.colorSchemes.length > 0 && component.colorSchemes[0].length > 0 && (
                            <span className="text-xs text-gray-500">
                              ({component.colorSchemes[0].map((colorPart, idx) => {
                                const parsed = parseColorPart(colorPart.trim())
                                return parsed.material
                              }).filter((m, idx, arr) => arr.indexOf(m) === idx).join(' + ')})
                            </span>
                          )}

                          {isSelected && (
                            <Check size={18} className="text-green-600 ml-auto" />
                          )}
                        </div>

                        {/* 颜色方案按钮 - 只显示颜色圆圈 */}
                        <div className="flex flex-wrap gap-3">
                          {component.colorSchemes.map((scheme, schemeIndex) => {
                            const isThisSelected = selectedSchemeIndex === schemeIndex

                            return (
                              <button
                                key={schemeIndex}
                                onClick={() => handleColorSchemeSelect(componentIndex, schemeIndex)}
                                className="group relative"
                              >
                                {/* 颜色圆圈组合 */}
                                <div className="flex gap-1.5">
                                  {/* 每个颜色部分显示为一个小圆圈 */}
                                  {scheme.map((colorPart, partIndex) => {
                                    // 使用新的解析函数提取材质、潘通色号和颜色
                                    const parsed = parseColorPart(colorPart.trim())
                                    const hexColor = parsed.hex

                                    return (
                                      <div
                                        key={partIndex}
                                        className={`w-6 h-6 rounded-full shadow-sm transition-all ${
                                          isThisSelected
                                            ? 'ring-2 ring-primary ring-offset-1'
                                            : 'hover:scale-110'
                                        }`}
                                        style={{
                                          backgroundColor: hexColor,
                                          border: hexColor === '#FFFFFF' ? '1px solid #E5E7EB' : 'none'
                                        }}
                                        title={`${parsed.material} ${parsed.description}`.trim()}
                                      ></div>
                                    )
                                  })}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* 数量选择器 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium w-20">数量:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center text-xl font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-10 text-center text-lg font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center text-xl font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 加入购物车按钮 */}
              <div className="relative">
                <button
                  onClick={handleAddToCart}
                  onMouseEnter={() => {
                    if (!selectedSku && !addedToCart) {
                      setShowSpecHint(true)
                      setTimeout(() => setShowSpecHint(false), 2000)
                    }
                  }}
                  disabled={!selectedSku || addedToCart}
                  className={`w-full h-14 rounded-xl font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                    addedToCart
                      ? 'bg-green-500'
                      : 'bg-primary hover:bg-primary-dark'
                  } disabled:opacity-50 ${!selectedSku ? 'cursor-default' : ''}`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={24} />
                      已加入购物车
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={24} />
                      加入购物车
                    </>
                  )}
                </button>
                {showSpecHint && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                    请先选择规格
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
                  </div>
                )}
              </div>

              {/* 立即购买按钮 */}
              <div className="relative">
                <button
                  onClick={handleBuyNow}
                  onMouseEnter={() => {
                    if (!selectedSku) {
                      setShowSpecHint(true)
                      setTimeout(() => setShowSpecHint(false), 2000)
                    }
                  }}
                  disabled={!selectedSku}
                  className={`w-full h-14 rounded-xl font-bold text-primary text-lg transition-all flex items-center justify-center gap-3 border-2 border-primary hover:bg-primary/5 disabled:opacity-50 ${!selectedSku ? 'cursor-default' : ''}`}
                >
                  立即购买
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

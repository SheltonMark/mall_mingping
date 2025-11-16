'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Check, Play, Image as ImageIcon, FileText } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/common/ToastContainer'
import { productApi, type ProductGroup, type ProductSku } from '@/lib/publicApi'
import IOSPicker from '@/components/common/IOSPicker'

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
  const [selectedAttribute, setSelectedAttribute] = useState<{nameZh: string, nameEn: string} | null>(null)
  const [selectedAttributeDisplay, setSelectedAttributeDisplay] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showSpecHint, setShowSpecHint] = useState(false)

  // 图片状态
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])

  // 视图模式
  const [viewMode, setViewMode] = useState<ViewMode>('gallery')

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await productApi.getGroup(productId)
        setProductGroup(data)

        // 加载第一个SKU的图片用于展示
        if (data.skus && data.skus.length > 0) {
          const firstSku = data.skus[0]
          let parsedImages: string[] = []

          if (firstSku.images) {
            if (Array.isArray(firstSku.images)) {
              parsedImages = firstSku.images.map(img =>
                img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
              )
            } else if (typeof firstSku.images === 'string') {
              try {
                const imgs = JSON.parse(firstSku.images)
                if (Array.isArray(imgs)) {
                  parsedImages = imgs.map(img =>
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

  // 自动选中第一个品名(SKU)
  useEffect(() => {
    if (productGroup?.skus && productGroup.skus.length > 0 && !selectedSku) {
      const firstSku = productGroup.skus[0]
      setSelectedSku(firstSku)

      // 同时自动选中第一个附加属性（如果有）
      if (productGroup?.optionalAttributes && productGroup.optionalAttributes.length > 0) {
        const firstAttr = productGroup.optionalAttributes[0]
        setSelectedAttribute(firstAttr)
        setSelectedAttributeDisplay(language === 'zh' ? firstAttr.nameZh : (firstAttr.nameEn || firstAttr.nameZh))
      }
    }
  }, [productGroup, selectedSku, language])

  // 处理品名选择
  const handleSkuSelect = (displayName: string) => {
    // 根据显示的名称（中文或英文）查找对应的SKU
    const sku = productGroup?.skus.find(s => {
      const skuDisplay = language === 'zh' ? s.productName : (s.productNameEn || s.productName)
      return skuDisplay === displayName
    })
    if (!sku) return

    setSelectedSku(sku)
    setCurrentImageIndex(0)
    setViewMode('gallery')

    // 自动选中第一个附加属性（如果有）
    if (productGroup?.optionalAttributes && productGroup.optionalAttributes.length > 0) {
      const firstAttr = productGroup.optionalAttributes[0]
      setSelectedAttribute(firstAttr)
      setSelectedAttributeDisplay(language === 'zh' ? firstAttr.nameZh : (firstAttr.nameEn || firstAttr.nameZh))
    } else {
      setSelectedAttribute(null)
      setSelectedAttributeDisplay('')
    }

    // 解析图片
    let parsedImages: string[] = []
    if (sku.images) {
      if (Array.isArray(sku.images)) {
        parsedImages = sku.images.map(img =>
          img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${img}`
        )
      } else if (typeof sku.images === 'string') {
        try {
          const imgs = JSON.parse(sku.images)
          if (Array.isArray(imgs)) {
            parsedImages = imgs.map(img =>
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

  // 处理附加属性选择
  const handleAttributeSelect = (displayValue: string) => {
    setSelectedAttributeDisplay(displayValue)

    // 从产品组的原始数组中找到对应的双语对象
    const optionalAttributesRaw = productGroup?.optionalAttributes && Array.isArray(productGroup.optionalAttributes)
      ? productGroup.optionalAttributes
      : []

    const selectedAttr = optionalAttributesRaw.find((attr: any) => {
      const attrDisplay = language === 'zh' ? attr.nameZh : (attr.nameEn || attr.nameZh)
      return attrDisplay === displayValue
    })

    setSelectedAttribute(selectedAttr || null)
  }

  const handleAddToCart = () => {
    if (!selectedSku || !productGroup) {
      toast.error(language === 'zh' ? '请先选择品名' : 'Please select a product name first')
      return
    }

    addItem({
      skuId: selectedSku.id,
      sku: selectedSku.productCode,
      groupName: productGroup.groupNameEn
        ? `${productGroup.groupNameZh}/${productGroup.groupNameEn}`
        : productGroup.groupNameZh,
      productName: selectedSku.productName,
      productNameEn: selectedSku.productNameEn,
      specification: selectedSku.specification,
      specificationEn: selectedSku.specificationEn,
      optionalAttributes: selectedAttribute,
      colorCombination: selectedAttribute ? { attribute: selectedAttribute } : {},
      quantity: quantity,
      price: Number(selectedSku.price),
      mainImage: images[0] || (productGroup as any).mainImage || '/images/placeholder.jpg',
    })

    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
    toast.success(language === 'zh' ? '已加入购物车' : 'Added to cart')
  }

  const handleBuyNow = () => {
    if (!selectedSku || !productGroup) {
      toast.error(language === 'zh' ? '请先选择品名' : 'Please select a product name first')
      return
    }

    const orderData = {
      items: [{
        skuId: selectedSku.id,
        sku: selectedSku.productCode,
        groupName: `${productGroup.groupNameZh}/${productGroup.groupNameEn}`,
        productName: selectedSku.productName,
        productNameEn: selectedSku.productNameEn,
        specification: selectedSku.specification,
        specificationEn: selectedSku.specificationEn,
        optionalAttributes: selectedAttribute,
        colorCombination: selectedAttribute ? { attribute: selectedAttribute } : {},
        quantity: quantity,
        price: selectedSku.price,
        mainImage: images[0] || '/images/placeholder.jpg'
      }]
    }

    sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))
    router.push('/order-form?type=buy-now')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'zh' ? '加载中...' : 'Loading...'}</p>
        </div>
      </div>
    )
  }

  if (error || !productGroup) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{error || (language === 'zh' ? '产品未找到' : 'Product not found')}</p>
          <Link href="/products" className="mt-4 inline-block text-primary hover:underline">
            {language === 'zh' ? '返回产品列表' : 'Back to Products'}
          </Link>
        </div>
      </div>
    )
  }

  const currentImage = images[currentImageIndex] || (productGroup as any).mainImage || '/images/placeholder.jpg'
  // 品名选择器选项 - 根据语言显示
  const skuOptions = productGroup.skus.map(sku =>
    language === 'zh' ? sku.productName : (sku.productNameEn || sku.productName)
  )

  // 提取附加属性并转换为双语数组 - 从产品组获取，不是SKU
  const optionalAttributesRaw = productGroup.optionalAttributes && Array.isArray(productGroup.optionalAttributes)
    ? productGroup.optionalAttributes
    : []
  const optionalAttributes = optionalAttributesRaw.map((attr: any) =>
    language === 'zh' ? attr.nameZh : (attr.nameEn || attr.nameZh)
  )

  return (
    <div className="min-h-screen bg-white pt-32">
      {/* 面包屑导航 */}
      <div className="max-w-[1440px] mx-auto px-6 mb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-primary transition-colors">
            {language === 'zh' ? '首页' : 'Home'}
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            {language === 'zh' ? '产品' : 'Products'}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {language === 'zh' ? productGroup.groupNameZh : (productGroup.groupNameEn || productGroup.groupNameZh)}
          </span>
        </nav>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* 左侧: 图片/视频/参数展示区 */}
          <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
            {/* 主显示区域 - 固定600x600px正方形 */}
            <div className="relative w-[600px] h-[600px] aspect-square bg-gray-100 overflow-hidden border border-gray-200">
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
                        return (
                          <video className="w-full h-full object-contain" controls src={videoUrl}>
                            {language === 'zh' ? '您的浏览器不支持视频播放' : 'Your browser does not support video playback'}
                          </video>
                        );
                      }
                    } else {
                      return (
                        <div className="text-white text-center">
                          <Play size={48} className="mx-auto mb-4 opacity-50" />
                          <p>{language === 'zh' ? '暂无视频' : 'No video available'}</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              )}

              {viewMode === 'params' && (
                <div className="w-full h-full bg-white p-8 overflow-y-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    {language === 'zh' ? '产品参数' : 'Product Parameters'}
                  </h3>
                  <div className="space-y-4 text-gray-700">
                    <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                      <span className="font-semibold">{language === 'zh' ? '产品系列' : 'Series'}:</span>
                      <span>{productGroup.prefix}</span>
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                      <span className="font-semibold">{language === 'zh' ? '分类' : 'Category'}:</span>
                      <span>{language === 'zh' ? productGroup.category?.nameZh : (productGroup.category?.nameEn || productGroup.category?.nameZh)}</span>
                    </div>
                    {selectedSku && (
                      <>
                        <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                          <span className="font-semibold">{language === 'zh' ? '品号' : 'Product Code'}:</span>
                          <span className="font-mono">{selectedSku.productCode}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                          <span className="font-semibold">{language === 'zh' ? '品名' : 'Product Name'}:</span>
                          <span>{language === 'zh' ? selectedSku.productName : (selectedSku.productNameEn || selectedSku.productName)}</span>
                        </div>
                        {((language === 'zh' && selectedSku.specification) || (language === 'en' && selectedSku.specificationEn)) && (
                          <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                            <span className="font-semibold">{language === 'zh' ? '货品规格' : 'Specifications'}:</span>
                            <div className="whitespace-pre-line">
                              {language === 'zh' ? selectedSku.specification : (selectedSku.specificationEn || selectedSku.specification)}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 缩略图列表 - 600px容器,小图居中显示 */}
            {/* 小图111px内容区,选中border-4(总115px),未选中border-2(总113px),间隙6px */}
            {/* 5张小图总宽约591px,<5张时自动居中左右留白 */}
            {viewMode === 'gallery' && images.length >= 2 && (
              <div className="w-[600px] flex justify-center">
                <div className="flex gap-1.5">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-[111px] h-[111px] rounded-md overflow-hidden transition-all flex-shrink-0 ${
                        index === currentImageIndex
                          ? 'border-primary border-4'
                          : 'border-2 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 视图切换按钮 */}
            <div className="w-[600px] flex gap-4 justify-center pt-2">
              <button
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  viewMode === 'gallery'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon size={20} />
                {language === 'zh' ? '图集' : 'Gallery'}
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
                {language === 'zh' ? '视频' : 'Video'}
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
                {language === 'zh' ? '参数' : 'Parameters'}
              </button>
            </div>
          </div>

          {/* 右侧: 产品信息 */}
          <div className="relative pb-48 lg:pb-0">
            {/* 滚动内容区域 */}
            <div className="space-y-6 lg:pb-56">
            {/* 标题 - 仅显示当前语言 */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {language === 'zh' ? productGroup.groupNameZh : (productGroup.groupNameEn || productGroup.groupNameZh)}
              </h1>
              {productGroup.descriptionZh && (
                <p className="text-lg text-gray-600 mt-4">
                  {language === 'zh' ? productGroup.descriptionZh : (productGroup.descriptionEn || productGroup.descriptionZh)}
                </p>
              )}
            </div>

            {/* SKU组前缀标签 + 品号 */}
            <div className="flex items-center justify-between gap-4">
              {productGroup.prefix && (
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  {productGroup.prefix}
                </span>
              )}
              {selectedSku && (
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-sm text-gray-500">
                    {language === 'zh' ? '品号' : 'Product Code'}:
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-lg text-sm font-mono font-semibold border border-gray-300">
                    {selectedSku.productCode}
                  </span>
                </div>
              )}
            </div>

            {/* 品名选择器 (iOS风格) */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                {language === 'zh' ? '选择品名' : 'Select Product Name'} *
              </h3>
              <IOSPicker
                options={skuOptions}
                value={selectedSku ? (language === 'zh' ? selectedSku.productName : (selectedSku.productNameEn || selectedSku.productName)) : undefined}
                onChange={handleSkuSelect}
                placeholder={language === 'zh' ? '请选择品名' : 'Please select'}
                language={language}
              />
            </div>

            {/* 货品规格 - 选择品名后显示 */}
            {selectedSku && ((language === 'zh' && selectedSku.specification) || (language === 'en' && selectedSku.specificationEn)) && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'zh' ? '货品规格' : 'Product Specification'}
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {language === 'zh' ? selectedSku.specification : (selectedSku.specificationEn || selectedSku.specification)}
                </div>
              </div>
            )}

            {/* 附加属性选择器 (iOS风格) */}
            {selectedSku && optionalAttributes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'zh' ? '附加属性（潘通色号）' : 'Optional Attributes (Pantone Number)'}
                </h3>
                <IOSPicker
                  options={optionalAttributes}
                  value={selectedAttributeDisplay}
                  onChange={handleAttributeSelect}
                  placeholder={language === 'zh' ? '请选择' : 'Please select'}
                  language={language}
                />
              </div>
            )}

            </div>
            {/* 结束滚动内容区域 */}

            {/* 固定按钮区域 - 移动端固定在底部，桌面端sticky */}
            <div className="fixed lg:sticky bottom-0 left-0 right-0 lg:bottom-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 lg:p-6 z-40">
              {/* 数量选择器 */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-700 font-medium w-20">
                  {language === 'zh' ? '数量' : 'Quantity'}:
                </span>
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

              {/* 按钮组 */}
              <div className="space-y-3">
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
                    className={`w-full h-14 font-bold text-white text-lg transition-all flex items-center justify-center gap-3 ${
                      addedToCart
                        ? 'bg-green-500'
                        : 'bg-primary hover:bg-primary-dark'
                    } disabled:opacity-50 ${!selectedSku ? 'cursor-default' : ''}`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={24} />
                        {language === 'zh' ? '已加入购物车' : 'Added to Cart'}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={24} />
                        {language === 'zh' ? '加入购物车' : 'Add to Cart'}
                      </>
                    )}
                  </button>
                  {showSpecHint && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                      {language === 'zh' ? '请先选择品名' : 'Please select product name first'}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
                    </div>
                  )}
                </div>

                {/* 立即购买按钮 */}
                <button
                  onClick={handleBuyNow}
                  onMouseEnter={() => {
                    if (!selectedSku) {
                      setShowSpecHint(true)
                      setTimeout(() => setShowSpecHint(false), 2000)
                    }
                  }}
                  disabled={!selectedSku}
                  className={`w-full h-14 font-bold text-primary text-lg transition-all flex items-center justify-center gap-3 border-2 border-primary hover:bg-primary/5 disabled:opacity-50 ${!selectedSku ? 'cursor-default' : ''}`}
                >
                  {language === 'zh' ? '立即购买' : 'Buy Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

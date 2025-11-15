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
  const [selectedAttribute, setSelectedAttribute] = useState<string>('')
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

  // 处理品名选择
  const handleSkuSelect = (productName: string) => {
    const sku = productGroup?.skus.find(s => s.productName === productName)
    if (!sku) return

    setSelectedSku(sku)
    setCurrentImageIndex(0)
    setViewMode('gallery')
    setSelectedAttribute('') // 重置附加属性选择

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
  const skuOptions = productGroup.skus.map(sku => sku.productName)
  const optionalAttributes = selectedSku?.optionalAttributes && Array.isArray(selectedSku.optionalAttributes)
    ? selectedSku.optionalAttributes
    : []

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
            {/* 主显示区域 */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden border border-gray-200">
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
                      <span>{productGroup.category?.nameZh} / {productGroup.category?.nameEn}</span>
                    </div>
                    {selectedSku && (
                      <>
                        <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                          <span className="font-semibold">{language === 'zh' ? '品号' : 'Product Code'}:</span>
                          <span className="font-mono">{selectedSku.productCode}</span>
                        </div>
                        <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                          <span className="font-semibold">{language === 'zh' ? '品名' : 'Product Name'}:</span>
                          <span>{selectedSku.productName}</span>
                        </div>
                        {selectedSku.specification && (
                          <div className="grid grid-cols-[120px_1fr] gap-3 border-b pb-3">
                            <span className="font-semibold">{language === 'zh' ? '货品规格' : 'Specifications'}:</span>
                            <div className="whitespace-pre-line">{selectedSku.specification}</div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 缩略图列表 */}
            {viewMode === 'gallery' && images.length >= 2 && (
              <div className={`grid gap-3 justify-center ${
                images.length === 2 ? 'grid-cols-2' :
                images.length === 3 ? 'grid-cols-3' :
                images.length === 4 ? 'grid-cols-4' :
                'grid-cols-5'
              }`}>
                {images.map((img, index) => (
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

            {/* 视图切换按钮 */}
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
          <div className="space-y-6">
            {/* 标题 */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {language === 'zh' ? productGroup.groupNameZh : (productGroup.groupNameEn || productGroup.groupNameZh)}
              </h1>
              {productGroup.groupNameEn && language === 'zh' && (
                <p className="text-xl text-gray-600">{productGroup.groupNameEn}</p>
              )}
              {productGroup.descriptionZh && (
                <p className="text-lg text-gray-600 mt-4">
                  {language === 'zh' ? productGroup.descriptionZh : productGroup.descriptionEn}
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
                value={selectedSku?.productName}
                onChange={handleSkuSelect}
                placeholder={language === 'zh' ? '请选择品名' : 'Please select'}
              />
            </div>

            {/* 货品规格 - 选择品名后显示 */}
            {selectedSku && selectedSku.specification && (
              <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'zh' ? '货品规格' : 'Product Specification'}
                </h3>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {selectedSku.specification}
                </div>
              </div>
            )}

            {/* 附加属性选择器 (可选，iOS风格) */}
            {selectedSku && optionalAttributes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {language === 'zh' ? '附加属性' : 'Optional Attributes'}{' '}
                  <span className="text-sm text-gray-500 font-normal">{language === 'zh' ? '(可选)' : '(Optional)'}</span>
                </h3>
                <IOSPicker
                  options={optionalAttributes}
                  value={selectedAttribute}
                  onChange={setSelectedAttribute}
                  placeholder={language === 'zh' ? '请选择' : 'Please select'}
                />
              </div>
            )}

            {/* 数量选择器 */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-4">
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

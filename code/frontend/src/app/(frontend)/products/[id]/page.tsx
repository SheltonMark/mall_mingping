'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Check, Play, Image as ImageIcon, FileText, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCart, CartItem } from '@/context/CartContext'
import { useToast } from '@/components/common/ToastContainer'
import { productApi, type ProductGroup, type ProductSku } from '@/lib/publicApi'
import IOSPicker from '@/components/common/IOSPicker'
import DatePicker from '@/components/common/DatePicker'

type ViewMode = 'gallery' | 'video' | 'params'

// 购物车商品详情表单数据
interface CartItemFormData {
  productCategory: 'new' | 'old' | 'sample'
  price: number | undefined
  customerProductCode: string
  untaxedLocalCurrency: number | undefined
  expectedDeliveryDate: string
  packingQuantity: number | undefined
  cartonQuantity: number | undefined
  packagingMethod: string
  paperCardCode: string
  washLabelCode: string
  outerCartonCode: string
  cartonSpecification: string
  volume: number | undefined
  supplierNote: string
  summary: string
}

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

  // 购物车模态框状态
  const [showCartModal, setShowCartModal] = useState(false)
  const [cartFormData, setCartFormData] = useState<CartItemFormData>({
    productCategory: 'new',
    price: undefined,
    customerProductCode: '',
    untaxedLocalCurrency: undefined,
    expectedDeliveryDate: '',
    packingQuantity: undefined,
    cartonQuantity: undefined,
    packagingMethod: '',
    paperCardCode: '',
    washLabelCode: '',
    outerCartonCode: '',
    cartonSpecification: '',
    volume: undefined,
    supplierNote: '',
    summary: '',
  })

  // 解析箱规并计算体积 (格式: number*number*number 或 number*number*numbercm)
  const calculateVolumeFromCartonSpec = (cartonSpec: string): number | undefined => {
    if (!cartonSpec) return undefined
    const match = cartonSpec.match(/^(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*[*×xX]\s*(\d+(?:\.\d+)?)\s*(?:cm)?$/i)
    if (!match) return undefined
    const [, length, width, height] = match
    const volumeCm3 = parseFloat(length) * parseFloat(width) * parseFloat(height)
    const volumeM3 = volumeCm3 / 1000000
    return Math.round(volumeM3 * 1000000) / 1000000
  }

  // 更新表单字段
  const updateCartFormField = (field: keyof CartItemFormData, value: any) => {
    setCartFormData(prev => {
      const updated = { ...prev, [field]: value }
      // 如果修改的是箱规，自动计算体积
      if (field === 'cartonSpecification' && typeof value === 'string') {
        const calculatedVolume = calculateVolumeFromCartonSpec(value)
        if (calculatedVolume !== undefined) {
          updated.volume = calculatedVolume
        }
      }
      // 如果修改装箱数，自动计算箱数
      if (field === 'packingQuantity' && typeof value === 'number' && value > 0) {
        updated.cartonQuantity = Math.ceil(quantity / value)
      }
      // 如果修改单价，自动计算未税本位币 = 数量 × 单价
      if (field === 'price' && typeof value === 'number') {
        updated.untaxedLocalCurrency = quantity * value
      }
      return updated
    })
  }

  // 当数量变化时，同步更新未税本位币
  useEffect(() => {
    if (cartFormData.price !== undefined && cartFormData.price > 0) {
      setCartFormData(prev => ({
        ...prev,
        untaxedLocalCurrency: quantity * (prev.price || 0)
      }))
    }
  }, [quantity])

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

  // 打开购物车模态框
  const handleAddToCart = () => {
    if (!selectedSku || !productGroup) {
      toast.error(language === 'zh' ? '请先选择品名' : 'Please select a product name first')
      return
    }
    // 重置表单数据
    setCartFormData({
      productCategory: 'new',
      price: undefined,
      customerProductCode: '',
      untaxedLocalCurrency: undefined,
      expectedDeliveryDate: '',
      packingQuantity: undefined,
      cartonQuantity: undefined,
      packagingMethod: '',
      paperCardCode: '',
      washLabelCode: '',
      outerCartonCode: '',
      cartonSpecification: '',
      volume: undefined,
      supplierNote: '',
      summary: '',
    })
    setShowCartModal(true)
  }

  // 确认加入购物车
  const handleConfirmAddToCart = async () => {
    if (!selectedSku || !productGroup) return

    try {
      await addItem({
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
        price: cartFormData.price || 0,
        mainImage: images[0] || (productGroup as any).mainImage || '/images/placeholder.jpg',
        // 扩展字段
        productCategory: cartFormData.productCategory,
        customerProductCode: cartFormData.customerProductCode || undefined,
        untaxedLocalCurrency: cartFormData.untaxedLocalCurrency,
        expectedDeliveryDate: cartFormData.expectedDeliveryDate || undefined,
        packingQuantity: cartFormData.packingQuantity,
        cartonQuantity: cartFormData.cartonQuantity,
        packagingMethod: cartFormData.packagingMethod || undefined,
        paperCardCode: cartFormData.paperCardCode || undefined,
        washLabelCode: cartFormData.washLabelCode || undefined,
        outerCartonCode: cartFormData.outerCartonCode || undefined,
        cartonSpecification: cartFormData.cartonSpecification || undefined,
        volume: cartFormData.volume,
        supplierNote: cartFormData.supplierNote || undefined,
        summary: cartFormData.summary || undefined,
      })

      setShowCartModal(false)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
      toast.success(language === 'zh' ? '已加入购物车' : 'Added to cart')
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      toast.error(language === 'zh' ? '加入购物车失败，请重试' : 'Failed to add to cart, please try again')
    }
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
    <div className="min-h-screen bg-white pt-32" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
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
            {/* 主显示区域 - 响应式正方形: 移动端全宽, 桌面端600px */}
            <div className="relative w-full max-w-[600px] mx-auto aspect-square bg-gray-100 overflow-hidden border border-gray-200">
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
            {/* 缩略图 - 移动端更小 */}
            {images.length >= 2 && (
              <div className="w-full max-w-[600px] mx-auto flex justify-center">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentImageIndex(index)
                        setViewMode('gallery')
                      }}
                      className={`w-16 h-16 md:w-20 md:h-20 lg:w-[111px] lg:h-[111px] rounded-md overflow-hidden transition-all flex-shrink-0 ${
                        index === currentImageIndex && viewMode === 'gallery'
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

            {/* 视图切换按钮 - 移动端更紧凑 */}
            <div className="w-full max-w-[600px] mx-auto flex gap-2 md:gap-4 justify-center pt-2">
              <button
                onClick={() => setViewMode('gallery')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
                  viewMode === 'gallery'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ImageIcon size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">{language === 'zh' ? '图集' : 'Gallery'}</span>
              </button>
              <button
                onClick={() => setViewMode('video')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
                  viewMode === 'video'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Play size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">{language === 'zh' ? '视频' : 'Video'}</span>
              </button>
              <button
                onClick={() => setViewMode('params')}
                className={`flex items-center gap-1.5 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base ${
                  viewMode === 'params'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">{language === 'zh' ? '参数' : 'Parameters'}</span>
              </button>
            </div>
          </div>

          {/* 右侧: 产品信息 */}
          <div className="relative">
            {/* 滚动内容区域 */}
            <div className="space-y-5 lg:space-y-6 pb-40 lg:pb-8">
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

            {/* 品名选择器 (网格卡片) */}
            <div className="space-y-3">
              <h3 className="text-base lg:text-lg font-bold text-gray-900">
                {language === 'zh' ? '选择品名' : 'Select Product Name'} *
              </h3>

              {/* 品名网格 - 移动端一排一个，桌面端一排两个 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-h-[300px] lg:max-h-[400px] overflow-y-auto">
                {productGroup.skus.map((sku) => {
                  const skuDisplayName = language === 'zh' ? sku.productName : (sku.productNameEn || sku.productName)
                  const isSelected = selectedSku?.id === sku.id

                  return (
                    <button
                      key={sku.id}
                      onClick={() => handleSkuSelect(skuDisplayName)}
                      className={`
                        p-3 md:p-2.5 rounded-lg border-2 text-center transition-all
                        ${isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <div className="text-sm md:text-xs lg:text-sm font-medium text-gray-900 leading-tight">
                        {skuDisplayName}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 货品规格 - 选择品名后显示 */}
            {selectedSku && ((language === 'zh' && selectedSku.specification) || (language === 'en' && selectedSku.specificationEn)) && (
              <div className="space-y-3 bg-gray-50 rounded-xl p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-bold text-gray-900">
                  {language === 'zh' ? '货品规格' : 'Product Specification'}
                </h3>
                <div className="text-sm lg:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  {language === 'zh' ? selectedSku.specification : (selectedSku.specificationEn || selectedSku.specification)}
                </div>
              </div>
            )}

            {/* 附加属性选择器 (iOS风格) */}
            {selectedSku && optionalAttributes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-base lg:text-lg font-bold text-gray-900">
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

            {/* 购买按钮区域 - 移动端直接在内容流中，桌面端sticky */}
            <div className="lg:sticky lg:bottom-0 bg-white border-t border-gray-200 pt-5 pb-2 lg:p-6 lg:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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
                    className={`w-full h-12 lg:h-14 font-bold text-white text-base lg:text-lg transition-all flex items-center justify-center gap-2 lg:gap-3 active:scale-98 ${
                      addedToCart
                        ? 'bg-green-500'
                        : 'bg-primary hover:bg-primary-dark'
                    } disabled:opacity-50 ${!selectedSku ? 'cursor-default' : ''}`}
                  >
                    {addedToCart ? (
                      <>
                        <Check size={20} className="lg:w-6 lg:h-6" />
                        <span>{language === 'zh' ? '已加入购物车' : 'Added to Cart'}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} className="lg:w-6 lg:h-6" />
                        <span>{language === 'zh' ? '加入购物车' : 'Add to Cart'}</span>
                      </>
                    )}
                  </button>
                  {showSpecHint && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg z-50">
                      {language === 'zh' ? '请先选择品名' : 'Please select product name first'}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-neutral-900"></div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            </div>
            {/* 结束滚动内容区域 */}
          </div>
        </div>
      </div>

      {/* 加入购物车模态框 */}
      {showCartModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 模态框头部 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {language === 'zh' ? '加入购物车' : 'Add to Cart'}
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  {language === 'zh' ? '填写商品详细信息（可选）' : 'Fill in product details (optional)'}
                </p>
              </div>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* 模态框内容 - 可滚动 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 产品类别 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary">
                  {language === 'zh' ? '产品类别' : 'Product Category'}
                </h3>
                <div className="flex gap-3">
                  {[
                    { value: 'new', labelZh: '新产品', labelEn: 'New Product' },
                    { value: 'old', labelZh: '老产品', labelEn: 'Old Product' },
                    { value: 'sample', labelZh: '样品需求', labelEn: 'Sample Request' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateCartFormField('productCategory', option.value as 'new' | 'old' | 'sample')}
                      className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition-all text-sm ${
                        cartFormData.productCategory === option.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}
                    >
                      {language === 'zh' ? option.labelZh : option.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary">
                  {language === 'zh' ? '基本信息' : 'Basic Information'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '数量' : 'Quantity'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => {
                        const newQuantity = Math.max(1, parseInt(e.target.value) || 1)
                        setQuantity(newQuantity)
                        // 自动计算未税本位币
                        if (cartFormData.price !== undefined && cartFormData.price > 0) {
                          setCartFormData(prev => ({
                            ...prev,
                            untaxedLocalCurrency: newQuantity * (prev.price || 0)
                          }))
                        }
                        // 自动计算箱数
                        if (cartFormData.packingQuantity !== undefined && cartFormData.packingQuantity > 0) {
                          setCartFormData(prev => ({
                            ...prev,
                            cartonQuantity: Math.ceil(newQuantity / (prev.packingQuantity || 1))
                          }))
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '单价' : 'Unit Price'}
                    </label>
                    <input
                      type="number"
                      value={cartFormData.price ?? ''}
                      onChange={(e) => updateCartFormField('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '未税本位币' : 'Untaxed Local Currency'}
                    </label>
                    <input
                      type="number"
                      value={cartFormData.untaxedLocalCurrency ?? ''}
                      onChange={(e) => updateCartFormField('untaxedLocalCurrency', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '预交日' : 'Expected Delivery Date'}
                    </label>
                    <DatePicker
                      value={cartFormData.expectedDeliveryDate}
                      onChange={(value) => updateCartFormField('expectedDeliveryDate', value)}
                    />
                  </div>
                </div>
              </div>

              {/* 包装信息 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary flex items-center gap-2">
                  <span>📦</span>
                  <span>{language === 'zh' ? '包装信息' : 'Packaging Information'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '客户料号' : 'Customer Product Code'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.customerProductCode}
                      onChange={(e) => updateCartFormField('customerProductCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '装箱数' : 'Packing Quantity'}
                    </label>
                    <input
                      type="number"
                      value={cartFormData.packingQuantity ?? ''}
                      onChange={(e) => updateCartFormField('packingQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '箱数' : 'Carton Quantity'}
                    </label>
                    <input
                      type="number"
                      value={cartFormData.cartonQuantity ?? ''}
                      onChange={(e) => updateCartFormField('cartonQuantity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '包装方式' : 'Packaging Method'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.packagingMethod}
                      onChange={(e) => updateCartFormField('packagingMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '纸卡编码' : 'Paper Card Code'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.paperCardCode}
                      onChange={(e) => updateCartFormField('paperCardCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '水洗标编码' : 'Wash Label Code'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.washLabelCode}
                      onChange={(e) => updateCartFormField('washLabelCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '外箱编码' : 'Outer Carton Code'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.outerCartonCode}
                      onChange={(e) => updateCartFormField('outerCartonCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '箱规 (cm)' : 'Carton Spec (cm)'}
                    </label>
                    <input
                      type="text"
                      value={cartFormData.cartonSpecification}
                      onChange={(e) => updateCartFormField('cartonSpecification', e.target.value)}
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
                      value={cartFormData.volume ?? ''}
                      onChange={(e) => updateCartFormField('volume', e.target.value ? parseFloat(e.target.value) : undefined)}
                      step="0.000001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 备注信息 */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 pb-2 border-b-2 border-primary flex items-center gap-2">
                  <span>📝</span>
                  <span>{language === 'zh' ? '备注信息' : 'Notes'}</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '厂商备注' : 'Supplier Note'}
                    </label>
                    <textarea
                      value={cartFormData.supplierNote}
                      onChange={(e) => updateCartFormField('supplierNote', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'zh' ? '摘要' : 'Summary'}
                    </label>
                    <textarea
                      value={cartFormData.summary}
                      onChange={(e) => updateCartFormField('summary', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 模态框底部 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowCartModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all font-semibold"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmAddToCart}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-semibold flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                {language === 'zh' ? '确认加入购物车' : 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ArrowRight, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useEffect } from 'react'

interface FeaturedProduct {
  title: string
  title_en?: string
  description: string
  description_en?: string
  image: string
  link: string
}

export default function HomePage() {
  const { t, language } = useLanguage()

  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [heroImages, setHeroImages] = useState<string[]>([])
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [isHeroHovering, setIsHeroHovering] = useState(false)
  const [certificates, setCertificates] = useState<Array<{image: string, label_zh?: string, label_en?: string}>>([])
  const [currentCertificateIndex, setCurrentCertificateIndex] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // 已取消证书自动轮播

  // 从API加载首页配置
  useEffect(() => {
    const loadHomepageConfig = async () => {
      try {
        // 调用公开API获取首页配置
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/homepage`)

        if (response.ok) {
          const data = await response.json()

          // 加载hero图片 - 支持 hero_images 数组（最多6张），fallback 到 hero_image
          if (data.hero_images && Array.isArray(data.hero_images) && data.hero_images.length > 0) {
            const imageUrls = data.hero_images
              .slice(0, 6) // 限制最多6张
              .map((img: any) => {
                const url = typeof img === 'string' ? img : img.image || img.url;
                if (url && !url.startsWith('http')) {
                  return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
                }
                return url;
              })
              .filter((url: string) => url);

            if (imageUrls.length > 0) {
              setHeroImages(imageUrls);
            }
          } else if (data.hero_image) {
            // Fallback to single hero_image
            const imageUrl = data.hero_image.startsWith('http')
              ? data.hero_image
              : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${data.hero_image}`;
            setHeroImages([imageUrl]);
          }

          // 加载certificates配置 (max 6 images with labels)
          if (data.certificates && Array.isArray(data.certificates) && data.certificates.length > 0) {
            const certificateData = data.certificates
              .slice(0, 6)
              .map((cert: any) => {
                if (typeof cert === 'string') {
                  // 兼容旧版纯字符串格式
                  return {
                    image: cert.startsWith('http') ? cert : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${cert}`,
                    label_zh: '',
                    label_en: ''
                  };
                } else {
                  // 新版对象格式
                  const imageUrl = cert.image || cert.url || '';
                  return {
                    image: imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`,
                    label_zh: cert.label_zh || '',
                    label_en: cert.label_en || ''
                  };
                }
              })
              .filter((cert: any) => cert.image);

            if (certificateData.length > 0) {
              setCertificates(certificateData);
            }
          }

          // 加载featured_products配置
          if (data.featured_products && Array.isArray(data.featured_products) && data.featured_products.length > 0) {
            // 只加载完整配置的产品（必须有图片和链接）
            const configuredProducts = data.featured_products
              .map((p: any) => {
                // 处理图片URL
                let imageUrl = p.image || '';
                if (imageUrl && !imageUrl.startsWith('http')) {
                  imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
                }

                return {
                  title: p.title || '',
                  title_en: p.title_en || p.title || '',
                  description: p.description || '',
                  description_en: p.description_en || p.description || '',
                  image: imageUrl,
                  link: p.link || '#'
                }
              })
              .filter((p: FeaturedProduct) => p.image && p.link) // 至少要有图片和链接

            if (configuredProducts.length > 0) {
              setFeaturedProducts(configuredProducts)
            }
          }
        }
      } catch (error) {
        console.error('Failed to load homepage config:', error)
        // 使用默认值（已在state中定义）
      }
    }

    loadHomepageConfig()
  }, [])

  // Hero carousel auto-play effect
  useEffect(() => {
    if (heroImages.length <= 1 || isHeroHovering) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length, isHeroHovering]);

  // 监听滚动位置，控制回到顶部按钮显示
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 证书轮播导航
  const handlePrevCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev === 0 ? Math.max(0, certificates.length - 3) : prev - 1))
  }

  const handleNextCertificate = () => {
    setCurrentCertificateIndex((prev) => (prev >= certificates.length - 3 ? 0 : prev + 1))
  }

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Hero Section - O-Cedar style */}
      <div className="mt-32 md:mt-36 pb-12 md:pb-16 bg-white">
        <div className="mx-auto px-20 md:px-32 lg:px-40 max-w-[1800px]">
          <section
            className="relative h-[480px] md:h-[580px] lg:h-[680px] overflow-hidden"
            onMouseEnter={() => setIsHeroHovering(true)}
            onMouseLeave={() => setIsHeroHovering(false)}
          >
            {/* Hero Carousel Images */}
            {heroImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentHeroIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  className="w-full h-full object-cover"
                  alt={`Hero ${index + 1}`}
                />
              </div>
            ))}

            {/* Navigation Dots */}
            {heroImages.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                {heroImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHeroIndex(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentHeroIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Text content - Left aligned */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-full mx-auto px-8 md:px-12 w-full">
                <div className="max-w-2xl">
                  {/* Main Title */}
                  <h1 className="text-white mb-4 animate-fade-in-up" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
                    {t('home.hero.title').includes('Future') ? (
                      <span className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
                        Excellence in Every Clean
                      </span>
                    ) : (
                      <span className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
                        卓越清洁 始于细节
                      </span>
                    )}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-white/90 text-base md:text-lg animate-fade-in-up animation-delay-200 font-normal mb-2 leading-relaxed">
                    {t('home.hero.title').includes('Future')
                      ? 'Premium cleaning solutions for modern living'
                      : '为现代生活而生的高端清洁方案'}
                  </p>

                  {/* Terms text */}
                  <p className="text-white/70 text-sm mb-8 animate-fade-in-up animation-delay-400">
                    {t('home.hero.title').includes('Future')
                      ? 'Discover our premium collection'
                      : '探索我们的高端系列'}
                  </p>

                  {/* BUY NOW Button - Inside Hero */}
                  <Link
                    href="/products"
                    className="group relative inline-flex items-center justify-center px-8 py-2.5 sm:px-10 sm:py-3 bg-primary text-white animate-fade-in-up animation-delay-600 font-semibold text-sm sm:text-base tracking-wider uppercase rounded-md overflow-hidden hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_8px_20px_rgba(189,183,107,0.6)]"
                    style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif', letterSpacing: '0.1em' }}
                  >
                    <span className="relative z-10">
                      {language === 'zh' ? '立即下单' : 'BUY NOW'}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

            {/* Certificates Section - 3-item Carousel (Desktop) & Single Display (Mobile) */}
      <section className="py-20 md:py-28 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
        <div className="w-full max-w-full">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-20 px-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">
              {language === 'zh' ? '资质保障' : 'OUR CERTIFICATIONS'}
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.015em' }}
            >
              {language === 'zh' ? '源头工厂·资质保障' : 'Factory Direct, Quality Assured'}
            </h2>
            <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {language === 'zh' ? '自有工厂，专业认证，品质保证' : 'Own factory with professional certifications and quality assurance'}
            </p>
          </div>

          {certificates.length > 0 && (
            <>
              {/* Desktop: Certificate Display */}
              <div className="hidden md:block relative">
                <div className="max-w-[1440px] mx-auto px-6 relative">
                  {certificates.length >= 3 ? (
                    // 3张或更多：使用轮播，显示左右按钮（品牌色）
                    <>
                      {/* 左侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />
                      </button>

                      {/* 证书轮播容器 */}
                      <div className="relative h-[300px] md:h-[370px] overflow-hidden">
                        <div className="w-[75%] mx-auto h-full">
                          <div className="flex gap-6 transition-transform duration-700 ease-in-out h-full"
                               style={{
                                 transform: `translateX(-${(currentCertificateIndex * 100) / 3}%)`,
                               }}>
                            {/* 复制3次证书数组实现无缝循环 */}
                            {[...certificates, ...certificates, ...certificates].map((cert, idx) => (
                              <div key={idx} className="flex-shrink-0 w-1/3 px-3">
                              <div className="group relative h-full bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:scale-105">
                                <img
                                  src={cert.image}
                                  alt={`Certificate ${(idx % certificates.length) + 1}`}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {(cert.label_zh || cert.label_en) && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-16 pb-6 px-6">
                                    <p className="text-white text-left text-base md:text-lg font-medium">
                                      {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          </div>
                        </div>
                      </div>

                      {/* 右侧按钮 */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={40} strokeWidth={3} className="text-primary hover:text-primary/80 transition-colors" />
                      </button>

                      {/* Linear Progress Indicator */}
                      <div className="flex justify-center mt-12 px-6">
                        <div className="max-w-md w-full flex gap-1">
                          {certificates.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentCertificateIndex(index)}
                              className={`flex-1 h-0.5 rounded-full transition-all duration-300 ${
                                index === currentCertificateIndex
                                  ? 'bg-primary'
                                  : 'bg-neutral-300 hover:bg-neutral-400'
                              }`}
                              aria-label={`Go to certificate ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    // 少于3张：居中静态显示，显示淡色按钮
                    <>
                      {/* 左侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === 0 ? certificates.length - 1 : prev - 1
                        )}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Previous certificate"
                      >
                        <ChevronLeft size={40} strokeWidth={3} className="text-primary/30 hover:text-primary/40 transition-colors" />
                      </button>

                      {/* 证书静态显示 */}
                      <div className="w-[75%] mx-auto">
                        <div className={`flex justify-center gap-6 ${certificates.length === 1 ? 'max-w-md' : 'max-w-3xl'} mx-auto`}>
                        {certificates.map((cert, index) => (
                          <div key={index} className="group relative h-[300px] md:h-[370px] bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden" style={{ flex: '1 1 0' }}>
                            <img
                              src={cert.image}
                              alt={`Certificate ${index + 1}`}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {(cert.label_zh || cert.label_en) && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-16 pb-6 px-6">
                                <p className="text-white text-left text-base md:text-lg font-medium">
                                      {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                                    </p>
                              </div>
                            )}
                          </div>
                        ))}
                        </div>
                      </div>

                      {/* 右侧按钮（淡色） */}
                      <button
                        onClick={() => setCurrentCertificateIndex(prev =>
                          prev === certificates.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 transition-all duration-300 hover:scale-110"
                        aria-label="Next certificate"
                      >
                        <ChevronRight size={40} strokeWidth={3} className="text-primary/30 hover:text-primary/40 transition-colors" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Mobile: Display All Certificates */}
              <div className="md:hidden px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  {certificates.map((cert, index) => (
                    <div key={index} className="group relative bg-white rounded-lg shadow-md overflow-hidden">
                      <img
                        src={cert.image}
                        alt={`Certificate ${index + 1}`}
                        className="w-full h-64 object-contain p-4"
                      />
                      {/* 移动端也支持点击显示文字 */}
                      {(cert.label_zh || cert.label_en) && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                          <p className="text-white text-sm font-medium">
                            {language === 'zh' ? (cert.label_zh || cert.label_en) : (cert.label_en || cert.label_zh)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products Section - Apple Style 2x2 Grid */}
      <section className="py-32 bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
        <div className="w-full max-w-full">
          {/* Section Header */}
          <div className="text-center mb-20 px-6">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">{language === 'zh' ? '我们的系列' : 'Our Collection'}</p>
            <h2
              className="text-5xl md:text-7xl font-light text-neutral-900 mb-6"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif', lineHeight: 1.05, fontWeight: 300, letterSpacing: '-0.015em' }}
            >
              {t('home.signature.title')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              {t('home.signature.subtitle')}
            </p>
          </div>

          {/* Apple-style 2x2 grid with 0.25rem gap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {featuredProducts.map((product, index) => (
              <Link key={index} href={product.link} className="group relative h-[600px] md:h-[600px] overflow-hidden bg-black">
                <img
                  src={product.image}
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/40 transition-all duration-500 z-10"></div>
                <div className="absolute bottom-0 left-0 right-0 p-12 z-20 flex flex-col">
                  <h3 className="text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight leading-tight transition-transform duration-500 group-hover:-translate-y-2">
                    {language === 'zh' ? product.title : (product.title_en || product.title)}
                  </h3>
                  <p className="text-xl text-white/90 mb-6 leading-relaxed max-w-lg opacity-0 translate-y-5 transition-all duration-500 delay-100 group-hover:opacity-100 group-hover:translate-y-0">
                    {language === 'zh' ? product.description : (product.description_en || product.description)}
                  </p>
                  <div className="opacity-0 translate-y-5 transition-all duration-500 delay-150 group-hover:opacity-100 group-hover:translate-y-0">
                    <span className="relative inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-neutral-900 text-sm font-bold tracking-[0.05em] uppercase rounded-full overflow-hidden hover:bg-gold-400 hover:-translate-y-0.5 transition-all duration-300">
                      <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[100%] transition-all duration-600"></span>
                      <span className="relative z-10">{t('home.signature.learn_more')}</span>
                      <ArrowRight className="relative z-10" size={16} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* VIEW ALL Button */}
          <div className="flex justify-center mt-12 sm:mt-16 px-6">
            <Link
              href="/products"
              className="relative inline-flex items-center gap-2 sm:gap-3 px-8 py-3.5 sm:px-12 sm:py-5 bg-[#494A45] text-white text-base sm:text-lg font-bold tracking-[0.05em] uppercase rounded-full overflow-hidden group hover:!bg-primary hover:-translate-y-1 transition-all duration-300"
              style={{ boxShadow: 'var(--shadow-large)' }}
            >
              <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-600"></span>
              <span className="relative z-10">{t('home.signature.view_all')}</span>
              <ArrowRight className="relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - 数字化展示 */}
      <section
        className="py-24 px-6 border-t border-b border-gold-200 relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFCF5 0%, #FFF9E6 50%, #FFFCF5 100%)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {/* Stat 1 */}
            <div className="text-center">
              <div
                className="text-6xl font-semibold text-primary mb-4 leading-none"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}
              >
                15+
              </div>
              <div className="text-sm text-neutral-600 tracking-[0.1em] uppercase">
                {language === 'zh' ? '年卓越品质' : 'Years Excellence'}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div
                className="text-6xl font-semibold text-primary mb-4 leading-none"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}
              >
                500+
              </div>
              <div className="text-sm text-neutral-600 tracking-[0.1em] uppercase">
                {language === 'zh' ? '全球客户' : 'Global Clients'}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div
                className="text-6xl font-semibold text-primary mb-4 leading-none"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}
              >
                200+
              </div>
              <div className="text-sm text-neutral-600 tracking-[0.1em] uppercase">
                {language === 'zh' ? '优质产品' : 'Premium Products'}
              </div>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div
                className="text-6xl font-semibold text-primary mb-4 leading-none"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}
              >
                99%
              </div>
              <div className="text-sm text-neutral-600 tracking-[0.1em] uppercase">
                {language === 'zh' ? '客户满意度' : 'Satisfaction'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Begin Your Journey */}
      <section className="py-32 px-6 bg-neutral-900 text-white text-center relative overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
        {/* Pulsing light effect */}
        <div
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'radial-gradient(circle, rgba(189, 183, 107, 0.1) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />

        <div className="max-w-[800px] mx-auto relative z-10">
          <h2
            className="text-5xl md:text-7xl font-light text-white mb-8"
            style={{ fontFamily: 'var(--font-display)', lineHeight: 1.2 }}
          >
            {language === 'zh' ? '开启您的旅程' : 'Begin Your Journey'}
          </h2>
          <p className="text-xl text-neutral-500 mb-12 leading-relaxed">
            {language === 'zh' ? '与我们一起开启卓越清洁体验的新篇章' : 'Join us to start a new chapter of excellent cleaning experience'}
          </p>
          <Link
            href="/about"
            className="relative inline-flex items-center gap-3 px-12 py-5 bg-primary text-neutral-900 rounded-full text-lg font-bold tracking-[0.05em] uppercase overflow-hidden group hover:bg-gold-400 hover:-translate-y-1 transition-all duration-300"
          >
            <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:left-[100%] transition-all duration-600"></span>
            <span className="relative z-10">{language === 'zh' ? '开始对话' : 'Start Conversation'}</span>
            <ArrowRight className="relative z-10" size={24} />
          </Link>
        </div>
      </section>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 bg-primary text-neutral-900 rounded-full shadow-lg hover:bg-gold-400 hover:-translate-y-1 transition-all duration-300"
          aria-label="Back to top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  )
}

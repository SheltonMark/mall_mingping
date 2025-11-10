'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { publicApi } from '@/lib/publicApi'
import { useToast } from '@/components/common/ToastContainer'
import { ButtonLoader } from '@/components/common/Loader'

interface ScrollElement {
  isVisible: boolean
}

interface AboutConfig {
  // Hero区域
  hero_image?: string
  hero_title_line1_en?: string
  hero_title_line1_zh?: string
  hero_title_line2_en?: string
  hero_title_line2_zh?: string
  hero_subtitle_en?: string
  hero_subtitle_zh?: string
  // 品牌故事第一组
  story1_image?: string
  story1_title_en?: string
  story1_title_zh?: string
  story1_desc1_en?: string
  story1_desc1_zh?: string
  story1_desc2_en?: string
  story1_desc2_zh?: string
  // 品牌故事第二组
  story2_image?: string
  story2_title_en?: string
  story2_title_zh?: string
  story2_desc1_en?: string
  story2_desc1_zh?: string
  story2_desc2_en?: string
  story2_desc2_zh?: string
  // 工厂展示区
  factory_carousel?: Array<{
    type: 'image' | 'video'
    url: string
    label_en?: string
    label_zh?: string
    thumbnail?: string
    settings?: {
      autoplay?: boolean
      loop?: boolean
      muted?: boolean
    }
  }> | string
  // 联系方式
  contact_email?: string
  contact_phone?: string
  contact_address_en?: string
  contact_address_zh?: string
}

export default function AboutPage() {
  const { t, language } = useLanguage()
  const toast = useToast()
  const [showModal, setShowModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollVisibility, setScrollVisibility] = useState<Record<string, boolean>>({})
  const [aboutConfig, setAboutConfig] = useState<AboutConfig>({})
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  })

  // 获取工厂轮播数据
  const getFactoryCarousel = () => {
    if (!aboutConfig.factory_carousel) return []
    if (Array.isArray(aboutConfig.factory_carousel)) {
      return aboutConfig.factory_carousel
    }
    return []
  }

  const factoryCarousel = getFactoryCarousel()
  const totalSlides = factoryCarousel.length > 0 ? factoryCarousel.length : 3 // 默认3个占位

  // 根据当前语言获取对应字段的辅助函数
  const getLocalizedField = (fieldName: string): string => {
    const zhField = `${fieldName}_zh` as keyof AboutConfig
    const enField = `${fieldName}_en` as keyof AboutConfig

    if (language === 'zh') {
      const value = aboutConfig[zhField] || aboutConfig[enField] || ''
      return typeof value === 'string' ? value : ''
    } else {
      const value = aboutConfig[enField] || aboutConfig[zhField] || ''
      return typeof value === 'string' ? value : ''
    }
  }

  // 从API获取关于我们的配置
  useEffect(() => {
    const fetchAboutConfig = async () => {
      try {
        const config = await publicApi.system.getAbout()

        // 如果 factory_carousel 是字符串，解析为数组
        if (config.factory_carousel && typeof config.factory_carousel === 'string') {
          try {
            config.factory_carousel = JSON.parse(config.factory_carousel)
          } catch (e) {
            console.error('Failed to parse factory_carousel:', e)
            config.factory_carousel = []
          }
        }

        setAboutConfig(config)
      } catch (error) {
        console.error('Failed to fetch about config:', error)
      }
    }
    fetchAboutConfig()
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-scroll-id')
            if (id) {
              setScrollVisibility((prev) => ({ ...prev, [id]: true }))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    )

    document.querySelectorAll('[data-scroll-id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => Math.min(totalSlides - 1, prev + 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.message) {
      toast.warning(t('about.form_error') || '请填写必填项')
      return
    }

    setSubmitting(true)
    try {
      await publicApi.partnership.submit({
        name: formData.name,
        company: formData.company || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message
      })

      toast.success(t('about.form_success') || '提交成功！我们会尽快与您联系')
      setShowModal(false)
      setFormData({ name: '', company: '', email: '', phone: '', message: '' })
    } catch (error: any) {
      console.error('Failed to submit partnership:', error)
      toast.error(error.message || '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const getAnimationClass = (id: string) => {
    return scrollVisibility[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - 参考首页风格 */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--neutral-900) 0%, #1a1a1a 50%, var(--neutral-900) 100%)'
        }}
      >
        {/* Animated Grid Background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(189, 183, 107, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(189, 183, 107, 0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            animation: 'gridMove 20s linear infinite'
          }}
        />

        {/* Hero Image with Overlay */}
        <img
          src={aboutConfig.hero_image?.startsWith('http') ? aboutConfig.hero_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${aboutConfig.hero_image}` || "https://lh3.googleusercontent.com/aida-public/AB6AXuDSV4aulz9sIes42kl4uCCUZl_2JAHsp5KLbB1I84Iwb45hHb7Y2yAJ0CVWcFYbDQARNQvIVC0NbDNGqs89BKRUA4g2HQdEw4g5ZEf-xEee8ySqhkXD8QQOSTzQmOsxPciGGCFChki1rZfqbMVKDMJKPkGOfIv4yNfPtkdd7vUAuXvDWo3-L6hnLSkAN9O2g-h7DnN7Lw2wPsYtubHu36G5BAFOdUJUucXcIEi5UNSFBgj_xlac_2ePsWt_nSF-jNDmrBtXOKmL71kI"}
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
          alt="Factory"
        />

        {/* Floating Light Effect */}
        <div
          className="absolute top-[-30%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(189, 183, 107, 0.3) 0%, transparent 70%)',
            animation: 'float 8s ease-in-out infinite'
          }}
        />

        <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
          {/* Innovation Badge */}
          <div
            className="inline-flex items-center gap-4 px-6 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-8 opacity-0 animate-fade-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
          >
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow"></span>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-white/90">
              {t('about.our_story')}
            </span>
          </div>

          <h1
            className="text-6xl md:text-8xl lg:text-9xl font-light leading-tight mb-6 opacity-0 animate-fade-slide-up"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              animationDelay: '0.4s',
              animationFillMode: 'forwards'
            }}
          >
            {getLocalizedField('hero_title_line1') || t('about.hero_title_1')}
            <br />
            <span className="text-primary italic" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
              {getLocalizedField('hero_title_line2') || t('about.hero_title_2')}
            </span>
          </h1>
          <p
            className="text-2xl md:text-3xl font-light opacity-90 opacity-0 animate-fade-slide-up"
            style={{
              animationDelay: '0.6s',
              animationFillMode: 'forwards'
            }}
          >
            {getLocalizedField('hero_subtitle') || t('about.hero_subtitle')}
          </p>
        </div>
      </section>

      {/* Story Section 1 - 独特的设计风格 */}
      <section className="bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div
            className="text-center mb-20 pt-20 pb-12 transition-all duration-700"
            data-scroll-id="story-header"
          >
            {/* 垂直排列的装饰线条 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="px-6 py-2 border-2 border-primary rounded-md">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                  {t('about.our_story')}
                </span>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-neutral-900" style={{ letterSpacing: '0.02em' }}>
              {t('about.since_1995')}
              <br />
              <span className="text-primary">{t('about.factory_direct')}</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">{t('about.born_passion')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className="p-12 md:p-16 transition-all duration-700" data-scroll-id="story-1-text">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              {getLocalizedField('story1_title') || t('about.craftsmanship_title')}
            </h3>
            <p className="text-lg md:text-2xl text-gray-600 mb-5">
              {getLocalizedField('story1_desc1') || t('about.craftsmanship_desc_1')}
            </p>
            <p className="text-lg md:text-2xl text-gray-600">
              {getLocalizedField('story1_desc2') || t('about.craftsmanship_desc_2')}
            </p>
          </div>
          <div className="h-96 md:h-auto aspect-video overflow-hidden transition-all duration-700" data-scroll-id="story-1-image">
            <img
              src={aboutConfig.story1_image?.startsWith('http') ? aboutConfig.story1_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${aboutConfig.story1_image}` || "https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ"}
              alt="Craftsmanship"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-600"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className="h-96 md:h-auto aspect-video overflow-hidden order-2 md:order-1 transition-all duration-700" data-scroll-id="story-2-image">
            <img
              src={aboutConfig.story2_image?.startsWith('http') ? aboutConfig.story2_image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${aboutConfig.story2_image}` || "https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe"}
              alt="Factory Direct"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-600"
            />
          </div>
          <div className="p-12 md:p-16 order-1 md:order-2 transition-all duration-700" data-scroll-id="story-2-text">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              {getLocalizedField('story2_title') || t('about.factory_supply_title')}
            </h3>
            <p className="text-lg md:text-2xl text-gray-600 mb-5">
              {getLocalizedField('story2_desc1') || t('about.factory_supply_desc_1')}
            </p>
            <p className="text-lg md:text-2xl text-gray-600">
              {getLocalizedField('story2_desc2') || t('about.factory_supply_desc_2')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section - 独特的标题设计 */}
      <section className="py-32 bg-neutral-50">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20 transition-all duration-700" data-scroll-id="values-header">
            {/* 带边框的标签设计 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="px-6 py-2 border-2 border-primary rounded-md">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                  {t('about.our_values')}
                </span>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900" style={{ letterSpacing: '0.02em' }}>
              {t('about.what_we_believe')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { number: '01', title: t('about.value_1_title'), description: t('about.value_1_desc') },
              { number: '02', title: t('about.value_2_title'), description: t('about.value_2_desc') },
              { number: '03', title: t('about.value_3_title'), description: t('about.value_3_desc') }
            ].map((value, idx) => (
              <div
                key={idx}
                className={`p-12 bg-white rounded-2xl border border-transparent hover:border-primary hover:-translate-y-2 transition-all duration-250 cursor-pointer ${getAnimationClass(`value-${idx}`)}`}
                data-scroll-id={`value-${idx}`}
                style={{ boxShadow: 'none' }}
              >
                <div
                  className="text-6xl font-light text-primary opacity-30 mb-6 leading-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {value.number}
                </div>
                <h4 className="text-2xl font-semibold text-neutral-900 mb-6">{value.title}</h4>
                <p className="text-neutral-600 text-lg leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory Carousel Section - 独特的标题设计 */}
      <section className="py-32 bg-neutral-900">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16 text-white">
            {/* 带边框的白色标签 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="px-6 py-2 border-2 border-primary rounded-md">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                  Our Facilities
                </span>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold mb-6" style={{ letterSpacing: '0.02em' }}>
              {t('about.modern_production')}
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">{t('about.smart_factory')}</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl" style={{ boxShadow: 'var(--shadow-xlarge)' }}>
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {factoryCarousel.length > 0 ? (
                  factoryCarousel.map((item, idx) => {
                    const label = language === 'zh' ? (item.label_zh || item.label_en) : (item.label_en || item.label_zh)
                    const mediaUrl = item.url?.startsWith('http') ? item.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${item.url}`

                    return (
                      <div key={idx} className="min-w-full aspect-video">
                        <div className="relative h-full overflow-hidden">
                          {item.type === 'video' ? (
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover"
                              autoPlay={item.settings?.autoplay}
                              loop={item.settings?.loop}
                              muted={item.settings?.muted}
                              playsInline
                            />
                          ) : (
                            <img
                              src={mediaUrl}
                              alt={label || 'Factory'}
                              className="w-full h-full object-cover transition-transform duration-600 hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                          {label && (
                            <div className="absolute bottom-12 left-12 text-white">
                              <div className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-2">
                                {item.type === 'video' ? 'Video' : 'Facility'}
                              </div>
                              <div className="text-4xl md:text-5xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
                                {label}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  // 默认占位内容（如果没有配置）
                  [
                    { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiIeS_8I9cg8G2DxKoNSd2c4etQEF_eM1nrAXWr0fMOS5V9nIi-7waq9GJ1zVBS5CYwejTNYxnqdeDa6f7z6akHTU1fzmm-Q_XaSUWF7VQO5JuN63-WE_ThhDV89_hq72MKk950Cc_D8dtl4HYUhmfjPrRMzJsjFq_Ks1gB91gY6MMk8Eg-k2cmp5lX_lowkNXZ6iyx-ZtZrlq-9CriHkS0R0EN-sm3Yg_0lwz4K3nZIj9F-zDq3e9qRP6QOMxfY_827bfXZ4pJWt', label: t('about.production_line_a') },
                    { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-xhSQMIXCEToPuBIcgJtoEhRyFOe3go7GPbACC5duLevFYOO0vNn-TtoCja7pky40tgPS9KzdFnJDakuDg-YIdwVUy8_xFG6eDySJUr_IkFkq7j6ect3gAHPg3ca0YeZBWsdUutEvOzU0bi0aPxAVI6K-igFBtHPb-hkRzKUsyijzulrD1EBRnUCg6OrNYig7_onhy7Cez4gb7FN6Life15OLW58Vk5sRoMDzLOO_3YStL7D5_tYGEkxN5n-JrNGIqFn3FyeiB1g', label: t('about.quality_control') },
                    { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvR4ZS6iXxPFjf_owlhSPtxe5rlS3z6hvFKe58cv5BSORe-WqryNsuUX_Ne8neN4gnS5YUYF57Kpw4fgtLFvpdeMCyaQ7EShr8TANoGQDzKAWI1g5vXgFc8kSegkeQJKZ70F2cv_jf5loG3XNcmwWVgpGa4gneqxJW7baf_rbz21PvoQWOTf_JjdUV8u6OuSMgKZJoL4xWM9xjckJwXmc8kJgjKjXhJvooJrhFFhBXBC4GTBR5obA_oAOsSRNjWKAMpOOHO9HAwj_8', label: t('about.rd_center') }
                  ].map((item, idx) => (
                    <div key={idx} className="min-w-full aspect-video">
                      <div className="relative h-full overflow-hidden">
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover transition-transform duration-600 hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-12 left-12 text-white">
                          <div className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-2">Facility</div>
                          <div className="text-4xl md:text-5xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{item.label}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
              >
                ←
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 transition-all flex items-center justify-center text-xl"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section - 独特的标题设计 */}
      <section className="py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-20 transition-all duration-700" data-scroll-id="contact-header">
            {/* 带边框的标签设计 */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              <div className="px-6 py-2 border-2 border-primary rounded-md">
                <span className="text-sm font-bold tracking-[0.2em] uppercase text-primary">
                  {t('about.contact_us')}
                </span>
              </div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
            </div>

            <h2 className="text-4xl md:text-5xl font-semibold text-neutral-900 mb-6" style={{ letterSpacing: '0.02em' }}>
              {t('about.get_in_touch')}
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">{t('about.look_forward')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Mail,
                title: t('about.contact_email'),
                content: aboutConfig.contact_email || 'XXL7702@163.com',
                href: `mailto:${aboutConfig.contact_email || 'XXL7702@163.com'}`
              },
              {
                icon: Phone,
                title: t('about.contact_phone'),
                content: aboutConfig.contact_phone || '13806777702',
                href: `tel:${aboutConfig.contact_phone || '13806777702'}`
              },
              {
                icon: MapPin,
                title: t('about.contact_address'),
                content: getLocalizedField('contact_address') || 'Dongyang, Zhejiang, China',
                href: '#'
              }
            ].map((contact, idx) => {
              const IconComponent = contact.icon
              return (
                <div
                  key={idx}
                  className={`p-12 bg-neutral-50 rounded-2xl border border-transparent hover:border-primary hover:-translate-y-2 transition-all duration-250 text-center cursor-pointer ${getAnimationClass(`contact-${idx}`)}`}
                  data-scroll-id={`contact-${idx}`}
                >
                  <IconComponent className="w-12 h-12 text-primary mx-auto mb-6" />
                  <h4 className="text-sm font-semibold tracking-[0.1em] uppercase text-neutral-500 mb-4">{contact.title}</h4>
                  <a href={contact.href} className="text-2xl font-semibold text-neutral-900 hover:text-primary transition-colors block">
                    {contact.content}
                  </a>
                </div>
              )
            })}
          </div>

          <div className="text-center transition-all duration-700" data-scroll-id="contact-cta">
            {/* 简约金色高亮按钮 - 去掉竖线 */}
            <button
              onClick={() => setShowModal(true)}
              className="group relative inline-flex items-center gap-4 px-14 py-6 bg-gradient-to-r from-primary to-primary/90 text-white rounded-full text-base font-bold tracking-[0.1em] uppercase overflow-hidden transition-all duration-300 hover:shadow-[0_0_40px_rgba(189,183,107,0.5)] hover:scale-105"
            >
              {/* 内部光效 */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>

              {/* 文字内容 */}
              <span className="relative z-10">{t('about.start_partnership')}</span>

              {/* 箭头图标 */}
              <span className="relative z-10 w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center group-hover:border-white transition-all duration-300 group-hover:rotate-45">
                <ArrowRight size={20} className="group-hover:-rotate-45 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Partnership Modal - 优化尺寸和滚动 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl md:text-3xl font-bold text-neutral-900">{t('about.modal_title')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-neutral-600 text-base mb-6">{t('about.modal_subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">{t('about.form_name')} *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('about.form_name_placeholder')}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">{t('about.form_email')} *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('about.form_email_placeholder')}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">{t('about.form_company')}</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder={t('about.form_company_placeholder')}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">{t('about.form_phone')}</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('about.form_phone_placeholder')}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-900 mb-1.5">{t('about.form_message')} *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('about.form_message_placeholder')}
                  rows={3}
                  className="w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-neutral-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center"
              >
                {submitting ? <ButtonLoader /> : t('about.form_submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

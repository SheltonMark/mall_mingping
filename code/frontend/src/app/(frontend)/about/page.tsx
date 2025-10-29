'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Mail, Phone, MapPin } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface ScrollElement {
  isVisible: boolean
}

export default function AboutPage() {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [scrollVisibility, setScrollVisibility] = useState<Record<string, boolean>>({})

  const totalSlides = 3

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert(t('about.form_success'))
    setShowModal(false)
  }

  const getAnimationClass = (id: string) => {
    return scrollVisibility[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSV4aulz9sIes42kl4uCCUZl_2JAHsp5KLbB1I84Iwb45hHb7Y2yAJ0CVWcFYbDQARNQvIVC0NbDNGqs89BKRUA4g2HQdEw4g5ZEf-xEee8ySqhkXD8QQOSTzQmOsxPciGGCFChki1rZfqbMVKDMJKPkGOfIv4yNfPtkdd7vUAuXvDWo3-L6hnLSkAN9O2g-h7DnN7Lw2wPsYtubHu36G5BAFOdUJUucXcIEi5UNSFBgj_xlac_2ePsWt_nSF-jNDmrBtXOKmL71kI"
          className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
          alt="Factory"
        />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-7xl md:text-8xl font-bold mb-4 leading-tight" style={{ letterSpacing: '-0.015em' }}>
            {t('about.hero_title_1')}
            <br />
            {t('about.hero_title_2')}
          </h1>
          <p className="text-2xl md:text-3xl opacity-90">{t('about.hero_subtitle')}</p>
        </div>
      </section>

      {/* Story Section 1 */}
      <section className="bg-white">
        <div className="container mx-auto max-w-4xl px-6">
          <div
            className="text-center mb-20 pt-20 pb-12 transition-all duration-700"
            data-scroll-id="story-header"
          >
            <div className="text-sm font-semibold text-primary uppercase mb-3" style={{ letterSpacing: '0.8px' }}>
              {t('about.our_story')}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-5" style={{ letterSpacing: '-0.015em' }}>
              {t('about.since_1995')}
              <br />
              {t('about.factory_direct')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('about.born_passion')}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className="p-12 md:p-16 transition-all duration-700" data-scroll-id="story-1-text">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">{t('about.craftsmanship_title')}</h3>
            <p className="text-lg md:text-2xl text-gray-600 mb-5">
              {t('about.craftsmanship_desc_1')}
            </p>
            <p className="text-lg md:text-2xl text-gray-600">{t('about.craftsmanship_desc_2')}</p>
          </div>
          <div className="h-96 md:h-auto aspect-video overflow-hidden transition-all duration-700" data-scroll-id="story-1-image">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfi1K58Srl81ZITOYuNmNL-H9Pjd-C1kWaLRJPCoJZ-jYYqOFcGoYZQP69NgzaY-yqU5h-8Bp-kWdtJGVHveeKt7P2pBYIQvaCbEQ1xW0Sn4ryEboi7EftPzrRvQ1DddRFioFynEpqDDrQApQTeV78224hX1hyWju2WhrDBOtUY1XjABYDRnh3lbTGTnTbmxSplwI2MbWJNUVb2ivKnIDZlnbOgnP0-Fez2ei6nvbZHyBMM13PPY-PM1OW0jKaPGJL5JioexDR0MZJ"
              alt="Craftsmanship"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-600"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 items-center gap-0">
          <div className="h-96 md:h-auto aspect-video overflow-hidden order-2 md:order-1 transition-all duration-700" data-scroll-id="story-2-image">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwU9EPbCeWtPXd3LnWWxDR3m0NWwkvRXgwA6Ydjbwd_q39jNDNsSuLz7gTVDC9E3moGGwTQ8gDJ-qeenFCorzD6oeFBTXpqffoWd0usjGwznRbQkT8R8_cW-9EntOyzc2E2JlfiZj4q0Tc2VGaTL4ugwPQqFCSqa44CdgnV7dp7k41NenFhCRk1uQ6gr8MlDM8aifbSFgRvsDUHFTiQMyCyNHUlj6Q64AqfpSBsWtw0FHFGDOujY-kWQ-8fKO6NI11mJ9enoREtIPe"
              alt="Factory Direct"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-600"
            />
          </div>
          <div className="p-12 md:p-16 order-1 md:order-2 transition-all duration-700" data-scroll-id="story-2-text">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">{t('about.factory_supply_title')}</h3>
            <p className="text-lg md:text-2xl text-gray-600 mb-5">{t('about.factory_supply_desc_1')}</p>
            <p className="text-lg md:text-2xl text-gray-600">{t('about.factory_supply_desc_2')}</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20 transition-all duration-700" data-scroll-id="values-header">
            <div className="text-sm font-semibold text-primary uppercase mb-3" style={{ letterSpacing: '0.8px' }}>
              {t('about.our_values')}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold" style={{ letterSpacing: '-0.015em' }}>
              {t('about.what_we_believe')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '01', title: t('about.value_1_title'), description: t('about.value_1_desc') },
              { number: '02', title: t('about.value_2_title'), description: t('about.value_2_desc') },
              { number: '03', title: t('about.value_3_title'), description: t('about.value_3_desc') }
            ].map((value, idx) => (
              <div
                key={idx}
                className={`bg-white p-12 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-700 ${getAnimationClass(`value-${idx}`)}`}
                data-scroll-id={`value-${idx}`}
              >
                <div className="text-5xl font-bold text-primary mb-4">{value.number}</div>
                <h4 className="text-2xl font-semibold mb-4">{value.title}</h4>
                <p className="text-gray-600 text-lg leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory Carousel Section */}
      <section className="bg-black py-24">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 text-white">
            <h2 className="text-6xl md:text-7xl font-bold mb-4" style={{ letterSpacing: '-0.009em' }}>
              {t('about.modern_production')}
            </h2>
            <p className="text-2xl opacity-90">{t('about.smart_factory')}</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {[
                  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiIeS_8I9cg8G2DxKoNSd2c4etQEF_eM1nrAXWr0fMOS5V9nIi-7waq9GJ1zVBS5CYwejTNYxnqdeDa6f7z6akHTU1fzmm-Q_XaSUWF7VQO5JuN63-WE_ThhDV89_hq72MKk950Cc_D8dtl4HYUhmfjPrRMzJsjFq_Ks1gB91gY6MMk8Eg-k2cmp5lX_lowkNXZ6iyx-ZtZrlq-9CriHkS0R0EN-sm3Yg_0lwz4K3nZIj9F-zDq3e9qRP6QOMxfY_827bfXZ4pJWt', label: t('about.production_line_a') },
                  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA-xhSQMIXCEToPuBIcgJtoEhRyFOe3go7GPbACC5duLevFYOO0vNn-TtoCja7pky40tgPS9KzdFnJDakuDg-YIdwVUy8_xFG6eDySJUr_IkFkq7j6ect3gAHPg3ca0YeZBWsdUutEvOzU0bi0aPxAVI6K-igFBtHPb-hkRzKUsyijzulrD1EBRnUCg6OrNYig7_onhy7Cez4gb7FN6Life15OLW58Vk5sRoMDzLOO_3YStL7D5_tYGEkxN5n-JrNGIqFn3FyeiB1g', label: t('about.quality_control') },
                  { img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvR4ZS6iXxPFjf_owlhSPtxe5rlS3z6hvFKe58cv5BSORe-WqryNsuUX_Ne8neN4gnS5YUYF57Kpw4fgtLFvpdeMCyaQ7EShr8TANoGQDzKAWI1g5vXgFc8kSegkeQJKZ70F2cv_jf5loG3XNcmwWVgpGa4gneqxJW7baf_rbz21PvoQWOTf_JjdUV8u6OuSMgKZJoL4xWM9xjckJwXmc8kJgjKjXhJvooJrhFFhBXBC4GTBR5obA_oAOsSRNjWKAMpOOHO9HAwj_8', label: t('about.rd_center') }
                ].map((item, idx) => (
                  <div key={idx} className="min-w-full aspect-video">
                    <div className="relative h-full">
                      <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                      <div className="absolute bottom-8 left-8 text-white text-4xl font-semibold drop-shadow-lg">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-12">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 transition-all"
              >
                ←
              </button>
              <button
                onClick={handleNextSlide}
                disabled={currentSlide === totalSlides - 1}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white hover:bg-white/20 disabled:opacity-30 transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20 transition-all duration-700" data-scroll-id="stats-header">
            <div className="text-sm font-semibold text-primary uppercase mb-3" style={{ letterSpacing: '0.8px' }}>
              {t('about.by_numbers')}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold" style={{ letterSpacing: '-0.015em' }}>
              {t('about.our_achievements')}
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-12">
            {[
              { number: t('about.stat_1_number'), label: t('about.stat_1_label') },
              { number: t('about.stat_2_number'), label: t('about.stat_2_label') },
              { number: t('about.stat_3_number'), label: t('about.stat_3_label') },
              { number: t('about.stat_4_number'), label: t('about.stat_4_label') }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`text-center transition-all duration-700 ${getAnimationClass(`stat-${idx}`)}`}
                data-scroll-id={`stat-${idx}`}
              >
                <div className="text-6xl font-bold text-primary mb-3">{stat.number}</div>
                <div className="text-gray-600 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20 transition-all duration-700" data-scroll-id="contact-header">
            <div className="text-sm font-semibold text-primary uppercase mb-3" style={{ letterSpacing: '0.8px' }}>
              {t('about.contact_us')}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-5" style={{ letterSpacing: '-0.015em' }}>
              {t('about.get_in_touch')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t('about.look_forward')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: Mail,
                title: t('about.contact_email'),
                content: 'XXL7702@163.com',
                href: 'mailto:XXL7702@163.com'
              },
              {
                icon: Phone,
                title: t('about.contact_phone'),
                content: '13806777702',
                href: 'tel:13806777702'
              },
              {
                icon: MapPin,
                title: t('about.contact_address'),
                content: 'Dongyang, Zhejiang, China',
                href: '#'
              }
            ].map((contact, idx) => {
              const IconComponent = contact.icon
              return (
                <div
                  key={idx}
                  className={`bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-2 transition-all duration-700 text-center ${getAnimationClass(`contact-${idx}`)}`}
                  data-scroll-id={`contact-${idx}`}
                >
                  <IconComponent className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-3">{contact.title}</h4>
                  <a href={contact.href} className="text-2xl font-semibold text-gray-900 hover:text-primary transition-colors">
                    {contact.content}
                  </a>
                </div>
              )
            })}
          </div>

          <div className="text-center transition-all duration-700" data-scroll-id="contact-cta">
            <button
              onClick={() => setShowModal(true)}
              className="inline-block bg-primary text-white px-12 py-4 rounded-full text-lg font-semibold hover:bg-primary-dark transition-all hover:scale-105"
            >
              {t('about.start_partnership')}
            </button>
          </div>
        </div>
      </section>

      {/* Partnership Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-12 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-3xl font-bold">{t('about.modal_title')}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 text-lg mb-8">{t('about.modal_subtitle')}</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('about.form_name')} *</label>
                <input
                  type="text"
                  required
                  placeholder={t('about.form_name_placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('about.form_email')} *</label>
                <input
                  type="email"
                  required
                  placeholder={t('about.form_email_placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('about.form_company')}</label>
                <input
                  type="text"
                  placeholder={t('about.form_company_placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('about.form_phone')}</label>
                <input
                  type="tel"
                  placeholder={t('about.form_phone_placeholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">{t('about.form_message')} *</label>
                <textarea
                  required
                  placeholder={t('about.form_message_placeholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
              >
                {t('about.form_submit')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

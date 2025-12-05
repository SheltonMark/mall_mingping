'use client'

import { useEffect, useState } from 'react'
import { ChevronUp, Globe } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function BackToTop() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const { language, setLanguage } = useLanguage()

  // 监听滚动位置，控制回到顶部按钮显示
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Mobile Language Switch Button - Always visible on mobile */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
        className="md:hidden fixed bottom-8 right-8 z-50 w-12 h-12 bg-white text-neutral-700 rounded-full shadow-lg border border-neutral-200 hover:bg-gold-50 hover:border-primary hover:text-primary transition-all duration-300 flex items-center justify-center"
        aria-label="Switch language"
        style={{ transform: showBackToTop ? 'translateY(-56px)' : 'translateY(0)' }}
      >
        <div className="flex flex-col items-center justify-center">
          <Globe size={16} />
          <span className="text-[10px] font-semibold mt-0.5">{language === 'en' ? '中文' : 'EN'}</span>
        </div>
      </button>

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
    </>
  )
}

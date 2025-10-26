'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-white dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-1/2 -right-1/4 w-3/4 h-3/4 bg-primary/20 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="relative container mx-auto px-6 z-10">
          <div className="grid md:grid-cols-2 items-center gap-12">
            <div className="text-center md:text-left">
              <p className="text-lg font-semibold text-primary animate-swoop-in">Meet LEMOPX</p>
              <h2 className="text-5xl md:text-7xl font-black text-text-light dark:text-text-dark leading-tight tracking-tighter mt-2 animate-swoop-in" style={{ animationDelay: '0.2s' }}>
                {t('home.hero.title')}
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto md:mx-0 animate-swoop-in" style={{ animationDelay: '0.4s' }}>
                {t('home.hero.subtitle')}
              </p>
              <div className="mt-10 flex gap-4 justify-center md:justify-start animate-swoop-in" style={{ animationDelay: '0.6s' }}>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-primary text-base font-bold text-white hover:bg-opacity-90 transform hover:scale-105 transition-all shadow-xl shadow-primary/40"
                >
                  {t('home.hero.cta')}
                </Link>
              </div>
            </div>

            <div className="relative h-[60vh] max-h-[600px] flex items-center justify-end">
              <div className="absolute w-full h-full bg-primary/20 rounded-full blur-3xl -z-10"></div>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjKyh5rah1R8ruyf7HqQa1Opo66EfyzxmjI0qS8yZY_qTDpguTJPjGN6l6YvIEQdKYuGOKxdp9P3t8O0LHCYwBgZLslNXmCcD8oiMpR49zyGgfZ6YGs0e5mTleN2Fr1UdOzdFMlHTyR5Rvk8B8Z7wiUonNBrD_JZN2gdrHNtHTiLWmGiDifwGrF3Mivi7qROjdTv_PIOl9LE7jGXiM9ZCknviMnH5iBd_QDh3NQF3JcZjkqtdl87_S8KzGWWKs2WhtKpESZcz9uKYU"
                alt="LEMOPX Product"
                className="w-full max-w-md lg:max-w-xl h-auto object-contain rounded-xl animate-swoop-in"
                style={{ animationDelay: '0.2s', objectPosition: 'bottom' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - Apple Style Full-Width 2x2 Cards */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="w-full">
          <div className="text-center mb-16 px-6">
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">{t('home.signature.title')}</h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t('home.signature.subtitle')}
            </p>
          </div>

          {/* Apple-style full-width 2x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 1 - Replacement Mop Head */}
            <Link href="/products/group-1" className="group relative h-[500px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD5UYC8qgDXU6D1UE5QnIR2Wz13ZQrdzpzr4AfeNm9noL_BXTbP4jcMVG1yOs3ELCLbZVS4uGpp1ftxuQhni3yhnfbpabiUmRJv6XFvVXisthLUwErS-4lXiHOmmUPO55pJYQF7WFU1EYG2scwoh8KhwmLe3zYv4BG2yilEx4LFvE-MJ-7jCoGNaS7DSINkFmZ9ZhbBQachFpTd2zyKvjpKYVkf6rq5QsrN_eKW2eOdt1cB70KBGDrOQcqQz4BsingVI_ZhkO24kg10")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-10 md:p-12">
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">Replacement Mop Head</h4>
                <p className="text-lg md:text-xl text-white/95 mb-8 text-center">Premium microfiber for superior cleaning performance.</p>
                <div className="flex gap-4 justify-center items-center">
                  <span className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer inline-flex items-center justify-center">
                    {t('home.signature.learn_more')}
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 2 - All-Purpose Cleaner */}
            <Link href="/products/group-2" className="group relative h-[500px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBD5UlYcy8jdVHJcVD1YHJ1YEr2svqy6uJb6FotxOXmECOXu-YCWZbgaP9RPWcrqBWIcjWj_w9NNBSA2bkgy5V1CMzYZH-SXv7jhazfGXZ63jLe8DKo3rrt6YUytp1avbMtXXQs_uu5RuHPX2cz5tw4Rx7h4oJHLP5U7vMiyrZEyOnyCvJUBvtx5RaQRXoTpTgi_KqI4iqf-72o53Z9omRkr4Aw8VukBFwoEFLj1vMXrw7ZcT6T0AAlQolkL2b8CbWWtNYptBvD2T_Y")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-10 md:p-12">
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">All-Purpose Cleaner</h4>
                <p className="text-lg md:text-xl text-white/95 mb-8 text-center">Eco-friendly formula for every surface in your home.</p>
                <div className="flex gap-4 justify-center items-center">
                  <span className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer inline-flex items-center justify-center">
                    {t('home.signature.learn_more')}
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 3 - Dustpan & Brush Set */}
            <Link href="/products/group-3" className="group relative h-[500px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBX8Kfa692hXPI5Bp98AoYM2T1C4HY9zclZFFsN4gMLAYvZf1IQhuGk9OqYsyQPQOcVhAy13cZ7rc4yBHlEaG7rEX1AZeq1vX4lfh2zERXVK3wqHjNIU-zC5cDOC51wFJ6vEwQxr4WTSUPXPIeuGIl6maVViC5gndeLhOhc7xZfI8R9A8SuDIKeTipHsee4wRSEpht3Zta1gUKRUOw1B8jliBH0AOlp2QBuVYd183qE_bEAG5r03pNeP4kWuJDAanJYBF4O4by_11z3")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-10 md:p-12">
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">Dustpan & Brush Set</h4>
                <p className="text-lg md:text-xl text-white/95 mb-8 text-center">Elegant design meets everyday functionality.</p>
                <div className="flex gap-4 justify-center items-center">
                  <span className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer inline-flex items-center justify-center">
                    {t('home.signature.learn_more')}
                  </span>
                </div>
              </div>
            </Link>

            {/* Card 4 - Storage Caddy */}
            <Link href="/products/group-7" className="group relative h-[500px] overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBOkd4HZLcZIaUwwHJ2cgthgbSHkYuGKfNuGwGdbj7dm2n0Tl6VIvUsAigqHq61bTNKyMB9McK4rra6S7v1xuG-imgzSkA9myd7EvlhJJDNDoRWivgk2vRkHx8p6bblP8gOmnTMie11rdKXqYJ8pHxBxX8Ssyc4hd8vX0hJtEoBGHNMFt9NLa4O1S6cqiGZ3HPmslL4uNByqcNi4SL2VRUhOZMTFyJlKjJTQk5dtuG4KJekAxjrHX_aBK-sEptxs8paA2teR9MwsGdF")' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-end p-10 md:p-12">
                <h4 className="text-4xl md:text-5xl font-bold text-white mb-3 text-center">Storage Caddy</h4>
                <p className="text-lg md:text-xl text-white/95 mb-8 text-center">Keep your cleaning essentials beautifully organized.</p>
                <div className="flex gap-4 justify-center items-center">
                  <span className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark transition-colors cursor-pointer inline-flex items-center justify-center">
                    {t('home.signature.learn_more')}
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* VIEW ALL Button */}
          <div className="flex justify-center mt-12">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-12 py-4 bg-primary text-white text-base font-bold rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl animate-breathing hover:animate-none"
            >
              {t('home.signature.view_all')}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-background-dark">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight">{t('home.features.title')}</h3>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <h4 className="mt-6 text-2xl font-bold">{t('home.features.feature1.title')}</h4>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('home.features.feature1.desc')}</p>
            </div>

            <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                </svg>
              </div>
              <h4 className="mt-6 text-2xl font-bold">{t('home.features.feature2.title')}</h4>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('home.features.feature2.desc')}</p>
            </div>

            <div className="p-8 rounded-xl bg-gray-50 dark:bg-gray-900/50 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3L9.27 8.27L4 11L9.27 13.73L12 19L14.73 13.73L20 11L14.73 8.27L12 3z"></path>
                  <path d="M4 11L2 9"></path>
                  <path d="M20 11L22 13"></path>
                  <path d="M4 11L2 13"></path>
                  <path d="M20 11L22 9"></path>
                  <path d="M12 3L11 1"></path>
                  <path d="M12 19L13 21"></path>
                  <path d="M12 3L13 1"></path>
                  <path d="M12 19L11 21"></path>
                </svg>
              </div>
              <h4 className="mt-6 text-2xl font-bold">{t('home.features.feature3.title')}</h4>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{t('home.features.feature3.desc')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

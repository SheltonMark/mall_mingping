'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, User, ShoppingCart, ChevronDown, FileText, LogOut } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Mock login state - in real app, this would come from auth context/state management
  const [isLoggedIn, setIsLoggedIn] = useState(true)

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsUserMenuOpen(false)
    router.push('/')
    alert('Logged out successfully!')
  }

  return (
    <header className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 print:hidden">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-lg group-hover:scale-105 transition-transform">
                L
              </div>
              <span className="text-2xl font-black tracking-tighter text-primary">LEMOPX</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className={`text-sm font-medium ${
                  isActive('/') ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium ${
                  isActive('/products') ? 'text-primary' : 'hover:text-primary'
                }`}
              >
                {t('nav.products')}
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium hover:text-primary"
              >
                {t('nav.about')}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="form-input w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light dark:text-text-dark bg-gray-200/50 dark:bg-gray-800/50 focus:outline-0 focus:ring-2 focus:ring-primary border-transparent h-10 placeholder:text-gray-400 pl-10 text-sm font-normal"
                placeholder={t('nav.search')}
                type="text"
              />
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-2 rounded-lg h-10 px-3 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer">
              <button
                onClick={() => setLanguage('en')}
                className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                  language === 'en'
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                EN
              </button>
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
              <button
                onClick={() => setLanguage('zh')}
                className={`text-sm font-semibold px-2 py-1 rounded transition-colors ${
                  language === 'zh'
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-text-light dark:hover:text-text-dark'
                }`}
              >
                中文
              </button>
            </div>

            {/* User & Cart Icons */}
            <div className="flex gap-2">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                  className="flex items-center justify-center gap-1 rounded-lg h-10 px-3 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="text-text-light dark:text-text-dark" size={20} />
                  <ChevronDown
                    className={`w-4 h-4 text-text-light dark:text-text-dark transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                    {isLoggedIn ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {t('nav.account')}: 3579
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {t('order_confirm.name_qianqian')}
                          </p>
                        </div>

                        {/* Menu Items */}
                        <Link
                          href="/customer-profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>{t('nav.customer_profile')}</span>
                        </Link>

                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FileText className="w-4 h-4" />
                          <span>{t('nav.my_orders')}</span>
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>{t('nav.login')}</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <Link
                href="/cart"
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800"
              >
                <ShoppingCart className="text-text-light dark:text-text-dark" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, User, ShoppingCart, ChevronDown, LogOut, Globe, Menu, X } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useToast } from '@/components/common/ToastContainer'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const toast = useToast()
  const { language, setLanguage, t } = useLanguage()
  const { customer, isAuthenticated, logout } = useAuth()
  const { totalItems, logoutCart, syncCartOnLogin } = useCart()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sync cart when customer logs in
  useEffect(() => {
    if (customer?.id && isAuthenticated) {
      const token = localStorage.getItem('customer_token')
      if (token) {
        syncCartOnLogin(token)
      }
    }
  }, [customer?.id, isAuthenticated])

  const isActive = (path: string) => pathname === path

  const handleLogout = () => {
    logout()
    logoutCart()
    setIsUserMenuOpen(false)
    toast.success(t('auth.logout_success'))
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-250 ${
        isScrolled ? 'py-4 border-b border-black/5' : 'py-6'
      }`}
      style={{
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)',
        boxShadow: isScrolled ? 'var(--shadow-soft)' : 'none',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between relative z-10">
          {/* Logo */}
          <Link
            href="/"
            className="relative transition-opacity duration-250 hover:opacity-80"
          >
            <img
              src="/images/logo.svg"
              alt="LEMOPX"
              className="h-12 md:h-16 w-auto"
            />
          </Link>

          {/* Center Navigation with dot indicators - Desktop */}
          <nav className="hidden md:flex items-center gap-4 md:gap-12" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}>
            <Link
              href="/"
              className={`relative text-xs md:text-sm font-normal transition-colors duration-250 ${
                isActive('/') ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t('nav.home')}
              <span className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full transition-opacity duration-250 ${
                isActive('/') ? 'opacity-100' : 'opacity-0'
              }`}></span>
            </Link>
            <Link
              href="/products"
              className={`relative text-xs md:text-sm font-normal transition-colors duration-250 ${
                isActive('/products') ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {t('nav.products')}
              <span className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full transition-opacity duration-250 ${
                isActive('/products') ? 'opacity-100' : 'opacity-0'
              }`}></span>
            </Link>
            <Link
              href="/about"
              className={`relative text-xs md:text-sm font-normal transition-colors duration-250 ${
                isActive('/about') ? 'text-neutral-900' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {language === 'zh' ? '联系我们' : 'Contact'}
              <span className={`absolute top-[-8px] left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full transition-opacity duration-250 ${
                isActive('/about') ? 'opacity-100' : 'opacity-0'
              }`}></span>
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-6">
            {/* Mobile Menu Button - Only visible on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 hover:bg-gold-50 transition-all duration-250"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Language Switcher Button - Hidden on mobile */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-transparent border border-neutral-300 rounded-full text-xs font-semibold tracking-[0.05em] text-neutral-600 hover:border-primary hover:text-primary hover:bg-gold-50 transition-all duration-250"
            >
              <Globe size={14} />
              <span>{language === 'en' ? '中文' : 'EN'}</span>
            </button>

            {/* User Button with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-neutral-100 border-2 border-transparent hover:border-primary hover:bg-gold-50 hover:-translate-y-0.5 transition-all duration-250"
              >
                <User className="text-neutral-600 hover:text-primary transition-colors" size={18} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-large border border-neutral-200 dark:border-gray-700 py-2 z-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif' }}>
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {customer?.name || customer?.email}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-gray-400">
                          {customer?.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>{t('nav.my_account')}</span>
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
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gold-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{t('nav.login')}</span>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button with Badge */}
            {isAuthenticated ? (
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-900 hover:bg-primary hover:border-primary hover:-translate-y-0.5 transition-all duration-250"
                style={{ boxShadow: 'var(--shadow-medium)' }}
              >
                <ShoppingCart className="text-white" size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-[18px] h-[18px] bg-red-500 text-white rounded-full text-[0.625rem] font-bold border-2 border-white">
                    {totalItems}
                  </span>
                )}
              </Link>
            ) : (
              <button
                onClick={() => {
                  toast.warning(t('cart.please_login'))
                  // Save current page for redirect after login
                  sessionStorage.setItem('redirect_after_login', pathname)
                  setTimeout(() => router.push('/login'), 1500)
                }}
                className="relative flex items-center justify-center w-9 h-9 rounded-full bg-neutral-900 border-2 border-neutral-900 hover:bg-primary hover:border-primary hover:-translate-y-0.5 transition-all duration-250"
                style={{ boxShadow: 'var(--shadow-medium)' }}
              >
                <ShoppingCart className="text-white" size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)'
            }}
          >
            <nav className="flex flex-col py-4">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-4 text-base font-normal transition-colors ${
                  isActive('/') ? 'text-neutral-900 bg-gold-50' : 'text-neutral-600 hover:bg-gray-50'
                }`}
              >
                {t('nav.home')}
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-4 text-base font-normal transition-colors ${
                  isActive('/products') ? 'text-neutral-900 bg-gold-50' : 'text-neutral-600 hover:bg-gray-50'
                }`}
              >
                {t('nav.products')}
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-6 py-4 text-base font-normal transition-colors ${
                  isActive('/about') ? 'text-neutral-900 bg-gold-50' : 'text-neutral-600 hover:bg-gray-50'
                }`}
              >
                {language === 'zh' ? '联系我们' : 'Contact'}
              </Link>

              {/* Language Switcher in Mobile Menu */}
              <button
                onClick={() => {
                  setLanguage(language === 'en' ? 'zh' : 'en')
                  setIsMobileMenuOpen(false)
                }}
                className="mx-6 mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-neutral-300 rounded-full text-sm font-semibold text-neutral-600 hover:border-primary hover:text-primary hover:bg-gold-50 transition-all"
              >
                <Globe size={16} />
                <span>{language === 'en' ? '中文' : 'EN'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

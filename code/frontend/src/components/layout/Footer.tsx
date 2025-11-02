'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer
      className="bg-neutral-900 text-neutral-400 py-24 px-6 border-t border-neutral-800 print:hidden"
    >
      <div className="max-w-[1440px] mx-auto">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-16">
          {/* Brand Column */}
          <div>
            <h3
              className="text-3xl font-light text-primary mb-6 tracking-[0.08em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              LEMOPX
            </h3>
            <p className="text-neutral-500 leading-relaxed">
              {t('footer.tagline') || 'Crafting excellent cleaning solutions with artisan spirit, creating elegant living experiences for global clients.'}
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-[0.1em] uppercase mb-6">
              {t('footer.products') || 'Products'}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.all_products') || 'Cleaning Tools'}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.new_arrivals') || 'Kitchen Items'}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.best_sellers') || 'Storage Solutions'}
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Professional Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-[0.1em] uppercase mb-6">
              {t('footer.company') || 'Company'}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.about') || 'About Us'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.careers') || 'Careers'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-[0.1em] uppercase mb-6">
              {t('footer.support') || 'Support'}
            </h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.contact_us') || 'Contact Us'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-neutral-800 pt-12 text-center">
          <p className="text-neutral-600 text-sm">
            {t('footer.copyright') || '© 2025 LEMOPX. Crafted with excellence in Dongyang.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

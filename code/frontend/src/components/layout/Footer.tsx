'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Footer() {
  const { t } = useLanguage()
  const [socialMedia, setSocialMedia] = useState<any>({})

  // 加载社交媒体配置
  useEffect(() => {
    const loadSocialMedia = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/system/site`)
        if (response.ok) {
          const data = await response.json()
          if (data.social_media) {
            setSocialMedia(typeof data.social_media === 'string' ? JSON.parse(data.social_media) : data.social_media)
          }
        }
      } catch (error) {
        console.error('Failed to load social media config:', error)
      }
    }
    loadSocialMedia()
  }, [])

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
        <div className="border-t border-neutral-800 pt-12">
          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <a
              href={socialMedia.facebook || '#'}
              target={socialMedia.facebook ? '_blank' : undefined}
              rel={socialMedia.facebook ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.facebook && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.facebook ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href={socialMedia.twitter || '#'}
              target={socialMedia.twitter ? '_blank' : undefined}
              rel={socialMedia.twitter ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.twitter && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.twitter ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a
              href={socialMedia.instagram || '#'}
              target={socialMedia.instagram ? '_blank' : undefined}
              rel={socialMedia.instagram ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.instagram && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.instagram ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
            <a
              href={socialMedia.linkedin || '#'}
              target={socialMedia.linkedin ? '_blank' : undefined}
              rel={socialMedia.linkedin ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.linkedin && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.linkedin ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={socialMedia.youtube || '#'}
              target={socialMedia.youtube ? '_blank' : undefined}
              rel={socialMedia.youtube ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.youtube && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.youtube ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="YouTube"
            >
              <Youtube size={18} />
            </a>
            <a
              href={socialMedia.email ? `mailto:${socialMedia.email}` : '#'}
              onClick={(e) => !socialMedia.email && e.preventDefault()}
              className={`w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 transition-all duration-250 ${
                socialMedia.email ? 'hover:bg-primary hover:text-neutral-900 cursor-pointer' : 'opacity-50 cursor-default'
              }`}
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-neutral-600 text-sm text-center">
            {t('footer.copyright') || '© 2025 LEMOPX. Crafted with excellence in Dongyang.'}
          </p>
        </div>
      </div>
    </footer>
  )
}

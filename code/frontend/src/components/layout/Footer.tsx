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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-16 mb-16 items-start">
          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <img
                src="/images/logo-light.svg"
                alt="LEMOPX"
                className="h-16 md:h-18 w-auto"
              />
            </Link>
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
                  {t('footer.professional_series')}
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
                  {t('footer.our_story')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.sustainability')}
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
                  {t('footer.help_center')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.privacy_policy')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-500 hover:text-primary transition-colors duration-250 text-[0.9375rem]">
                  {t('footer.terms_of_service')}
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
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="Facebook"
            >
              <Facebook size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
            <a
              href={socialMedia.twitter || '#'}
              target={socialMedia.twitter ? '_blank' : undefined}
              rel={socialMedia.twitter ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.twitter && e.preventDefault()}
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="Twitter"
            >
              <Twitter size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
            <a
              href={socialMedia.instagram || '#'}
              target={socialMedia.instagram ? '_blank' : undefined}
              rel={socialMedia.instagram ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.instagram && e.preventDefault()}
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="Instagram"
            >
              <Instagram size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
            <a
              href={socialMedia.linkedin || '#'}
              target={socialMedia.linkedin ? '_blank' : undefined}
              rel={socialMedia.linkedin ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.linkedin && e.preventDefault()}
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
            <a
              href={socialMedia.youtube || '#'}
              target={socialMedia.youtube ? '_blank' : undefined}
              rel={socialMedia.youtube ? 'noopener noreferrer' : undefined}
              onClick={(e) => !socialMedia.youtube && e.preventDefault()}
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="YouTube"
            >
              <Youtube size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
            <a
              href={socialMedia.email ? `mailto:${socialMedia.email}` : '#'}
              onClick={(e) => !socialMedia.email && e.preventDefault()}
              className="group w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center transition-all duration-250 cursor-pointer border-2 border-neutral-800 hover:border-primary"
              aria-label="Email"
            >
              <Mail size={18} className="text-neutral-400 group-hover:text-primary transition-colors duration-250" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-neutral-600 text-sm text-center space-x-2">
            <span>© 2025 LEMOPX. All rights reserved.</span>
            <span>|</span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors duration-250"
            >
              浙ICP备2025204932号
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

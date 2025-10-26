'use client'

import Link from 'next/link'
import { Grid3x3 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-200 dark:bg-gray-900/50 mt-16">
      <div className="container mx-auto px-6 py-12">
        {/* Logo Section */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center font-bold text-white text-xl group-hover:scale-105 transition-transform">
              L
            </div>
            <span className="text-3xl font-black tracking-tighter text-primary">LEMOPX</span>
          </Link>
          <p className="mt-4 text-base text-gray-500 dark:text-gray-400 max-w-md">
            Revolutionizing cleaning with innovative, eco-friendly products that make your life easier and your home cleaner.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><span className="text-base text-gray-400 cursor-not-allowed" title="Coming soon">About</span></li>
              <li><span className="text-base text-gray-400 cursor-not-allowed" title="Coming soon">Contact</span></li>
              <li><a className="text-base text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">Products</h3>
            <ul className="mt-4 space-y-4">
              <li><Link href="/products" className="text-base text-gray-500 dark:text-gray-400 hover:text-primary">All Products</Link></li>
              <li><a className="text-base text-gray-500 dark:text-gray-400 hover:text-primary" href="#">New Arrivals</a></li>
              <li><a className="text-base text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Best Sellers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">Support</h3>
            <ul className="mt-4 space-y-4">
              <li><span className="text-base text-gray-400 cursor-not-allowed" title="Coming soon">Contact Us</span></li>
              <li><a className="text-base text-gray-500 dark:text-gray-400 hover:text-primary" href="#">FAQ</a></li>
              <li><a className="text-base text-gray-500 dark:text-gray-400 hover:text-primary" href="#">Shipping & Returns</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-gray-100">Newsletter</h3>
            <p className="mt-4 text-base text-gray-500 dark:text-gray-400">Get the latest updates and promotions.</p>
            <form className="mt-4">
              <input
                className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                placeholder="Enter your email"
                type="email"
              />
              <button
                className="w-full px-4 py-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 transition-all"
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 dark:border-gray-700 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-base text-gray-400">© 2024 LEMOPX. All rights reserved.</p>
          <div className="flex space-x-6">
            <a className="text-gray-400 hover:text-primary transition-colors" href="#" aria-label="Facebook">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
              </svg>
            </a>
            <a className="text-gray-400 hover:text-primary transition-colors" href="#" aria-label="Instagram">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zM12 7.167a4.833 4.833 0 100 9.666 4.833 4.833 0 000-9.666zM12 15a3 3 0 110-6 3 3 0 010 6zm6.406-11.845a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z" fillRule="evenodd"></path>
              </svg>
            </a>
            <a className="text-gray-400 hover:text-primary transition-colors" href="#" aria-label="Twitter">
              <svg aria-hidden="true" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

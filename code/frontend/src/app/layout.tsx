import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CartProvider } from '@/context/CartContext'
import { LanguageProvider } from '@/context/LanguageContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
        <LanguageProvider>
          <CartProvider>
            <div className="relative flex h-auto min-h-screen w-full flex-col">
              <div className="layout-container flex h-full grow flex-col">
                <Navbar />
                <main>{children}</main>
                <Footer />
              </div>
            </div>
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BackToTop from '@/components/BackToTop'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="relative flex h-auto min-h-screen w-full flex-col">
          <div className="layout-container flex h-full grow flex-col">
            <Navbar />
            <main>{children}</main>
            <Footer />
          <BackToTop />
          </div>
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Preloader from '@/components/layout/Preloader'
import CursorFollower from '@/components/layout/CursorFollower'
import { CartProvider } from '@/context/CartContext'

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <CursorFollower />
      <Preloader />
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        <div className="layout-container flex h-full grow flex-col">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </div>
    </CartProvider>
  )
}

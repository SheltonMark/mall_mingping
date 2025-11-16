import './globals.css'
import { ToastProvider } from '@/components/common/ToastContainer'

export const metadata = {
  title: 'LEMOPX',
  description: 'Professional B2B E-commerce Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
          <ToastProvider>
            {children}
          </ToastProvider>
      </body>
    </html>
  )
}

import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'

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
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}

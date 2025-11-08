'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile page
    router.replace('/profile')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}

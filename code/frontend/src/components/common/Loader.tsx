'use client'

/**
 * Modern Loading Components
 * Inspired by Uiverse.io - Professional and minimalist loaders
 */

// 1. Spinner Loader - Simple rotating spinner
export function SpinnerLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={`inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-200 border-t-primary
          rounded-full animate-spin
        `}
      />
    </div>
  )
}

// 2. Dots Loader - Three bouncing dots
export function DotsLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" />
    </div>
  )
}

// 3. Pulse Loader - Expanding circles
export function PulseLoader({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      <div className="absolute inset-2 rounded-full bg-primary/40 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-primary" />
    </div>
  )
}

// 4. Full Page Loader - For page transitions
export function FullPageLoader({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9998] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Gradient Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 animate-pulse" />
        </div>

        {/* Loading Text */}
        {message && (
          <div className="flex items-center gap-2">
            <p className="text-gray-700 font-medium">{message}</p>
            <DotsLoader />
          </div>
        )}
      </div>
    </div>
  )
}

// 5. Button Loader - For loading buttons
export function ButtonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      <span>处理中...</span>
    </div>
  )
}

// 6. Card Skeleton - For loading cards
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="space-y-4">
            {/* Image placeholder */}
            <div className="w-full h-48 bg-gray-200 rounded-lg" />

            {/* Title */}
            <div className="h-4 bg-gray-200 rounded w-3/4" />

            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Action button placeholder */}
            <div className="h-10 bg-gray-200 rounded-lg w-24" />
          </div>
        </div>
      ))}
    </>
  )
}

// 7. Table Skeleton - For loading tables
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Table header */}
      <div className="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-100">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-3 bg-gray-200 rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}

// 8. Inline Loader - For inline loading states
export function InlineLoader({ text = '加载中' }: { text?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-gray-600">
      <SpinnerLoader size="sm" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

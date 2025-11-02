'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

export default function Toast({ id, type, message, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const config = {
    success: {
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-white',
      iconColor: 'text-emerald-500',
      progressBar: 'bg-emerald-500',
    },
    error: {
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
      bg: 'bg-white',
      iconColor: 'text-red-500',
      progressBar: 'bg-red-500',
    },
    warning: {
      icon: AlertTriangle,
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-white',
      iconColor: 'text-amber-500',
      progressBar: 'bg-amber-500',
    },
    info: {
      icon: Info,
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-white',
      iconColor: 'text-blue-500',
      progressBar: 'bg-blue-500',
    },
  }

  const { icon: Icon, gradient, bg, iconColor, progressBar } = config[type]

  return (
    <div
      className={`
        ${bg} rounded-xl shadow-2xl overflow-hidden
        border border-gray-200/50
        min-w-[320px] max-w-md
        transform transition-all duration-300 ease-out
        animate-slideInRight
      `}
      role="alert"
    >
      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-100 relative overflow-hidden">
        <div
          className={`h-full ${progressBar} animate-shrinkWidth`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>

      <div className="p-4 flex items-start gap-3">
        {/* Icon with gradient background */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          aria-label="关闭通知"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// CSS animations (add to globals.css)
/*
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shrinkWidth {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

.animate-slideInRight {
  animation: slideInRight 0.3s ease-out;
}

.animate-shrinkWidth {
  animation: shrinkWidth linear;
}
*/

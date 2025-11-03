'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Preloader() {
  const pathname = usePathname()
  const [isLoaded, setIsLoaded] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [shouldShow, setShouldShow] = useState(false)

  useEffect(() => {
    // 只在首页且首次访问时显示
    const hasSeenPreloader = sessionStorage.getItem('hasSeenPreloader')
    const isHomePage = pathname === '/'

    // 如果不是首页，或者已经看过preloader，直接跳过
    if (!isHomePage || hasSeenPreloader) {
      setIsLoaded(true)
      setShouldShow(false)
      return
    }

    // 标记已经看过preloader
    sessionStorage.setItem('hasSeenPreloader', 'true')
    setShouldShow(true)

    // 所有字母飞入后开始呼吸动画
    const breathingTimer = setTimeout(() => {
      setShowBreathing(true)
    }, 1400) // 6 letters × 100ms delay + 800ms animation

    // 2.8秒后开始向上滑出
    const exitTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 2800)

    return () => {
      clearTimeout(breathingTimer)
      clearTimeout(exitTimer)
    }
  }, [pathname])

  // 如果不需要显示，直接返回null
  if (!shouldShow) {
    return null
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-900 transition-all duration-[1200ms] ${
        isLoaded ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)'
      }}
    >
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-radial-glow animate-pulse-slow" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Logo Container */}
      <div className="relative flex items-center justify-center">
        {/* Glow Effect Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl transition-all duration-1000 ${
            showBreathing ? 'animate-glow-pulse scale-110' : 'scale-100 opacity-0'
          }`} />
        </div>

        {/* Letter Container */}
        <div
          className={`flex gap-[0.1em] tracking-[0.15em] relative z-10 ${
            showBreathing ? 'animate-logo-breathing' : ''
          }`}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(3rem, 10vw, 6rem)'
          }}
        >
          {['L', 'E', 'M', 'O', 'P', 'X'].map((letter, index) => (
            <span
              key={letter}
              className="inline-block relative opacity-0 animate-letter-fly-in"
              style={{
                animationDelay: `${(index + 1) * 100}ms`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Letter Glow */}
              <span className="absolute inset-0 text-primary blur-md animate-shimmer"
                style={{
                  animationDelay: `${(index + 1) * 100 + 800}ms`
                }}
              >
                {letter}
              </span>

              {/* Main Letter */}
              <span className="relative text-primary">
                {letter}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-64">
        <div className="h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/50 animate-progress-fill" />
        </div>
      </div>

      <style jsx>{`
        /* Letter Fly-in Animation - Enhanced */
        @keyframes letter-fly-in {
          0% {
            opacity: 0;
            transform: translateY(120px) rotateX(-90deg) scale(0.8);
            filter: blur(10px);
          }
          60% {
            transform: translateY(-12px) rotateX(12deg) scale(1.05);
            filter: blur(0px);
          }
          80% {
            transform: translateY(2px) rotateX(-2deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) rotateX(0deg) scale(1);
            filter: blur(0px);
          }
        }

        .animate-letter-fly-in {
          animation: letter-fly-in 0.9s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Logo Breathing Animation */
        @keyframes logo-breathing {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.03);
            filter: brightness(1.15);
          }
        }

        .animate-logo-breathing {
          animation: logo-breathing 2.5s ease-in-out infinite;
        }

        /* Glow Pulse */
        @keyframes glow-pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 2.5s ease-in-out infinite;
        }

        /* Shimmer Effect */
        @keyframes shimmer {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        /* Floating Particles */
        @keyframes float-particle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translate(20px, -50px) scale(1.5);
            opacity: 0.3;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translate(0, -100px) scale(0.5);
            opacity: 0;
          }
        }

        .animate-float-particle {
          animation: float-particle linear infinite;
        }

        /* Progress Bar Fill */
        @keyframes progress-fill {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-progress-fill {
          animation: progress-fill 2.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Radial Glow */
        .bg-gradient-radial-glow {
          background: radial-gradient(circle at 50% 50%, var(--gold-500) 0%, transparent 70%);
        }

        /* Pulse Slow */
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.15;
            transform: scale(1);
          }
          50% {
            opacity: 0.25;
            transform: scale(1.05);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

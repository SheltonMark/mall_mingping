'use client'

import { useEffect, useState } from 'react'

export default function CursorFollower() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0
    let animationId: number

    // Mouse move handler - update target position
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      if (!isVisible) {
        setIsVisible(true)
        currentX = e.clientX
        currentY = e.clientY
      }
    }

    // Smooth animation loop with easing
    const animate = () => {
      // Easing factor: 0.15 means cursor follows 15% of the way each frame
      const easing = 0.15

      currentX += (targetX - currentX) * easing
      currentY += (targetY - currentY) * easing

      setPosition({
        x: currentX,
        y: currentY
      })

      animationId = requestAnimationFrame(animate)
    }

    // Start animation loop
    animationId = requestAnimationFrame(animate)

    // Add mouse move listener
    window.addEventListener('mousemove', handleMouseMove)

    // Add hover listeners for interactive elements
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select'
    )

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
    }
  }, [isVisible])

  // Don't show on mobile/tablet
  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
    return null
  }

  return (
    <>
      {/* Main cursor circle - like a cleaning cloth */}
      <div
        className="custom-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`,
          opacity: isVisible ? 0.6 : 0,
        }}
      />

      <style jsx>{`
        .custom-cursor {
          position: fixed;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(189, 183, 107, 0.4), rgba(189, 183, 107, 0.1));
          border: 2px solid rgba(189, 183, 107, 0.8);
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.2s ease-out, opacity 0.3s ease;
          mix-blend-mode: multiply;
        }

        @media (max-width: 1024px) {
          .custom-cursor {
            display: none;
          }
        }
      `}</style>
    </>
  )
}

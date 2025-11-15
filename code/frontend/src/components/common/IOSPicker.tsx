'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface IOSPickerProps {
  options: string[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const ITEM_HEIGHT = 44 // 每个选项的高度 (px)
const VISIBLE_ITEMS = 5 // 可见项目数量
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2) // 中间索引

export default function IOSPicker({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false
}: IOSPickerProps) {
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (value) {
      const index = options.indexOf(value)
      return index >= 0 ? index : 0
    }
    return 0
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(0)
  const isDragging = useRef(false)
  const lastY = useRef(0)
  const velocity = useRef(0)

  // 触觉反馈（仅移动端）
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // 10ms震动
    }
  }

  // 音效反馈（可选）
  const playClickSound = () => {
    // 创建一个短促的音效
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.05)
  }

  // 滚动到指定索引
  const scrollToIndex = (index: number, playSound = true) => {
    const clampedIndex = Math.max(0, Math.min(options.length - 1, index))
    const targetY = -clampedIndex * ITEM_HEIGHT

    animate(y, targetY, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8,
      onUpdate: (latest) => {
        const currentIndex = Math.round(-latest / ITEM_HEIGHT)
        if (currentIndex !== selectedIndex && currentIndex >= 0 && currentIndex < options.length) {
          setSelectedIndex(currentIndex)
          onChange(options[currentIndex])
          if (playSound) {
            triggerHaptic()
            playClickSound() // 启用音效
          }
        }
      }
    })
  }

  // 处理鼠标滚轮
  const handleWheel = (e: React.WheelEvent) => {
    if (disabled) return
    e.preventDefault()
    const delta = Math.sign(e.deltaY)
    const newIndex = selectedIndex + delta
    if (newIndex >= 0 && newIndex < options.length) {
      scrollToIndex(newIndex)
    }
  }

  // 处理触摸/拖拽开始
  const handleDragStart = () => {
    if (disabled) return
    isDragging.current = true
    lastY.current = y.get()
  }

  // 处理拖拽中
  const handleDrag = (event: any, info: any) => {
    if (disabled || !isDragging.current) return
    velocity.current = info.velocity.y
  }

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (disabled || !isDragging.current) return
    isDragging.current = false

    const currentY = y.get()
    let targetIndex = Math.round(-currentY / ITEM_HEIGHT)

    // 根据速度增加惯性滚动
    if (Math.abs(velocity.current) > 500) {
      const momentumOffset = Math.round(velocity.current / 500)
      targetIndex -= momentumOffset
    }

    scrollToIndex(targetIndex)
  }

  // 处理点击选项
  const handleItemClick = (index: number) => {
    if (disabled) return
    scrollToIndex(index)
  }

  // 初始化选中值
  useEffect(() => {
    if (value) {
      const index = options.indexOf(value)
      if (index >= 0 && index !== selectedIndex) {
        scrollToIndex(index, false) // 初始化不播放音效
      }
    }
  }, [value])

  return (
    <div className="relative">
      {/* 选择器容器 */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-xl bg-gray-50 border-2 ${
          disabled ? 'border-gray-200 opacity-50' : 'border-gray-300'
        }`}
        style={{ height: VISIBLE_ITEMS * ITEM_HEIGHT }}
        onWheel={handleWheel}
      >
        {/* 中间高亮区域 */}
        <div
          className="absolute left-0 right-0 bg-primary/10 border-y-2 border-primary pointer-events-none z-10"
          style={{
            top: CENTER_INDEX * ITEM_HEIGHT,
            height: ITEM_HEIGHT,
          }}
        />

        {/* 选项列表 */}
        <motion.div
          className="relative"
          style={{
            y,
            paddingTop: CENTER_INDEX * ITEM_HEIGHT,
            paddingBottom: CENTER_INDEX * ITEM_HEIGHT,
          }}
          drag={disabled ? false : 'y'}
          dragConstraints={{
            top: -(options.length - 1) * ITEM_HEIGHT,
            bottom: 0,
          }}
          dragElastic={0.1}
          dragMomentum={false}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {options.map((option, index) => {
            const distance = Math.abs(index - selectedIndex)
            const opacity = 1 - distance * 0.3
            const scale = 1 - distance * 0.1
            const isSelected = index === selectedIndex

            return (
              <motion.div
                key={index}
                className={`flex items-center justify-center cursor-pointer transition-all ${
                  isSelected ? 'font-bold text-gray-900' : 'text-gray-500'
                }`}
                style={{
                  height: ITEM_HEIGHT,
                  opacity: Math.max(0.3, opacity),
                  scale,
                }}
                onClick={() => handleItemClick(index)}
              >
                <span className="px-4 text-center line-clamp-1">{option}</span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-50 to-transparent pointer-events-none z-20" />

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-20" />
      </div>

      {/* 当前选中值显示（可选） */}
      {!disabled && (
        <div className="mt-2 text-center text-sm text-gray-600">
          已选择: <span className="font-semibold text-gray-900">{options[selectedIndex]}</span>
        </div>
      )}
    </div>
  )
}

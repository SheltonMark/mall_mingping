'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  required?: boolean
}

export default function DatePicker({ value, onChange, className = '', required = false }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const pickerRef = useRef<HTMLDivElement>(null)

  // 关闭日历
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 格式化显示日期
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year} / ${month} / ${day}`
  }

  // 获取当月的所有日期
  const getMonthDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // 当月第一天是星期几 (0-6)
    const firstDay = new Date(year, month, 1).getDay()
    // 当月有多少天
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // 上个月有多少天
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // 填充上个月的日期
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        date: new Date(year, month - 1, daysInPrevMonth - i)
      })
    }

    // 填充当月的日期
    const today = new Date()
    const selectedDate = value ? new Date(value) : null

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = date.toDateString() === today.toDateString()
      const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
        isSelected,
        date
      })
    }

    // 填充下个月的日期，补齐到42个格子（6行7列）
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        date: new Date(year, month + 1, day)
      })
    }

    return days
  }

  // 选择日期
  const handleSelectDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    onChange(`${year}-${month}-${day}`)
    setIsOpen(false)
  }

  // 切换月份
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  // 回到今天
  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    handleSelectDate(today)
  }

  const monthDays = getMonthDays()
  const weekDays = ['一', '二', '三', '四', '五', '六', '日']

  return (
    <div ref={pickerRef} className={`relative ${className}`}>
      {/* 输入框 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 border-2 border-primary/30 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white text-left flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value ? formatDisplayDate(value) : '选择日期'}
        </span>
        <Calendar className="w-5 h-5 text-primary" />
      </button>

      {/* 日历弹出框 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border-2 border-primary rounded-xl shadow-xl p-4 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 月份选择 */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="font-bold text-gray-900">
              {currentMonth.getFullYear()}年{currentMonth.getMonth() + 1}月
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((dayInfo, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectDate(dayInfo.date)}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-lg transition-all
                  ${!dayInfo.isCurrentMonth ? 'text-gray-300' : ''}
                  ${dayInfo.isCurrentMonth && !dayInfo.isSelected && !dayInfo.isToday ? 'text-gray-700 hover:bg-primary/10 hover:text-primary' : ''}
                  ${dayInfo.isToday && !dayInfo.isSelected ? 'bg-primary/20 text-primary font-bold' : ''}
                  ${dayInfo.isSelected ? 'bg-primary text-white font-bold shadow-md' : ''}
                `}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                onChange('')
                setIsOpen(false)
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              清除
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="text-sm text-primary hover:text-primary-dark font-medium transition"
            >
              今天
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

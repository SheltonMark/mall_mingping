'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export default function CustomSelect({
  options,
  value,
  onChange,
  className = '',
  placeholder = 'Select...'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  // 获取当前选中的选项
  const selectedOption = options.find(opt => opt.value === value)

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* 选择框按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full appearance-none rounded-lg bg-white border-2 transition-all duration-200 py-2.5 pl-4 pr-12 text-sm font-medium text-gray-700 cursor-pointer shadow-sm ${
          isOpen
            ? 'border-primary shadow-md'
            : 'border-gray-200 hover:border-primary hover:shadow'
        }`}
      >
        <span className="block text-left truncate">
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          size={18}
        />
      </button>

      {/* 下拉选项 - 圆角设计，带动画 */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-primary rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors duration-150 flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={16} className="text-primary" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

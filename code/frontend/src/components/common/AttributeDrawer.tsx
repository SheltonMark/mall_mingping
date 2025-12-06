'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'

interface AttributeDrawerProps {
  options: string[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  language?: 'zh' | 'en'
  title?: string
}

export default function AttributeDrawer({
  options,
  value,
  onChange,
  placeholder = '请选择',
  language = 'zh',
  title
}: AttributeDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [selectedAttr, setSelectedAttr] = useState<string | null>(value || null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 同步外部value变化
  useEffect(() => {
    setSelectedAttr(value || null)
  }, [value])

  // 打开时聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // 打开时禁止body滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const filteredOptions = options.filter(attr =>
    attr.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleOpen = () => {
    setIsOpen(true)
    setSearchValue('')
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleSelect = (attr: string) => {
    setSelectedAttr(attr)
  }

  const handleConfirm = () => {
    if (selectedAttr) {
      onChange(selectedAttr)
      handleClose()
    }
  }

  return (
    <>
      {/* 触发按钮 */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-left hover:border-primary transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 遮罩 */}
      <div
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-1000 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={handleClose}
      />

      {/* 抽屉面板 */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-gray-100 z-[101] flex flex-col shadow-2xl transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 头部 - 顶部留出导航栏空间 */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 pt-20 lg:pt-24">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-xl font-bold text-gray-900">
              {title || (language === 'zh' ? '选择附加属性' : 'Select Attribute')}
            </h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* 搜索框 */}
          <div className="px-4 pb-4">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={language === 'zh' ? '搜索属性...' : 'Search attributes...'}
                className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-primary text-base"
              />
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div
          className={`flex-1 overflow-y-auto p-4 transition-opacity duration-500 ${
            isOpen ? 'opacity-100 delay-500' : 'opacity-0'
          }`}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db transparent'
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              {language === 'zh' ? '无匹配结果' : 'No matching results'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOptions.map((attr, index) => {
                const isSelected = selectedAttr === attr
                return (
                  <div
                    key={index}
                    onClick={() => handleSelect(attr)}
                    className={`bg-white rounded-none p-4 cursor-pointer border-2 transition-all shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent hover:border-primary/50'
                    }`}
                  >
                    <span className="text-gray-800 leading-relaxed">{attr}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 底部确认按钮 */}
        <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
          <button
            onClick={handleConfirm}
            disabled={!selectedAttr}
            className="w-full py-4 bg-primary text-white rounded-none font-semibold hover:bg-primary-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {language === 'zh' ? '确认选择' : 'Confirm'}
          </button>
          {/* iOS安全区域占位 */}
          <div className="h-[env(safe-area-inset-bottom)]"></div>
        </div>
      </div>

      {/* 自定义滚动条样式 */}
      <style jsx global>{`
        .attribute-drawer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .attribute-drawer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .attribute-drawer-scroll::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        .attribute-drawer-scroll::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  )
}

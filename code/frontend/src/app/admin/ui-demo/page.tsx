'use client'

import { useState } from 'react'
import { useToast } from '@/components/common/ToastContainer'
import {
  SpinnerLoader,
  DotsLoader,
  PulseLoader,
  FullPageLoader,
  ButtonLoader,
  CardSkeleton,
  TableSkeleton,
  InlineLoader
} from '@/components/common/Loader'

export default function ComponentsDemoPage() {
  const toast = useToast()
  const [showFullPageLoader, setShowFullPageLoader] = useState(false)
  const [loadingButton, setLoadingButton] = useState(false)

  const handleFullPageLoad = () => {
    setShowFullPageLoader(true)
    setTimeout(() => {
      setShowFullPageLoader(false)
      toast.success('页面加载完成！')
    }, 3000)
  }

  const handleButtonClick = () => {
    setLoadingButton(true)
    setTimeout(() => {
      setLoadingButton(false)
      toast.success('操作成功完成！')
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
      <div className="max-w-[1440px] mx-auto px-6">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            现代化 UI 组件演示
          </h1>
          <p className="text-gray-600">
            基于 Uiverse.io 风格的 Toast 通知和 Loading 动画组件
          </p>
        </div>

        {/* Toast Notifications Demo */}
        <section className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔔 Toast 通知组件
          </h2>
          <p className="text-gray-600 mb-6">
            替代原生 alert() 的现代化通知系统，支持成功、错误、警告、信息四种类型
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => toast.success('操作成功！数据已保存')}
              className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
            >
              ✓ 成功通知
            </button>

            <button
              onClick={() => toast.error('操作失败！请稍后重试')}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              ✕ 错误通知
            </button>

            <button
              onClick={() => toast.warning('警告：库存即将不足')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
            >
              ⚠ 警告通知
            </button>

            <button
              onClick={() => toast.info('新消息：您有一个待处理订单')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              ℹ 信息通知
            </button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>使用方法：</strong> 在组件中使用 <code className="px-2 py-1 bg-white rounded">const toast = useToast()</code>，
              然后调用 <code className="px-2 py-1 bg-white rounded">toast.success()</code>、
              <code className="px-2 py-1 bg-white rounded">toast.error()</code> 等方法
            </p>
          </div>
        </section>

        {/* Loading Components Demo */}
        <section className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⏳ Loading 加载组件
          </h2>

          {/* Spinners */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">旋转加载器</h3>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <SpinnerLoader size="sm" />
                <p className="text-xs text-gray-600 mt-2">Small</p>
              </div>
              <div className="text-center">
                <SpinnerLoader size="md" />
                <p className="text-xs text-gray-600 mt-2">Medium</p>
              </div>
              <div className="text-center">
                <SpinnerLoader size="lg" />
                <p className="text-xs text-gray-600 mt-2">Large</p>
              </div>
            </div>
          </div>

          {/* Dots Loader */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">点状加载器</h3>
            <DotsLoader />
          </div>

          {/* Pulse Loader */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">脉冲加载器</h3>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <PulseLoader size="sm" />
                <p className="text-xs text-gray-600 mt-2">Small</p>
              </div>
              <div className="text-center">
                <PulseLoader size="md" />
                <p className="text-xs text-gray-600 mt-2">Medium</p>
              </div>
              <div className="text-center">
                <PulseLoader size="lg" />
                <p className="text-xs text-gray-600 mt-2">Large</p>
              </div>
            </div>
          </div>

          {/* Inline Loader */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">内联加载器</h3>
            <InlineLoader text="正在加载数据" />
          </div>

          {/* Button with Loading */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">加载按钮</h3>
            <button
              onClick={handleButtonClick}
              disabled={loadingButton}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
            >
              {loadingButton ? <ButtonLoader /> : '提交表单'}
            </button>
          </div>

          {/* Full Page Loader */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">全屏加载器</h3>
            <button
              onClick={handleFullPageLoad}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
            >
              显示全屏加载
            </button>
          </div>
        </section>

        {/* Skeleton Loaders Demo */}
        <section className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💀 骨架屏加载
          </h2>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">卡片骨架屏</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CardSkeleton count={3} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">表格骨架屏</h3>
            <TableSkeleton rows={5} />
          </div>
        </section>

        {/* Old vs New Comparison */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            📊 新旧对比
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Style */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4">❌ 旧版本（丑陋）</h3>
              <button
                onClick={() => window.alert('这是旧的 alert 弹窗')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded mb-4 w-full"
              >
                原生 alert()
              </button>
              <div className="bg-green-100 border-2 border-green-500 rounded p-4 text-green-800 mb-2">
                成功提示框（页面顶部）
              </div>
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            </div>

            {/* New Style */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">✅ 新版本（现代化）</h3>
              <button
                onClick={() => toast.success('这是新的 Toast 通知！', 5000)}
                className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors mb-4 w-full"
              >
                Toast 通知
              </button>
              <div className="text-sm text-gray-600 mb-4">
                ✓ 右上角滑入动画<br/>
                ✓ 自动消失（可配置）<br/>
                ✓ 多种样式（成功/错误/警告/信息）<br/>
                ✓ 进度条指示<br/>
                ✓ 可堆叠多个通知
              </div>
              <div className="text-center">
                <PulseLoader size="md" />
                <p className="mt-4 text-gray-600">现代化加载动画</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Full Page Loader Component */}
      {showFullPageLoader && <FullPageLoader message="正在加载页面..." />}
    </div>
  )
}

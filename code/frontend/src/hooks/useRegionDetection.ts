'use client'

import { useState, useEffect } from 'react'

export type Region = 'domestic' | 'international'

interface RegionInfo {
  region: Region
  country: string
  isChina: boolean
  loading: boolean
}

/**
 * 检测用户地区
 * 国内用户：显示完整功能（下单等）
 * 国外用户：仅显示浏览功能
 */
export function useRegionDetection(): RegionInfo {
  const [regionInfo, setRegionInfo] = useState<RegionInfo>({
    region: 'domestic', // 默认国内
    country: 'CN',
    isChina: true,
    loading: true,
  })

  useEffect(() => {
    async function detectRegion() {
      try {
        // 方法1：通过免费的IP地理位置API
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000), // 3秒超时
        })

        if (response.ok) {
          const data = await response.json()
          const country = data.country_code || 'CN'
          const isChina = country === 'CN'

          setRegionInfo({
            region: isChina ? 'domestic' : 'international',
            country,
            isChina,
            loading: false,
          })
        } else {
          // 如果API失败，默认国内
          setRegionInfo({
            region: 'domestic',
            country: 'CN',
            isChina: true,
            loading: false,
          })
        }
      } catch (error) {
        // 如果检测失败（网络问题等），默认国内
        // 这样不会影响国内用户体验
        console.warn('Region detection failed:', error)
        setRegionInfo({
          region: 'domestic',
          country: 'CN',
          isChina: true,
          loading: false,
        })
      }
    }

    detectRegion()
  }, [])

  return regionInfo
}

/**
 * 检查是否允许下单
 * 国内用户：允许
 * 国外用户：不允许
 */
export function useCanPlaceOrder() {
  const { isChina, loading } = useRegionDetection()
  return { canPlaceOrder: isChina, loading }
}
'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'

export function PendingOrdersIndicator() {
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingMessageCount, setPendingMessageCount] = useState(0)
  const pathname = usePathname()
  const router = useRouter()
  
  const shouldShow = pathname?.startsWith('/admin/') && pathname !== '/admin'

  useEffect(() => {
    if (!shouldShow) return

    const fetchPendingCounts = async () => {
      try {
        // 获取待处理订单数量
        const ordersResponse = await fetch(`${API_URL}${API_ENDPOINTS.ORDERS}/search?status=Pending&pageNum=1&pageSize=1`)
        const ordersData = await ordersResponse.json()
        
        // 获取待处理消息数量
        const messagesResponse = await fetch(`${API_URL}${API_ENDPOINTS.PENDING_MESSAGES}`)
        const messagesData = await messagesResponse.json()
        
        setPendingCount(ordersData.total + messagesData.length)
      } catch (error) {
        console.error('获取待处理数量失败:', error)
      }
    }

    fetchPendingCounts()
    const interval = setInterval(fetchPendingCounts, 3000)
    
    return () => clearInterval(interval)
  }, [shouldShow])

  if (!shouldShow || pendingCount === 0) return null

  return (
    <div 
      className="fixed right-4 bottom-4 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center cursor-pointer shadow-lg hover:bg-red-600 transition-colors"
      onClick={() => router.push('/admin')}
    >
      <div className="text-center">
        <div className="text-lg font-bold">{pendingCount}</div>
        <div className="text-xs">待处理</div>
      </div>
    </div>
  )
}
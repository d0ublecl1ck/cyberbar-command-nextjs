'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { PendingOrdersIndicator } from '@/components/pending-orders-indicator'

type OrderNotificationContextType = {
  pendingCount: number
}

const OrderNotificationContext = createContext<OrderNotificationContextType>({ pendingCount: 0 })

export function OrderNotificationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminSubPage = pathname?.startsWith('/admin/') && pathname !== '/admin'
  const isUserPage = pathname?.startsWith('/user-dashboard')

  // 如果是用户页面，不显示任何内容
  if (isUserPage) {
    return <>{children}</>
  }

  return (
    <OrderNotificationContext.Provider value={{ pendingCount: 0 }}>
      {children}
      {isAdminSubPage && <PendingOrdersIndicator />}
    </OrderNotificationContext.Provider>
  )
}

export const useOrderNotification = () => useContext(OrderNotificationContext)
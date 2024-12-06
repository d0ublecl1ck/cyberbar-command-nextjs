'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function AuthInterceptor({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('adminAuthenticated') === 'true'
      if (!isAuthenticated && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [pathname, router])

  return <>{children}</>
}


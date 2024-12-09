'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function AuthInterceptor({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const cookies = document.cookie.split(';')
      const hasToken = cookies.some(cookie => 
        cookie.trim().startsWith('adminToken=')
      )
      
      if (!hasToken && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [pathname, router])

  return <>{children}</>
}


'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminAuthContextType {
  isAuthenticated: boolean
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  logout: () => {},
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 检查 cookie 而不是 localStorage
    const checkAuth = () => {
      const cookies = document.cookie.split(';')
      const hasToken = cookies.some(cookie => 
        cookie.trim().startsWith('adminToken=')
      )
      setIsAuthenticated(hasToken)
    }

    checkAuth()
    
    // 监听 cookie 变化
    const interval = setInterval(checkAuth, 1000)
    return () => clearInterval(interval)
  }, [])

  const logout = () => {
    // 清除 cookie 而不是 localStorage
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setIsAuthenticated(false)
    router.replace('/admin/login')
  }

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => useContext(AdminAuthContext) 
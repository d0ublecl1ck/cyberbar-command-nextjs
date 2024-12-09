'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// 定义用户类型
type User = {
  id: string
  name: string
  balance: number
}

// 定义认证上下文类型
type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 用户状态管理
  const [user, setUser] = useState<User | null>(null)

  // 初始化时检查本地存储中的认证状态
  useEffect(() => {
    const storedUser = localStorage.getItem('userAuthenticated')
    if (storedUser === 'true') {
      setUser({ id: '1', name: '张三', balance: 100 })
    }
  }, [])

  // 登录处理函数
  const login = (username: string, password: string) => {
    if (username === 'user' && password === 'password') {
      const newUser = { id: '1', name: '张三', balance: 100 }
      setUser(newUser)
      localStorage.setItem('userAuthenticated', 'true')
      return true
    }
    return false
  }

  // 登出处理函数
  const logout = () => {
    setUser(null)
    localStorage.removeItem('userAuthenticated')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type User = {
  id: string
  name: string
  balance: number
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('userAuthenticated')
    if (storedUser === 'true') {
      setUser({ id: '1', name: '张三', balance: 100 })
    }
  }, [])

  const login = (username: string, password: string) => {
    if (username === 'user' && password === 'password') {
      const newUser = { id: '1', name: '张三', balance: 100 }
      setUser(newUser)
      localStorage.setItem('userAuthenticated', 'true')
      return true
    }
    return false
  }

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


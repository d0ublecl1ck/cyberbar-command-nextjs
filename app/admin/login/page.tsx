'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'

interface LoginResponse {
  message: string
  token: string
  admin: {
    id: number
    username: string
  }
}

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // 使用 URLSearchParams 构建查询字符串
      const params = new URLSearchParams({
        username,
        password
      })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.ADMIN_LOGIN}?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const data: LoginResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '登录失败')
      }

      // 保存认证信息
      document.cookie = `adminAuthenticated=true; path=/; max-age=86400; SameSite=Lax`
      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.admin))
      
      toast({
        title: "登录成功",
        description: "正在跳转到管理页面...",
      })

      // 跳转到原来要访问的页面或管理首页
      router.push(from)
      
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "登录失败",
        description: error instanceof Error ? error.message : "请检查用户名和密码",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>管理员登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username">用户名</label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">密码</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
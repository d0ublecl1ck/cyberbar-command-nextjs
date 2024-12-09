'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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

      console.log('Sending login request to:', `${API_URL}/api/admin/login?${params.toString()}`)

      const response = await fetch(`${API_URL}/api/admin/login?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })

      const data = await response.json()
      console.log('Login response data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        throw new Error(data.message || data.error || '登录失败')
      }

      // 检查后端返回的数据结构
      if (!data.data?.token) {
        console.error('Invalid response format:', data)
        throw new Error('登录成功但未收到正确的认证信息')
      }

      // 保存认证信息
      localStorage.setItem('adminToken', data.data.token)
      if (data.data.user) {
        localStorage.setItem('adminUser', JSON.stringify(data.data.user))
      }
      
      toast({
        title: "登录成功",
        description: "正在跳转到管理页面...",
      })

      console.log('Redirecting to:', from)
      
      // 确保在状态更新后再跳转
      setTimeout(() => {
        router.push(from)
        // 强制刷新以确保重新获取页面状态
        router.refresh()
      }, 100)

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


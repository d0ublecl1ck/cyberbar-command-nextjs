'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'

export default function UserLoginPage() {
  const [identifier, setIdentifier] = useState('') // 身份证号或手机号
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [machineId, setMachineId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchIdleMachine = async () => {
      try {
        const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}?status=Idle`)
        if (!response.ok) throw new Error('获取空闲机器失败')
        
        const machines = await response.json()
        if (machines.length > 0) {
          const randomMachine = machines[Math.floor(Math.random() * machines.length)]
          setMachineId(randomMachine.id)
        }
      } catch (error) {
        console.error('Error fetching idle machines:', error)
      }
    }
    fetchIdleMachine()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isIdCard = /^\d{18}$/.test(identifier.trim())
    const isPhone = /^1[3-9]\d{9}$/.test(identifier.trim())
    
    if (!identifier.trim()) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入身份证号或手机号"
      })
      return
    }
    
    if (!isIdCard && !isPhone) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入正确的18位身份证号或11位手机号"
      })
      return
    }
    
    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入密码"
      })
      return
    }

    if (!machineId) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "没有可用的机器"
      })
      return
    }

    try {
      setIsLoading(true)
      
      const loginDTO = {
        password,
        machineId,
        identityCard: isIdCard ? identifier.trim() : undefined,
        phoneNumber: isPhone ? identifier.trim() : undefined
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.USER_LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDTO)
      })

      const loginData = await response.json()

      if (response.ok && loginData.token) {
        // 登录成功
        document.cookie = `token=${loginData.token}; path=/`
        document.cookie = `userId=${loginData.user.id}; path=/`
        document.cookie = `machineId=${machineId}; path=/`
        router.push('/user-dashboard')
      } else {
        throw new Error(loginData.message || '登录失败')
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登录失败",
        description: error instanceof Error ? error.message : "请检查账号和密码是否正确",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-center">机器 ID</h1>
        {machineId ? (
          <p className="text-4xl font-bold text-center">{machineId}</p>
        ) : (
          <p className="text-xl text-center text-red-500">暂无可用机器</p>
        )}
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>用户登录</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="identifier">身份证号/手机号</label>
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="请输入身份证号或手机号"
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
                  placeholder="请输入密码"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


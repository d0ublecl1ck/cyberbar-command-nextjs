'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

type User = {
  id: number
  name: string
  identityCard: string
  phoneNumber: string
  balance: number
  status: 'Offline' | 'Online' | 'Banned'
  machineId: number | null
  lastOnComputerTime: string | null
  lastOffComputerTime: string | null
  registerTime: string | null
}

type SensitiveData = {
  identityCard: boolean
  phoneNumber: boolean
  balance: boolean
}

export default function UserProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSensitive, setShowSensitive] = useState<SensitiveData>({
    identityCard: false,
    phoneNumber: false,
    balance: false,
  })

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "用户ID不能为空"
        })
        router.push('/admin/user_list')
        return
      }

      try {
        const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`)
        if (!response.ok) throw new Error('获取用户信息失败')
        
        const data = await response.json()
        setUser(data)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "错误",
          description: error instanceof Error ? error.message : "获取用户信息失败"
        })
        router.push('/admin/user_list')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [userId, router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
        return <Badge variant="default">在线</Badge>
      case 'Offline':
        return <Badge variant="secondary">离线</Badge>
      case 'Banned':
        return <Badge variant="destructive">封禁</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return '-'
    return format(new Date(dateTime), 'yyyy-MM-dd HH:mm:ss')
  }

  const toggleSensitiveData = (field: keyof SensitiveData) => {
    setShowSensitive(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const maskData = (data: string, show: boolean) => {
    if (!data) return '-'
    return show ? data : '******'
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>加载中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>用户不存在</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <h1 className="text-3xl font-bold">用户档案</h1>
        <div className="w-[100px]" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">用户ID</p>
              <p className="text-lg font-medium">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">姓名</p>
              <p className="text-lg font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">身份证号</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-medium">
                  {maskData(user.identityCard, showSensitive.identityCard)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSensitiveData('identityCard')}
                >
                  {showSensitive.identityCard ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">手机号</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-medium">
                  {maskData(user.phoneNumber, showSensitive.phoneNumber)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSensitiveData('phoneNumber')}
                >
                  {showSensitive.phoneNumber ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>账户状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">账户余额</p>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-medium">
                  ¥{showSensitive.balance ? user.balance.toFixed(2) : '******'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSensitiveData('balance')}
                >
                  {showSensitive.balance ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">当前状态</p>
              <div className="mt-1">{getStatusBadge(user.status)}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">注册时间</p>
              <p className="text-lg font-medium">{formatDateTime(user.registerTime)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>使用记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">当前使用机器</p>
              <p className="text-lg font-medium">{user.machineId || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最近上机时间</p>
              <p className="text-lg font-medium">{formatDateTime(user.lastOnComputerTime)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">最近下机时间</p>
              <p className="text-lg font-medium">{formatDateTime(user.lastOffComputerTime)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


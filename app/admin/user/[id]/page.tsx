'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type UserStatus = 'Offline' | 'Online' | 'Banned'

type User = {
  id: number
  name: string
  identityCard: string
  phoneNumber: string
  loginPassword: string
  balance: number
  status: UserStatus
  machineId: number | null
  lastOnComputerTime: string | null
  lastOffComputerTime: string | null
  registerTime: string | null
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  // 获取用户数据
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${params.id}`)
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
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      })

      if (!response.ok) throw new Error('更新用户信息失败')

      toast({
        title: "成功",
        description: "用户信息已更新"
      })

      router.push('/admin/user_list')
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "更新用户信息失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return
    const { name, value } = e.target
    setUser(prev => {
      if (!prev) return prev
      return {
        ...prev,
        [name]: name === 'balance' ? Number(value) : value
      }
    })
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
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">编辑用户</h1>
          <Button variant="outline" onClick={() => router.back()}>返回</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identityCard">身份证号</Label>
                  <Input
                    id="identityCard"
                    name="identityCard"
                    value={user.identityCard}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">手机号</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={user.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">余额</Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    value={user.balance}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={user.status}
                    onValueChange={(value: UserStatus) => 
                      setUser(prev => prev ? { ...prev, status: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Offline">离线</SelectItem>
                      <SelectItem value="Online">在线</SelectItem>
                      <SelectItem value="Banned">封禁</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "保存中..." : "保存"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


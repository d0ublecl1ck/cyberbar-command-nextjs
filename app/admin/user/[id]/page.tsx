'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

// Mock function to fetch user data
const fetchUserData = async (id: string) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    id,
    name: '张三',
    idCard: '110101199001011234',
    phone: '13800138000',
    balance: 100,
    status: '在线'
  }
}

export default function UserEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const userData = await fetchUserData(params.id)
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        toast({
          title: "错误",
          description: "加载用户数据失败",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setUser(prev => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast({
      title: "保存成功",
      description: "用户信息已更新",
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <div>用户不存在</div>
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl space-y-6">
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
                  <Label htmlFor="idCard">身份证号</Label>
                  <Input
                    id="idCard"
                    name="idCard"
                    value={user.idCard}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={user.phone}
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
                  <Select value={user.status} onValueChange={handleStatusChange}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="在线">在线</SelectItem>
                      <SelectItem value="离线">离线</SelectItem>
                      <SelectItem value="封禁">封禁</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    保存中...
                  </>
                ) : '保存更改'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


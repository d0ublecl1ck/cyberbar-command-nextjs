'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'

export default function NewUserPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    name: '',
    idCard: '',
    phone: '',
    balance: 0,
    status: '离线'
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (value: string) => {
    setUser(prev => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // 这里应该是向后端 API 发送请求来创建新用户
    // 现在我们只是模拟这个过程
    console.log('Creating new user:', user)
    toast({
      title: "用户创建成功",
      description: `新用户 ${user.name} 已成功创建`,
    })
    router.push('/admin/user_list')
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">新增用户</h1>
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
                  <Label htmlFor="balance">初始余额</Label>
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

              <Button type="submit">创建用户</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


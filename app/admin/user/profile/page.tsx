'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Pencil, Save, X } from 'lucide-react'

// Mock user data
const mockUser = {
  id: '1',
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  idCard: '110101199001011234',
  balance: 100,
  status: '在线',
  avatar: '/placeholder.svg?height=100&width=100',
  memberSince: '2023-01-01',
}

export default function UserProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(mockUser)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditedUser(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setUser(editedUser)
    setIsEditing(false)
    toast({
      title: "保存成功",
      description: "用户信息已更新",
    })
  }

  const handleCancel = () => {
    setEditedUser(user)
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">用户档案</CardTitle>
            <Button variant="outline" onClick={() => router.back()}>返回</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <Badge variant={user.status === '在线' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </div>
            <div className="flex-grow space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    name="name"
                    value={isEditing ? editedUser.name : user.name}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <Input
                    id="email"
                    name="email"
                    value={isEditing ? editedUser.email : user.email}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={isEditing ? editedUser.phone : user.phone}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idCard">身份证号</Label>
                  <Input
                    id="idCard"
                    name="idCard"
                    value={isEditing ? editedUser.idCard : user.idCard}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>账户余额</Label>
                <p className="text-2xl font-bold">¥{user.balance.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <Label>注册日期</Label>
                <p>{user.memberSince}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  保存
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  取消
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


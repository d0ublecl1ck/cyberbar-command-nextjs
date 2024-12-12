'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'

type UserStatus = 'Offline' | 'Banned' | 'Online';

type NewUserForm = {
  name: string
  identityCard: string
  phoneNumber: string
  loginPassword: string
  balance: number
  status: UserStatus
}

export default function NewUserPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<NewUserForm>({
    name: '',
    identityCard: '',
    phoneNumber: '',
    loginPassword: '',
    balance: 0,
    status: 'Offline'
  })

  // 表单验证函数
  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return '请输入用户姓名'
    }
    if (form.name.length < 2 || form.name.length > 20) {
      return '姓名长度应在2-20个字符之间'
    }

    // 身份证号验证
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardRegex.test(form.identityCard)) {
      return '请输入有效的身份证号'
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(form.phoneNumber)) {
      return '请输入有效的手机号'
    }

    // 密码验证
    if (form.loginPassword.length < 6 || form.loginPassword.length > 20) {
      return '密码长度应在6-20位之间'
    }

    // 余额验证
    if (form.balance < 0) {
      return '余额不能为负数'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    const error = validateForm()
    if (error) {
      toast({
        variant: "destructive",
        title: "验证失败",
        description: error
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      })

      if (!response.ok) {
        throw new Error('创建用户失败')
      }

      const data = await response.json()

      toast({
        title: "成功",
        description: `新用户 ${form.name} 已成功创建`
      })

      router.push('/admin/user_list')
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "创建用户失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({
      ...prev,
      [name]: name === 'balance' ? Number(value) : value
    }))
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
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="请输入用户姓名"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identityCard">身份证号</Label>
                  <Input
                    id="identityCard"
                    name="identityCard"
                    value={form.identityCard}
                    onChange={handleInputChange}
                    placeholder="请输入身份证号"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">手机号</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="请输入手机号"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginPassword">登录密码</Label>
                  <Input
                    id="loginPassword"
                    name="loginPassword"
                    type="password"
                    value={form.loginPassword}
                    onChange={handleInputChange}
                    placeholder="请输入登录密码"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balance">初始余额</Label>
                  <Input
                    id="balance"
                    name="balance"
                    type="number"
                    value={form.balance}
                    onChange={handleInputChange}
                    placeholder="请输入初始余额"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">用户状态</Label>
                  <Input
                    id="status"
                    name="status"
                    value="Offline"
                    disabled
                    readOnly
                  />
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
                  {isLoading ? "创建中..." : "创建用户"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


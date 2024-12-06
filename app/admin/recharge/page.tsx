'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

// Mock user data
const mockUsers = [
  { id: '1', name: '张三', balance: 100 },
  { id: '2', name: '李四', balance: 50 },
  { id: '3', name: '王五', balance: 200 },
]

export default function RechargePage() {
  const [selectedUser, setSelectedUser] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !amount) {
      toast({
        title: "错误",
        description: "请选择用户并输入充值金额",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)

    toast({
      title: "充值成功",
      description: `已为用户 ${mockUsers.find(u => u.id === selectedUser)?.name} 充值 ${amount} 元`,
    })

    // Reset form
    setSelectedUser('')
    setAmount('')
  }

  return (
    <div className="space-y-6">
      {/* Removed h1 tag */}

      <Card>
        <CardHeader>
          <CardTitle>充值表单</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRecharge} className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <label htmlFor="user-select">选择用户</label>
      <Select value={selectedUser} onValueChange={setSelectedUser}>
        <SelectTrigger id="user-select">
          <SelectValue placeholder="选择用户" />
        </SelectTrigger>
        <SelectContent>
          {mockUsers.map(user => (
            <SelectItem key={user.id} value={user.id}>
              {user.name} (当前余额: ¥{user.balance})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <label htmlFor="amount-input">充值金额</label>
      <Input
        id="amount-input"
        type="number"
        placeholder="输入充值金额"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.01"
      />
    </div>
  </div>

  <Button type="submit" disabled={isLoading}>
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        处理中...
      </>
    ) : (
      '确认充值'
    )}
  </Button>
</form>
        </CardContent>
      </Card>
    </div>
  )
}


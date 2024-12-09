'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Search } from 'lucide-react'

// Mock user data
const mockUsers = [
  { id: '1', name: '张三', balance: 100, idCard: '110101199001011234', phone: '13800138000' },
  { id: '2', name: '李四', balance: 50, idCard: '110101199001011235', phone: '13800138001' },
  { id: '3', name: '王五', balance: 200, idCard: '110101199001011236', phone: '13800138002' },
  { id: '4', name: '赵六', balance: 150, idCard: '110101199001011237', phone: '13800138003' },
  { id: '5', name: '钱七', balance: 80, idCard: '110101199001011238', phone: '13800138004' },
]

export default function RechargePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<typeof mockUsers>([])
  const [selectedUser, setSelectedUser] = useState<(typeof mockUsers)[0] | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [updatedBalance, setUpdatedBalance] = useState<number | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const results = mockUsers.filter(user => 
      Object.values(user).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setSearchResults(results)
    setSelectedUser(null)
  }

  const handleSelectUser = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user)
    setSearchResults([])
  }

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

    const newBalance = selectedUser.balance + parseFloat(amount)
    setUpdatedBalance(newBalance)
    toast({
      title: "充值成功",
      description: `已为用户 ${selectedUser.name} 充值 ${amount} 元。新余额为 ¥${newBalance.toFixed(2)}。`,
    })

    // Reset form
    setSelectedUser(null)
    setAmount('')
    setSearchTerm('')
    setUpdatedBalance(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>用户搜索</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
          </form>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>搜索结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>身份证号</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>当前余额</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.idCard}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>¥{user.balance}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleSelectUser(user)} variant="outline" size="sm">
                        选择
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>充值表单</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="user-name">用户名</label>
                  <Input id="user-name" value={selectedUser.name} readOnly />
                </div>
                <div className="space-y-2">
                  <label htmlFor="current-balance">当前余额</label>
                  <Input id="current-balance" value={`¥${selectedUser.balance}`} readOnly />
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
            {updatedBalance !== null && (
              <CardContent className="mt-4">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">充值成功！</strong>
                  <span className="block sm:inline"> 用户 {selectedUser.name} 的新余额为 ¥{updatedBalance.toFixed(2)}。</span>
                </div>
              </CardContent>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}


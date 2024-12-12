'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Search, Eye, EyeOff } from 'lucide-react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'

type User = {
  id: number
  name: string
  balance: number
  identityCard: string
  phoneNumber: string
  status: 'Online' | 'Offline' | 'Banned'
}

type VisibleInfo = {
  [key: number]: {
    identityCard: boolean
    phoneNumber: boolean
  }
}

export default function RechargePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [rechargeAmount, setRechargeAmount] = useState<{ [key: number]: string }>({})
  const [visibleInfo, setVisibleInfo] = useState<VisibleInfo>({})

  // 隐藏身份证号中间12位
  const maskIdentityCard = (idCard: string) => {
    return idCard.replace(/^(.{3})(.*)(.{4})$/, '$1************$3')
  }

  // 隐藏手机号中间4位
  const maskPhoneNumber = (phone: string) => {
    return phone.replace(/^(.{3})(.*)(.{4})$/, '$1****$3')
  }

  // 切换信息可见性
  const toggleVisibility = (userId: number, field: 'identityCard' | 'phoneNumber') => {
    setVisibleInfo(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: !prev[userId]?.[field]
      }
    }))
  }

  // 刷新单个用户信息
  const refreshUserInfo = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`)
      if (!response.ok) throw new Error('获取用户信息失败')
      const updatedUser = await response.json()
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "刷新用户信息失败"
      })
    }
  }

  // 搜索用户
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入搜索关键词"
      })
      return
    }

    try {
      setIsSearching(true)
      const params = new URLSearchParams({
        keyword: searchTerm,
        pageSize: '10',
        pageNum: '1'
      })

      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/search?${params}`)
      if (!response.ok) throw new Error('搜索用户失败')
      
      const data = await response.json()
      setUsers(data.list || [])
      // 重置可见性状态
      setVisibleInfo({})

      if (data.list.length === 0) {
        toast({
          title: "提示",
          description: "未找到匹配的用户"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "搜索用户失败"
      })
    } finally {
      setIsSearching(false)
    }
  }

  // 处理充值
  const handleRecharge = async (userId: number) => {
    const amount = rechargeAmount[userId]
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "请输入有效的充值金额"
      })
      return
    }

    try {
      // 首先获取用户当前信息
      const userResponse = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`)
      if (!userResponse.ok) throw new Error('获取用户信息失败')
      const userData = await userResponse.json()

      // 更新用户余额
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          balance: userData.balance + parseFloat(amount)
        })
      })

      if (!response.ok) throw new Error('充值失败')

      // 创建充值日志
      await fetch(`${API_URL}${API_ENDPOINTS.MANAGEMENT_LOGS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: 1, // 这里应该使用实际的管理员ID
          operation: 'Recharge',
          detail: `为用户 ${userData.name}(ID: ${userId}) 充值 ${amount} 元`,
          operationTime: new Date().toISOString()
        })
      })

      toast({
        title: "成功",
        description: `已为用户 ${userData.name} 充值 ${amount} 元`
      })

      // 清空充值金额输入框
      setRechargeAmount(prev => ({
        ...prev,
        [userId]: ''
      }))

      // 刷新该用户信息
      await refreshUserInfo(userId)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "充值失败"
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>用户充值</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="搜索用户名/身份证号/手机号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span className="ml-2">搜索</span>
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户ID</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>身份证号</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>当前余额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>充值金额</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell className="space-x-2">
                    <span>
                      {visibleInfo[user.id]?.identityCard 
                        ? user.identityCard 
                        : maskIdentityCard(user.identityCard)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(user.id, 'identityCard')}
                    >
                      {visibleInfo[user.id]?.identityCard ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <span>
                      {visibleInfo[user.id]?.phoneNumber 
                        ? user.phoneNumber 
                        : maskPhoneNumber(user.phoneNumber)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleVisibility(user.id, 'phoneNumber')}
                    >
                      {visibleInfo[user.id]?.phoneNumber ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>¥{user.balance}</TableCell>
                  <TableCell>{user.status}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="输入金额"
                      value={rechargeAmount[user.id] || ''}
                      onChange={(e) => setRechargeAmount(prev => ({
                        ...prev,
                        [user.id]: e.target.value
                      }))}
                      className="w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      onClick={() => handleRecharge(user.id)}
                      disabled={!rechargeAmount[user.id] || isNaN(parseFloat(rechargeAmount[user.id]))}
                    >
                      充值
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


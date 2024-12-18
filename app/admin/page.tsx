'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import dynamic from 'next/dynamic'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

// 添加 Order 类型定义
type OrderCommodity = {
  commodityId: number
  name: string
  price: number
  quantity: number
}

type Order = {
  id: number
  userId: number
  machineId: number
  orderDate: string
  status: 'Pending' | 'Completed' | 'Cancelled'
  totalPrice: number
  commodities: OrderCommodity[]
  machineZoneId: number
}

// 添加 Message 类型定义
type Message = {
  id: number
  content: string
  userId: number | null
  machineId: number | null
  status: string
  time: string
}

// 动态导入 DynamicClock 组件并禁用 SSR
const DynamicClockComponent = dynamic(() => import('@/components/dynamic-clock').then(mod => mod.DynamicClock), {
  ssr: false
})

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdminAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [totalPendingCount, setTotalPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [machineZones, setMachineZones] = useState<Map<number, string>>(new Map())
  const [userNames, setUserNames] = useState<Map<number, string>>(new Map())

  // 获取机器所在区域信息
  const fetchMachineZone = async (machineId: number) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${machineId}`)
      if (!response.ok) throw new Error('获取机器信息失败')
      const machine = await response.json()
      
      if (machine.zoneId) {
        const zoneResponse = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}/${machine.zoneId}`)
        if (!zoneResponse.ok) throw new Error('获取区域信息失败')
        const zone = await zoneResponse.json()
        setMachineZones(prev => new Map(prev).set(machineId, zone.name))
      }
    } catch (error) {
      console.error('获取机器区域信息失败:', error)
    }
  }

  // 添加获取用户信息的函数
  const fetchUserName = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`)
      if (!response.ok) throw new Error('获取用户信息失败')
      const user = await response.json()
      setUserNames(prev => new Map(prev).set(userId, user.name))
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 获取待处理订单
  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ORDERS}/search?status=Pending`)
      if (!response.ok) throw new Error('获取待处理订单失败')
      const data = await response.json()
      setPendingOrders(data.list || [])
      updateTotalPendingCount(data.list?.length || 0, messages.length)
    } catch (error) {
      console.error('获取待处理订单失败:', error)
    }
  }

  // 获取待处理消息
  const fetchPendingMessages = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.PENDING_MESSAGES}`)
      if (!response.ok) throw new Error('获取待处理消息失败')
      const data = await response.json()
      setMessages(data || [])
      updateTotalPendingCount(pendingOrders.length, data.length)
    } catch (error) {
      console.error('获取待处理消息失败:', error)
    }
  }

  // 更新总待办数
  const updateTotalPendingCount = (ordersCount: number, messagesCount: number) => {
    setTotalPendingCount(ordersCount + messagesCount)
  }

  // 处理订单
  const handleOrder = async (orderId: number, action: 'complete' | 'cancel') => {
    try {
      // 构造包含 status 参数的 URL
      const status = action === 'complete' ? 'Completed' : 'Cancelled'
      const url = `${API_URL}${API_ENDPOINTS.ORDERS}/${orderId}/status?status=${status}`
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '处理订单失败')
      }
      
      toast({
        title: "成功",
        description: action === 'complete' ? "订单已完成" : "订单已取消"
      })
      
      // 刷新订单列表
      fetchPendingOrders()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "处理订单失败"
      })
    }
  }

  // 添加处理消息的函数
  const handleMessage = async (messageId: number) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}/${messageId}/status?status=Finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('处理消息失败')
      }

      toast({
        title: "成功",
        description: "消息已处理"
      })

      // 刷新消息列表
      fetchPendingMessages()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "处理消息失败"
      })
    }
  }

  // 保持现有的认证检查和消息获取逻辑
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login?reason=unauthenticated')
    }
  }, [isAuthenticated, router])

  // 定时轮询
  useEffect(() => {
    if (isAuthenticated) {
      // 初始加载
      fetchPendingOrders()
      fetchPendingMessages()
      
      // 每3秒轮询一次
      const interval = setInterval(() => {
        fetchPendingOrders()
        fetchPendingMessages()
      }, 3000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">管理员仪表板</h1>

      <div className="text-center">
        <DynamicClockComponent />
      </div>

      {/* 添加悬浮球 */}
      {totalPendingCount > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center cursor-pointer shadow-lg">
          {totalPendingCount}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 订单管理卡片保持不变 */}
        <Card>
          <CardHeader>
            <CardTitle>待处理订单</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">暂无待处理订单</p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">订单 #{order.id}</span>
                        <Badge className="ml-2">待处理</Badge>
                      </div>
                      <span className="text-lg font-semibold">¥{order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>用户: {userNames.get(order.userId) || '加载中...'}</p>
                      <p>机器ID: {order.machineId}</p>
                      <p>机器所在区域: {machineZones.get(order.machineId) || '加载中...'}</p>
                      <p>下单时间: {new Date(order.orderDate).toLocaleString()}</p>
                      <p>商品列表:</p>
                      <ul className="list-disc list-inside mt-1">
                        {order.commodities?.map((item) => (
                          <li key={item.commodityId}>
                            {item.name} x {item.quantity} = ¥{(item.price * item.quantity).toFixed(2)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOrder(order.id, 'cancel')}
                      >
                        取消订单
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleOrder(order.id, 'complete')}
                      >
                        完成订单
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 修改待办消息卡片，添加处理按钮 */}
        <Card>
          <CardHeader>
            <CardTitle>待办消息</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground">暂无待办消息</p>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <Badge>
                        {message.userId ? "用户消息" : "系统提示"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {new Date(message.time).toLocaleString()}
                      </span>
                    </div>
                    <p className="mb-4">{message.content}</p>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleMessage(message.id)}
                      >
                        处理
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


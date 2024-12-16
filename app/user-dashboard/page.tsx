'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { ShoppingCart, Plus, Minus, Loader2, X } from 'lucide-react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useRouter } from 'next/navigation'

type User = {
  id: number
  name: string
  balance: number
  status: 'Online' | 'Offline' | 'Banned'
  machineId: number | null
  lastOnComputerTime: string | null
  lastOffComputerTime: string | null
}

type Commodity = {
  id: number
  name: string
  price: number
  unit: string
}

type CartItem = Commodity & {
  quantity: number
}

type OrderCommodityDTO = {
  commodityId: number
  name: string
  price: number
  quantity: number
}

type CreateOrderDTO = {
  userId: number
  machineId: number
  totalPrice: number
  commodities: OrderCommodityDTO[]
}

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
}

type Machine = {
  id: number
  status: string
  price: number
  zoneId: number | null
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminCallStatus, setAdminCallStatus] = useState<'idle' | 'calling'>('idle')
  const [isOrderConfirmDialogOpen, setIsOrderConfirmDialogOpen] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCommodities, setFilteredCommodities] = useState<Commodity[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isCallingAdmin, setIsCallingAdmin] = useState(false)
  const [currentMessageId, setCurrentMessageId] = useState<number | null>(null)
  const [currentMachine, setCurrentMachine] = useState<Machine | null>(null)

  // 获取用户信息
  const fetchUserInfo = async () => {
    try {
      // 从 cookie 中获取用户 ID 和机器 ID
      const userToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1]

      const machineIdFromCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('machineId='))
        ?.split('=')[1]

      if (!userToken) {
        throw new Error('未登录')
      }

      // TODO: 解析 token 获取用户 ID 或直接从登录响应中保存用户信息
      const userId = 1 // 临时使用固定 ID，实际应该从 token 中获取

      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/${userId}`)
      if (!response.ok) throw new Error('获取用户信息失败')
      
      const data = await response.json()
      setUser({
        ...data,
        machineId: machineIdFromCookie ? parseInt(machineIdFromCookie) : null
      })

      // 如果用户有绑定机器，获取机器信息
      if (data.machineId) {
        const machineResponse = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${data.machineId}`)
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setCurrentMachine(machineData)
        }
      } else {
        setCurrentMachine(null)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取用户信息失败"
      })
    }
  }

  // 获取商品列表
  const fetchCommodities = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.COMMODITIES}`)
      if (!response.ok) throw new Error('获取商品列表失败')
      
      const data = await response.json()
      setCommodities(data)
      setFilteredCommodities(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取商品列表失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取用户未完成订单
  const fetchPendingOrders = async () => {
    if (!user) return
    
    try {
      const params = new URLSearchParams({
        status: 'Pending',
        userId: user.id.toString(),
        pageNum: '1',
        pageSize: '10'
      })
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ORDERS}/search?${params}`)
      if (!response.ok) throw new Error('获取订单失败')
      
      const data = await response.json()
      setPendingOrders(data.list || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取订单失败"
      })
    }
  }

  // 添加订单轮询
  useEffect(() => {
    if (user) {
      fetchPendingOrders()
      const interval = setInterval(fetchPendingOrders, 3000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    Promise.all([fetchUserInfo(), fetchCommodities()])
  }, [])

  useEffect(() => {
    const filtered = commodities.filter(commodity => 
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    setFilteredCommodities(filtered)
  }, [commodities, searchTerm])

  const handleCallAdmin = async () => {
    try {
      if (!user || !user.machineId) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "未找到用户信息或机器信息"
        })
        return
      }

      setIsCallingAdmin(true)

      // 创建呼叫消息
      const message = {
        content: `用户：${user.name} 在 ${user.machineId} 号机呼叫管理员`,
        userId: user.id,
        machineId: user.machineId,
        status: 'Pending'
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      })

      if (!response.ok) {
        throw new Error('呼叫管理员失败')
      }

      const data = await response.json()
      setCurrentMessageId(data) // 保存消息ID用于后续取消呼叫

      toast({
        title: "成功",
        description: "已呼叫管理员，请稍候"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "呼叫管理员失败"
      })
      setIsCallingAdmin(false)
    }
  }

  const handleCancelCallAdmin = async () => {
    try {
      if (!currentMessageId) {
        throw new Error('未找到呼叫记录')
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}/${currentMessageId}/status?status=Finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('取消呼叫失败')
      }

      setIsCallingAdmin(false)
      setCurrentMessageId(null)

      toast({
        title: "成功",
        description: "已取消呼叫"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "取消呼叫失败"
      })
    }
  }

  const handleStartMachine = async () => {
    if (!user?.machineId) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "未绑定机器，无法上机。",
      })
      return
    }

    try {
      setIsOrdering(true)
      const response = await fetch(`${API_URL}/api/users/${user.id}/start/${user.machineId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) throw new Error('上机失败')
      
      const updatedUser: User = {
        ...user,
        status: 'Online'
      }
      setUser(updatedUser)
      
      // 获取最新的机器信息
      if (user.machineId) {
        const machineResponse = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${user.machineId}`)
        if (machineResponse.ok) {
          const machineData = await machineResponse.json()
          setCurrentMachine(machineData)
        }
      }
      
      toast({
        title: "成功",
        description: "已成功上机。",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "上机失败",
      })
    } finally {
      setIsOrdering(false)
    }
  }

  const handleStopMachine = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "未登录，无法下机。",
      })
      return
    }

    // 添加呼叫状态检查
    if (isCallingAdmin) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "您当前正在呼叫管理员，请先取消呼叫后再下机。",
      })
      return
    }

    try {
      setIsOrdering(true)
      const response = await fetch(`${API_URL}/api/users/${user.id}/stop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      // 获取错误信息
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '下机失败')
      }
      
      // 清除 cookie
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      document.cookie = 'machineId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      
      router.push('/login')
      
      toast({
        title: "成功",
        description: "已成功下机。",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "下机失败",
        description: error instanceof Error ? error.message : "请检查是否有未完成的操作",
      })
    } finally {
      setIsOrdering(false)
    }
  }

  const addToCart = (item: Commodity) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "用户信息不存在"
      })
      return
    }

    if (!user.machineId) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "未分配机器，无法下单"
      })
      return
    }

    try {
      setIsOrdering(true)

      // 构造符合 CreateOrderDTO 格式的订单数据
      const createOrderDTO: CreateOrderDTO = {
        userId: user.id,
        machineId: user.machineId,
        totalPrice: getTotalPrice(),
        commodities: cart.map(item => ({
          commodityId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }

      // 发送创建订单请求
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ORDERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createOrderDTO)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '提交订单失败')
      }

      // 清空购物车
      setCart([])
      
      // 关闭确认对话框
      setIsOrderConfirmDialogOpen(false)

      // 刷新用户信息以更新余额
      await fetchUserInfo()

      toast({
        title: "成功",
        description: "订单已提交"
      })

    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "提交订单失败"
      })
    } finally {
      setIsOrdering(false)
    }
  }

  // 计算当前页的商品
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCommodities.slice(startIndex, endIndex)
  }

  // 计算总页数
  const totalPages = Math.ceil(filteredCommodities.length / itemsPerPage)

  // 检查是否存在未处理的呼叫消息
  const checkCallStatus = async (userId: number) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}/user/${userId}`)
      if (!response.ok) throw new Error('获取消息失败')
      const messages = await response.json()
      
      // 检查是否存在未处理的呼叫消息
      const hasPendingCall = messages.some((message: any) => 
        message.status === 'Pending' && 
        message.content.includes('呼叫管理员')
      )
      
      setIsCallingAdmin(hasPendingCall)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取呼叫状态失败"
      })
    }
  }

  // 取消呼叫
  const cancelCall = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MESSAGES}/user/${user?.id}`)
      if (!response.ok) throw new Error('获取消息失败')
      const messages = await response.json()
      
      // 找到未处理的呼叫消息
      const pendingCall = messages.find((message: any) => 
        message.status === 'Pending' && 
        message.content.includes('呼叫管理员')
      )
      
      if (pendingCall) {
        // 更新消息状态为 Finish
        const updateResponse = await fetch(
          `${API_URL}${API_ENDPOINTS.MESSAGES}/${pendingCall.id}/status?status=Finish`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        )
        
        if (!updateResponse.ok) throw new Error('取消呼叫失败')
        
        setIsCallingAdmin(false)
        toast({
          title: "成功",
          description: "已取消呼叫管理员"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "取消呼叫失败"
      })
    }
  }

  // 在组件加载和用户变化时检查呼叫状态
  useEffect(() => {
    if (user?.id) {
      checkCallStatus(user.id)
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">姓名：</span>{user?.name}</p>
              <p><span className="font-medium">余额：</span>¥{user?.balance?.toFixed(2)}</p>
              <p>
                <span className="font-medium">状态：</span>
                <Badge>{user?.status === 'Online' ? '在线' : '离线'}</Badge>
              </p>
              <p><span className="font-medium">当前使用机器：</span>{user?.machineId || '未分配'}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={isCallingAdmin ? cancelCall : handleCallAdmin}
                  disabled={isLoading}
                >
                  {isCallingAdmin ? "取消呼叫" : "呼叫管理员"}
                </Button>
                {user?.status !== 'Online' ? (
                  <Button onClick={handleStartMachine} disabled={isOrdering} className="flex-1">
                    上机
                  </Button>
                ) : (
                  <Button onClick={handleStopMachine} disabled={isOrdering} className="flex-1">
                    下机
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>我的订单</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">暂无订单</p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">订单 #{order.id}</span>
                        <Badge className="ml-2">待处理</Badge>
                      </div>
                      <span className="text-lg font-semibold">¥{order.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>下单时间: {new Date(order.orderDate).toLocaleString()}</p>
                      <p>商品列表:</p>
                      {order.commodities && order.commodities.length > 0 ? (
                        <ul className="mt-1 space-y-1">
                          {order.commodities.map((item) => (
                            <li key={item.commodityId}>
                              {item.name} x {item.quantity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 italic">暂无商品</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="space-y-4">
              <CardTitle>商品列表</CardTitle>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="搜索商品..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名称</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageItems().map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.price.toFixed(2)}元/{item.unit}</TableCell>
                    <TableCell>
                      <Button onClick={() => addToCart(item)} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {searchTerm ? (
                  <p>找到 {filteredCommodities.length} 个商品</p>
                ) : (
                  <p>共 {commodities.length} 个商品</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <span className="text-sm">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>购物车</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-center text-muted-foreground">购物车是空的</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>小计</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>¥{(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button onClick={() => removeFromCart(item.id)} size="sm" variant="destructive">
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-2xl font-bold text-primary">总计: ¥{getTotalPrice().toFixed(2)}</p>
                  <Dialog open={isOrderConfirmDialogOpen} onOpenChange={setIsOrderConfirmDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        提交订单
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>确认订单</DialogTitle>
                        <DialogDescription>
                          您确定要提交这个订单吗？总价为 ¥{getTotalPrice().toFixed(2)}。
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOrderConfirmDialogOpen(false)}>取消</Button>
                        <Button onClick={handlePlaceOrder} disabled={isOrdering}>
                          {isOrdering ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              提交中...
                            </>
                          ) : (
                            '确认提交'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


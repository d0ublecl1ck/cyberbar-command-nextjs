'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { toast } from '@/components/ui/use-toast'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'


// Mock menu data
const mockMenu = [
  { id: 1, name: '可乐', price: 3 },
  { id: 2, name: '薯片', price: 5 },
  { id: 3, name: '三明治', price: 8 },
  { id: 4, name: '咖啡', price: 10 },
  { id: 5, name: '巧克力', price: 4 },
]

type CartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

export default function UserDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isOrdering, setIsOrdering] = useState(false)
  const [isOrderConfirmDialogOpen, setIsOrderConfirmDialogOpen] = useState(false)
  const [adminCallStatus, setAdminCallStatus] = useState<'idle' | 'calling'>('idle')

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOnline) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOnline])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleStartSession = () => {
    setIsOnline(true)
  }

  const handleEndSession = () => {
    setIsOnline(false)
    setTimeElapsed(0)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleCallAdmin = () => {
    setAdminCallStatus('calling')
    toast({
      title: "正在呼叫网管",
      description: "网管已收到您的请求，将尽快前来协助您。",
    })
  }

  const handleCancelAdminCall = () => {
    setAdminCallStatus('idle')
    toast({
      title: "已取消呼叫",
      description: "您已取消呼叫网管。",
    })
  }

  const addToCart = (item: typeof mockMenu[0]) => {
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

  const handlePlaceOrder = () => {
    setIsOrderConfirmDialogOpen(false)
    setIsOrdering(true)
    // Simulate API call
    setTimeout(() => {
      setIsOrdering(false)
      toast({
        title: "订单已提交",
        description: `您的订单总价为 ¥${getTotalPrice()}，将很快送达。`,
      })
      setCart([])
      // Refresh the page
      window.location.reload()
    }, 1500)
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">用户仪表板</CardTitle>
            <Button variant="outline" onClick={handleLogout}>登出</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">欢迎, {user.name}</h3>
              <p>账户余额: ¥{user.balance.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">当前状态</h3>
              <p>{isOnline ? '在线' : '离线'}</p>
              {isOnline && <p>已上网时间: {formatTime(timeElapsed)}</p>}
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            {!isOnline ? (
              <Button onClick={handleStartSession}>上机</Button>
            ) : (
              <Button onClick={handleEndSession} variant="destructive">下机</Button>
            )}
            <Button
              variant="outline"
              onClick={adminCallStatus === 'idle' ? handleCallAdmin : handleCancelAdminCall}
            >
              {adminCallStatus === 'idle' ? (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  呼叫网管
                </>
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  取消呼叫
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>点餐</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">菜单</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMenu.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>¥{item.price}</TableCell>
                      <TableCell>
                        <Button onClick={() => addToCart(item)} size="sm">添加</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">购物车</h3>
              {cart.length === 0 ? (
                <p>购物车为空</p>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品</TableHead>
                        <TableHead>数量</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>操作</TableHead>
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
                                -
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                className="w-16 text-center"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                +
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


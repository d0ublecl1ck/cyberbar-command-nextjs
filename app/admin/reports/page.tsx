'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { addDays, format } from "date-fns"
import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

// 注册 ChartJS 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

type OrderData = {
  id: number
  orderDate: string
  totalPrice: number
  status: 'Pending' | 'Completed' | 'Cancelled'
  machineId: number
  userId: number
  commodities: Array<{
    commodityId: number
    name: string
    price: number
    quantity: number
  }>
}

type PageInfo<T> = {
  endRow: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  isFirstPage: boolean
  isLastPage: boolean
  list: T[]
  navigateFirstPage: number
  navigateLastPage: number
  navigatePages: number
  navigatepageNums: number[]
  nextPage: number
  pageNum: number
  pageSize: number
  pages: number
  prePage: number
  size: number
  startRow: number
  total: number
}

type OrderResponse = PageInfo<OrderData>

export default function ReportsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAdminAuth()
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('week')
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -7),
    to: new Date(),
  })
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  // 获取订单数据
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        status: 'Completed',
        pageNum: '1',
        pageSize: '100'
      })
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ORDERS}/search?${params}`)
      if (!response.ok) throw new Error('获取订单数据失败')
      const data: OrderResponse = await response.json()
      setOrders(data.list || [])
    } catch (error) {
      console.error('获取订单数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 处理时间范围变化
  const handleTimeRangeChange = (value: string) => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    switch (value) {
      case 'today': {
        const startOfDay = new Date(today)
        startOfDay.setHours(0, 0, 0, 0)
        setDateRange({ from: startOfDay, to: today })
        break
      }
      case 'week': {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - 7)
        startOfWeek.setHours(0, 0, 0, 0)
        setDateRange({ from: startOfWeek, to: today })
        break
      }
      case 'month': {
        const startOfMonth = new Date(today)
        startOfMonth.setDate(today.getDate() - 30)
        startOfMonth.setHours(0, 0, 0, 0)
        setDateRange({ from: startOfMonth, to: today })
        break
      }
    }
    setTimeRange(value as 'today' | 'week' | 'month' | 'custom')
  }

  // 计算每日销售额数据
  const getDailySalesData = () => {
    const salesByDate = new Map<string, number>()
    orders.forEach(order => {
      const date = format(new Date(order.orderDate), 'yyyy-MM-dd')
      salesByDate.set(date, (salesByDate.get(date) || 0) + order.totalPrice)
    })
    
    return {
      labels: Array.from(salesByDate.keys()),
      datasets: [{
        label: '日销售额',
        data: Array.from(salesByDate.values()),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    }
  }

  // 计算商品销量排行数据
  const getProductSalesData = () => {
    const salesByProduct = new Map<string, number>()
    orders.forEach(order => {
      order.commodities.forEach(item => {
        salesByProduct.set(item.name, (salesByProduct.get(item.name) || 0) + item.quantity)
      })
    })
    
    // 按销量排序并取前10
    const sortedSales = Array.from(salesByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    
    return {
      labels: sortedSales.map(([name]) => name),
      datasets: [{
        label: '销量',
        data: sortedSales.map(([_, quantity]) => quantity),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      }]
    }
  }

  // 计算商品销售额占比数据
  const getProductRevenueData = () => {
    const revenueByProduct = new Map<string, number>()
    orders.forEach(order => {
      order.commodities.forEach(item => {
        revenueByProduct.set(item.name, (revenueByProduct.get(item.name) || 0) + item.price * item.quantity)
      })
    })
    
    const sortedRevenue = Array.from(revenueByProduct.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
    
    return {
      labels: sortedRevenue.map(([name]) => name),
      datasets: [{
        data: sortedRevenue.map(([_, revenue]) => revenue),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      }]
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/admin/login?reason=unauthenticated')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated, dateRange])

  if (!isAuthenticated) return null

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">销售报表</h1>
      
      <div className="flex gap-4 items-center">
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择时间范围" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">今日</SelectItem>
            <SelectItem value="week">近7天</SelectItem>
            <SelectItem value="month">近30天</SelectItem>
            <SelectItem value="custom">自定义</SelectItem>
          </SelectContent>
        </Select>
        
        {timeRange === 'custom' && (
          <DatePickerWithRange
            date={dateRange}
            setDate={setDateRange}
          />
        )}
      </div>

      {/* 销售额趋势图 - 占据整行 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>销售额趋势</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <Line 
            data={getDailySalesData()} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' as const },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => `¥${value}`
                  }
                }
              }
            }} 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 商品销量排行榜 */}
        <Card>
          <CardHeader>
            <CardTitle>商品销量TOP10</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Bar 
              data={getProductSalesData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y' as const,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                  }
                }
              }} 
            />
          </CardContent>
        </Card>

        {/* 商品销售额占比 */}
        <Card>
          <CardHeader>
            <CardTitle>商品销售额占比TOP5</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <Pie 
              data={getProductRevenueData()} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'right' as const,
                    labels: {
                      boxWidth: 20,
                      padding: 20,
                      generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels?.length && data.datasets.length) {
                          return data.labels.map((label, i) => ({
                            text: `${label}: ¥${data.datasets[0].data[i]}`,
                            fillStyle: data.datasets[0].backgroundColor[i],
                            hidden: false,
                            index: i,
                          }));
                        }
                        return [];
                      }
                    }
                  },
                }
              }} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
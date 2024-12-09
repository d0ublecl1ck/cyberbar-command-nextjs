'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicClock } from '@/components/dynamic-clock'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts'
import { ErrorComputerCount } from '@/components/error-computer-count'

// Mock data for the income chart
const mockIncomeData = {
  daily: [
    { name: '周一', income: 4000, users: 120 },
    { name: '周二', income: 3000, users: 98 },
    { name: '周三', income: 2000, users: 86 },
    { name: '周四', income: 2780, users: 99 },
    { name: '周五', income: 1890, users: 76 },
    { name: '周六', income: 2390, users: 84 },
    { name: '周日', income: 3490, users: 110 },
  ],
  weekly: [
    { name: '第1周', income: 15000, users: 450 },
    { name: '第2周', income: 18000, users: 520 },
    { name: '第3周', income: 12000, users: 380 },
    { name: '第4周', income: 20000, users: 600 },
  ],
  monthly: [
    { name: '1月', income: 65000, users: 2100 },
    { name: '2月', income: 59000, users: 1900 },
    { name: '3月', income: 80000, users: 2500 },
    { name: '4月', income: 81000, users: 2600 },
    { name: '5月', income: 56000, users: 1800 },
    { name: '6月', income: 55000, users: 1750 },
    { name: '7月', income: 40000, users: 1500 },
  ],
}

// Mock data for computer usage by zone
const mockZoneUsageData = [
  { name: '一楼-A区', value: 30 },
  { name: '一楼-B区', value: 25 },
  { name: '二楼-C区', value: 35 },
  { name: '二楼-D区', value: 20 },
]

// Mock data for peak hours
const mockPeakHoursData = [
  { hour: '00:00', users: 10 },
  { hour: '02:00', users: 5 },
  { hour: '04:00', users: 3 },
  { hour: '06:00', users: 8 },
  { hour: '08:00', users: 15 },
  { hour: '10:00', users: 25 },
  { hour: '12:00', users: 30 },
  { hour: '14:00', users: 35 },
  { hour: '16:00', users: 40 },
  { hour: '18:00', users: 45 },
  { hour: '20:00', users: 38 },
  { hour: '22:00', users: 20 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState('daily')

  const totalIncome = mockIncomeData[timeRange as keyof typeof mockIncomeData].reduce((sum, item) => sum + item.income, 0)
  const averageIncome = totalIncome / mockIncomeData[timeRange as keyof typeof mockIncomeData].length
  const totalUsers = mockIncomeData[timeRange as keyof typeof mockIncomeData].reduce((sum, item) => sum + item.users, 0)
  const averageUsers = totalUsers / mockIncomeData[timeRange as keyof typeof mockIncomeData].length

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">管理员仪表板</h1>
      
      <div className="text-center">
        <DynamicClock />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>总收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">¥{totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>平均收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">¥{averageIncome.toFixed(2).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalUsers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <ErrorComputerCount />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">收入和用户趋势</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">日报表</SelectItem>
              <SelectItem value="weekly">周报表</SelectItem>
              <SelectItem value="monthly">月报表</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>收入和用户数量趋势图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockIncomeData[timeRange as keyof typeof mockIncomeData]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="income" name="收入" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="users" name="用户数" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>区域使用情况</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockZoneUsageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {mockZoneUsageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>高峰时段分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPeakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}


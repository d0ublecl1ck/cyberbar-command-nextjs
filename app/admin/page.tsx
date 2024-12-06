'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DynamicClock } from '@/components/dynamic-clock'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend, Sector } from 'recharts'

// Mock data for the income chart
const mockIncomeData = {
  daily: [
    { name: '周一', income: 4000 },
    { name: '周二', income: 3000 },
    { name: '周三', income: 2000 },
    { name: '周四', income: 2780 },
    { name: '周五', income: 1890 },
    { name: '周六', income: 2390 },
    { name: '周日', income: 3490 },
  ],
  weekly: [
    { name: '第1周', income: 15000 },
    { name: '第2周', income: 18000 },
    { name: '第3周', income: 12000 },
    { name: '第4周', income: 20000 },
  ],
  monthly: [
    { name: '1月', income: 65000 },
    { name: '2月', income: 59000 },
    { name: '3月', income: 80000 },
    { name: '4月', income: 81000 },
    { name: '5月', income: 56000 },
    { name: '6月', income: 55000 },
    { name: '7月', income: 40000 },
  ],
}

// Mock data for internet usage distribution
const mockUsageData = [
  { time: '00:00', users: 10 },
  { time: '02:00', users: 5 },
  { time: '04:00', users: 3 },
  { time: '06:00', users: 8 },
  { time: '08:00', users: 15 },
  { time: '10:00', users: 20 },
  { time: '12:00', users: 25 },
  { time: '14:00', users: 30 },
  { time: '16:00', users: 35 },
  { time: '18:00', users: 40 },
  { time: '20:00', users: 45 },
  { time: '22:00', users: 30 },
]

const userStateData = [
  { name: '在线', value: 350 },
  { name: '离线', value: 450 },
  { name: '封禁', value: 200 },
]

const COLORS = ['#e0e0e0', '#bdbdbd', '#9e9e9e']

export default function AdminHomePage() {
  const [timeRange, setTimeRange] = useState('daily')
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill={fill}>
          {`${value} (${(percent * 100).toFixed(2)}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
      </g>
    )
  }

  const totalIncome = mockIncomeData[timeRange as keyof typeof mockIncomeData].reduce((sum, item) => sum + item.income, 0)
  const averageIncome = totalIncome / mockIncomeData[timeRange as keyof typeof mockIncomeData].length

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">
        <DynamicClock />
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1,234</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>在线机器数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">42</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>今日收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">¥5,678</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>本月收入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">¥98,765</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">统计报表</h2>

        <div className="flex justify-between items-center">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>收入趋势图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockIncomeData[timeRange as keyof typeof mockIncomeData]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--foreground))"
                  />
                  <YAxis
                    stroke="hsl(var(--foreground))"
                    tickFormatter={(value) => `¥${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '4px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, '收入']}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>用户分析</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-6">
              <div className="h-[420px] md:col-span-7">
                <h3 className="text-lg font-semibold mb-4">用户上网时间分布</h3>
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={mockUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      stroke="hsl(var(--foreground))"
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tickFormatter={(value) => value}
                    />
                    <YAxis
                      stroke="hsl(var(--foreground))"
                      tickFormatter={(value) => `${value}人`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '4px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`${value}人`, '在线用户数']}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[420px] md:col-span-3">
                <h3 className="text-lg font-semibold mb-4">用户状态分布</h3>
                <ResponsiveContainer width="100%" height="90%" aspect={1}>
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={userStateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#f5f5f5"
                      stroke="#9e9e9e"
                      strokeWidth={1}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {userStateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


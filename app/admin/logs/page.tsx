'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addDays, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Search, X, RefreshCw, Loader2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'

type ManagementLog = {
  id: number
  adminId: number
  operation: string
  detail: string
  operationTime: string
}

type UserLog = {
  id: number
  userId: number
  operation: string
  detail: string
  operationTime: string
}

// Mock data for admin log entries
const mockAdminLogs: ManagementLog[] = [
  { id: 1, adminId: 1, operation: 'User Created', detail: 'Created user: john_doe', operationTime: '2023-06-01 10:00:00' },
  { id: 2, adminId: 2, operation: 'User Updated', detail: 'Updated user balance: jane_smith', operationTime: '2023-06-01 11:30:00' },
  { id: 3, adminId: 1, operation: 'Computer Added', detail: 'Added new computer: PC-001', operationTime: '2023-06-02 09:15:00' },
  { id: 4, adminId: 3, operation: 'Zone Created', detail: 'Created new zone: VIP Area', operationTime: '2023-06-02 14:45:00' },
  { id: 5, adminId: 2, operation: 'User Deleted', detail: 'Deleted user: inactive_user', operationTime: '2023-06-03 08:30:00' },
]

// Mock data for user log entries
const mockUserLogs: UserLog[] = [
  { id: 1, userId: 1, operation: 'Login', detail: 'User logged in', operationTime: '2023-06-01 09:00:00' },
  { id: 2, userId: 2, operation: 'Logout', detail: 'User logged out', operationTime: '2023-06-01 10:30:00' },
  { id: 3, userId: 3, operation: 'Purchase', detail: 'User purchased 2 hours of computer time', operationTime: '2023-06-02 11:15:00' },
  { id: 4, userId: 1, operation: 'Recharge', detail: 'User recharged account: ¥50', operationTime: '2023-06-02 13:45:00' },
  { id: 5, userId: 4, operation: 'Profile Update', detail: 'User updated profile information', operationTime: '2023-06-03 16:30:00' },
]

const getQuickDateRange = (option: string) => {
  const now = new Date()
  switch (option) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) }
    case '3days':
      return { from: startOfDay(subDays(now, 2)), to: endOfDay(now) }
    case 'week':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) }
    case 'month':
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) }
    case 'thisWeek':
      return { from: startOfWeek(now), to: endOfWeek(now) }
    case 'thisMonth':
      return { from: startOfMonth(now), to: endOfMonth(now) }
    default:
      return { from: now, to: now }
  }
}

// 添加时间格式化函数
const formatDateTime = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0')
  
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())
  const seconds = pad(date.getSeconds())

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export default function LogsPage() {
  const [adminLogs, setAdminLogs] = useState<ManagementLog[]>([])
  const [userLogs, setUserLogs] = useState<UserLog[]>([])
  const [searchAdminTerm, setSearchAdminTerm] = useState('')
  const [isAdminSearching, setIsAdminSearching] = useState(false)
  const [adminDateRange, setAdminDateRange] = useState({ from: subDays(new Date(), 7), to: new Date() })
  const [searchUserTerm, setSearchUserTerm] = useState('')
  const [isUserSearching, setIsUserSearching] = useState(false)
  const [userDateRange, setUserDateRange] = useState({ from: subDays(new Date(), 7), to: new Date() })
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [adminPageSize, setAdminPageSize] = useState<number>(100)
  const [userPageSize, setUserPageSize] = useState<number>(100)
  const [customAdminPageSize, setCustomAdminPageSize] = useState<string>('')
  const [customUserPageSize, setCustomUserPageSize] = useState<string>('')
  const [showCustomAdminPageSize, setShowCustomAdminPageSize] = useState(false)
  const [showCustomUserPageSize, setShowCustomUserPageSize] = useState(false)
  const [adminCurrentPage, setAdminCurrentPage] = useState(1)
  const [userCurrentPage, setUserCurrentPage] = useState(1)
  const [adminTotalPages, setAdminTotalPages] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [adminTotalCount, setAdminTotalCount] = useState(0)
  const [userTotalCount, setUserTotalCount] = useState(0)

  const filteredAdminLogs = adminLogs.filter(log => {
    if (!isAdminSearching) return true;
    
    const matchesSearch = 
      (log.detail?.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
       log.operation?.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
       (log.adminId !== null && log.adminId.toString().includes(searchAdminTerm.toLowerCase())));
    
    const withinDateRange = 
      new Date(log.operationTime) >= adminDateRange.from && 
      new Date(log.operationTime) <= adminDateRange.to;
    
    return matchesSearch && withinDateRange;
  });

  const filteredUserLogs = userLogs.filter(log => {
    if (!isUserSearching) return true;
    
    const matchesSearch = 
      (log.detail?.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
       log.operation?.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
       (log.userId !== null && log.userId.toString().includes(searchUserTerm.toLowerCase())));
    
    const withinDateRange = 
      new Date(log.operationTime) >= userDateRange.from && 
      new Date(log.operationTime) <= userDateRange.to;
    
    return matchesSearch && withinDateRange;
  });

  const handleAdminSearch = async () => {
    setIsAdminSearching(true)
    try {
      const params = new URLSearchParams({
        startTime: formatDateTime(adminDateRange.from),  // 使用格式化后的时间
        endTime: formatDateTime(adminDateRange.to),      // 使用格式化后的时间
        pageNum: '1',
        pageSize: '100'
      })

      // 如果有搜索关键词,添加操作类型过滤
      if (searchAdminTerm) {
        params.append('operation', searchAdminTerm)
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.MANAGEMENT_LOGS}?${params}`)
      if (!response.ok) throw new Error('搜索管理日志失败')
      
      const data = await response.json()
      setAdminLogs(data.list || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "搜索管理日志失败"
      })
    } finally {
      setIsAdminSearching(false)
    }
  }

  const clearAdminSearch = () => {
    setSearchAdminTerm('')
    setIsAdminSearching(false)
  }

  const handleUserSearch = async () => {
    setIsUserSearching(true)
    try {
      const params = new URLSearchParams({
        startTime: formatDateTime(userDateRange.from),  // 使用格式化后的时间
        endTime: formatDateTime(userDateRange.to),      // 使用格式化后的时间
        pageNum: '1',
        pageSize: '100'
      })

      // 如果有搜索关键词,添加操作类型过滤
      if (searchUserTerm) {
        params.append('operation', searchUserTerm)
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.USER_LOGS}?${params}`)
      if (!response.ok) throw new Error('搜索用户日志失败')
      
      const data = await response.json()
      setUserLogs(data.list || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "搜索用户日志失败"
      })
    } finally {
      setIsUserSearching(false)
    }
  }

  const clearUserSearch = () => {
    setSearchUserTerm('')
    setIsUserSearching(false)
  }

  useEffect(() => {
    const fetchAdminLogs = async () => {
      setIsAdminLoading(true)
      const logs = await fetchLogs('admin', adminDateRange.from, adminDateRange.to)
      setAdminLogs(logs)
      setIsAdminLoading(false)
    }
    fetchAdminLogs()
  }, [adminDateRange])

  useEffect(() => {
    const fetchUserLogs = async () => {
      setIsUserLoading(true)
      const logs = await fetchLogs('user', userDateRange.from, userDateRange.to)
      setUserLogs(logs)
      setIsUserLoading(false)
    }
    fetchUserLogs()
  }, [userDateRange])

  const handleCustomPageSize = (type: 'admin' | 'user', value: string) => {
    const size = parseInt(value)
    if (!isNaN(size) && size > 0) {
      if (type === 'admin') {
        setAdminPageSize(size)
        setCustomAdminPageSize('')
        setShowCustomAdminPageSize(false)
      } else {
        setUserPageSize(size)
        setCustomUserPageSize('')
        setShowCustomUserPageSize(false)
      }
    }
  }

  const fetchLogs = async (type: 'admin' | 'user', from: Date, to: Date) => {
    try {
      const params = new URLSearchParams({
        startTime: formatDateTime(from),
        endTime: formatDateTime(to),
        pageNum: '1',
        pageSize: (type === 'admin' ? adminPageSize : userPageSize).toString()
      })

      const url = type === 'admin' 
        ? `${API_URL}${API_ENDPOINTS.MANAGEMENT_LOGS}?${params}`
        : `${API_URL}${API_ENDPOINTS.USER_LOGS}?${params}`

      const response = await fetch(url)
      if (!response.ok) throw new Error(`获取${type === 'admin' ? '管理' : '用户'}日志失败`)
      
      const data = await response.json()
      return data.list || []
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取日志失败"
      })
      return []
    }
  }

  const handlePageSizeChange = async (type: 'admin' | 'user', newSize: number) => {
    if (type === 'admin') {
      setIsAdminLoading(true)
      try {
        const params = new URLSearchParams({
          startTime: formatDateTime(adminDateRange.from),
          endTime: formatDateTime(adminDateRange.to),
          pageNum: '1',
          pageSize: newSize.toString()
        })

        const response = await fetch(`${API_URL}${API_ENDPOINTS.MANAGEMENT_LOGS}?${params}`)
        if (!response.ok) throw new Error('获取管理日志失败')
        
        const data = await response.json()
        setAdminLogs(data.list || [])
        setAdminPageSize(newSize)
        setAdminCurrentPage(1)
        setAdminTotalCount(data.total || 0)
        setAdminTotalPages(Math.ceil((data.total || 0) / newSize))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "错误",
          description: error instanceof Error ? error.message : "获取管理日志失败"
        })
      } finally {
        setIsAdminLoading(false)
        setShowCustomAdminPageSize(false)
      }
    } else {
      setIsUserLoading(true)
      try {
        const params = new URLSearchParams({
          startTime: formatDateTime(userDateRange.from),
          endTime: formatDateTime(userDateRange.to),
          pageNum: '1',
          pageSize: newSize.toString()
        })

        const response = await fetch(`${API_URL}${API_ENDPOINTS.USER_LOGS}?${params}`)
        if (!response.ok) throw new Error('获取用户日志失败')
        
        const data = await response.json()
        setUserLogs(data.list || [])
        setUserPageSize(newSize)
        setUserCurrentPage(1)
        setUserTotalCount(data.total || 0)
        setUserTotalPages(Math.ceil((data.total || 0) / newSize))
      } catch (error) {
        toast({
          variant: "destructive",
          title: "错误",
          description: error instanceof Error ? error.message : "获取用户日志失败"
        })
      } finally {
        setIsUserLoading(false)
        setShowCustomUserPageSize(false)
      }
    }
  }

  const handlePageChange = async (type: 'admin' | 'user', pageNum: number) => {
    if (type === 'admin') {
      setIsAdminLoading(true)
      try {
        const params = new URLSearchParams({
          startTime: formatDateTime(adminDateRange.from),
          endTime: formatDateTime(adminDateRange.to),
          pageNum: pageNum.toString(),
          pageSize: adminPageSize.toString()
        })

        const response = await fetch(`${API_URL}${API_ENDPOINTS.MANAGEMENT_LOGS}?${params}`)
        if (!response.ok) throw new Error('获取管理日志失败')
        
        const data = await response.json()
        setAdminLogs(data.list || [])
        setAdminCurrentPage(pageNum)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "错误",
          description: error instanceof Error ? error.message : "获取管理日志失败"
        })
      } finally {
        setIsAdminLoading(false)
      }
    } else {
      setIsUserLoading(true)
      try {
        const params = new URLSearchParams({
          startTime: formatDateTime(userDateRange.from),
          endTime: formatDateTime(userDateRange.to),
          pageNum: pageNum.toString(),
          pageSize: userPageSize.toString()
        })

        const response = await fetch(`${API_URL}${API_ENDPOINTS.USER_LOGS}?${params}`)
        if (!response.ok) throw new Error('获取用户日志失败')
        
        const data = await response.json()
        setUserLogs(data.list || [])
        setUserCurrentPage(pageNum)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "��误",
          description: error instanceof Error ? error.message : "获取用户日志失败"
        })
      } finally {
        setIsUserLoading(false)
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="admin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admin">管理员日志</TabsTrigger>
          <TabsTrigger value="user">用户日志</TabsTrigger>
        </TabsList>
        <TabsContent value="admin">
          <Card>
            <CardHeader>
              <CardTitle>管理员操作日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 mb-4">
                <div className="flex space-x-2">
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('today'))}>今日</Button>
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('3days'))}>三天内</Button>
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('week'))}>一周内</Button>
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('month'))}>一个月内</Button>
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('thisWeek'))}>本周</Button>
                  <Button onClick={() => setAdminDateRange(getQuickDateRange('thisMonth'))}>本月</Button>
                  <Button onClick={async () => {
                    setIsAdminLoading(true)
                    const logs = await fetchLogs('admin', adminDateRange.from, adminDateRange.to)
                    setAdminLogs(logs)
                    setIsAdminLoading(false)
                  }}>
                    {isAdminLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={adminDateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => setAdminDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                  />
                  <Input
                    type="date"
                    value={adminDateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => setAdminDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="搜索管理员日志..."
                    value={searchAdminTerm}
                    onChange={(e) => setSearchAdminTerm(e.target.value)}
                    className="flex-grow"
                  />
                  {searchAdminTerm && (
                    <>
                      <Button onClick={handleAdminSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={clearAdminSearch}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">每页显示：</span>
                    <div className="flex space-x-2">
                      <Button
                        variant={adminPageSize === 500 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageSizeChange('admin', 500)}
                      >
                        500
                      </Button>
                      <Button
                        variant={adminPageSize === 1000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageSizeChange('admin', 1000)}
                      >
                        1k
                      </Button>
                      <Button
                        variant={adminPageSize === 3000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageSizeChange('admin', 3000)}
                      >
                        3k
                      </Button>
                      <Button
                        variant={adminPageSize === 5000 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageSizeChange('admin', 5000)}
                      >
                        5k
                      </Button>
                      <Button
                        variant={showCustomAdminPageSize ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCustomAdminPageSize(!showCustomAdminPageSize)}
                      >
                        自定义
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      总计 {adminTotalCount} 条记录，第 {adminCurrentPage}/{adminTotalPages} 页
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('admin', 1)}
                        disabled={adminCurrentPage === 1}
                      >
                        首页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('admin', adminCurrentPage - 1)}
                        disabled={adminCurrentPage === 1}
                      >
                        上一页
                      </Button>
                      <div className="flex items-center space-x-1">
                        <Input
                          type="number"
                          min={1}
                          max={adminTotalPages}
                          value={adminCurrentPage}
                          onChange={(e) => {
                            const page = parseInt(e.target.value)
                            if (page >= 1 && page <= adminTotalPages) {
                              handlePageChange('admin', page)
                            }
                          }}
                          className="w-16 text-center"
                        />
                        <span className="text-sm text-muted-foreground">/ {adminTotalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('admin', adminCurrentPage + 1)}
                        disabled={adminCurrentPage === adminTotalPages}
                      >
                        下一页
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange('admin', adminTotalPages)}
                        disabled={adminCurrentPage === adminTotalPages}
                      >
                        末页
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>序号</TableHead>
                    <TableHead>时间戳</TableHead>
                    <TableHead>管理员ID</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdminLogs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{new Date(log.operationTime).toLocaleString()}</TableCell>
                      <TableCell>{log.adminId}</TableCell>
                      <TableCell>{log.operation}</TableCell>
                      <TableCell>{log.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>用户操作日志</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 mb-4">
                <div className="flex space-x-2">
                  <Button onClick={() => setUserDateRange(getQuickDateRange('today'))}>今日</Button>
                  <Button onClick={() => setUserDateRange(getQuickDateRange('3days'))}>三天内</Button>
                  <Button onClick={() => setUserDateRange(getQuickDateRange('week'))}>一周内</Button>
                  <Button onClick={() => setUserDateRange(getQuickDateRange('month'))}>一个月内</Button>
                  <Button onClick={() => setUserDateRange(getQuickDateRange('thisWeek'))}>本周</Button>
                  <Button onClick={() => setUserDateRange(getQuickDateRange('thisMonth'))}>本月</Button>
                  <Button onClick={async () => {
                    setIsUserLoading(true)
                    const logs = await fetchLogs('user', userDateRange.from, userDateRange.to)
                    setUserLogs(logs)
                    setIsUserLoading(false)
                  }}>
                    {isUserLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={userDateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => setUserDateRange(prev => ({ ...prev, from: new Date(e.target.value) }))}
                  />
                  <Input
                    type="date"
                    value={userDateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => setUserDateRange(prev => ({ ...prev, to: new Date(e.target.value) }))}
                  />
                </div>
                <div className="flex space-x-2">
                  <Input
                    placeholder="搜索用户日志..."
                    value={searchUserTerm}
                    onChange={(e) => setSearchUserTerm(e.target.value)}
                    className="flex-grow"
                  />
                  {searchUserTerm && (
                    <>
                      <Button onClick={handleUserSearch}>
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={clearUserSearch}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">每页显示：</span>
                  <div className="flex space-x-2">
                    <Button
                      variant={userPageSize === 500 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSizeChange('user', 500)}
                    >
                      500
                    </Button>
                    <Button
                      variant={userPageSize === 1000 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSizeChange('user', 1000)}
                    >
                      1k
                    </Button>
                    <Button
                      variant={userPageSize === 3000 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSizeChange('user', 3000)}
                    >
                      3k
                    </Button>
                    <Button
                      variant={userPageSize === 5000 ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageSizeChange('user', 5000)}
                    >
                      5k
                    </Button>
                    <Button
                      variant={showCustomUserPageSize ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCustomUserPageSize(!showCustomUserPageSize)}
                    >
                      自定义
                    </Button>
                  </div>
                  {showCustomUserPageSize && (
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="1"
                        value={customUserPageSize}
                        onChange={(e) => setCustomUserPageSize(e.target.value)}
                        className="w-[100px]"
                        placeholder="输入条数"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleCustomPageSize('user', customUserPageSize)}
                      >
                        确定
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>序号</TableHead>
                    <TableHead>时间戳</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserLogs.map((log, index) => (
                    <TableRow key={log.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{new Date(log.operationTime).toLocaleString()}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.operation}</TableCell>
                      <TableCell>{log.detail}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


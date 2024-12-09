'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { addDays, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Search, X, RefreshCw, Loader2 } from 'lucide-react'

type LogEntry = {
  id: string
  timestamp: string
  action: string
  details: string
}

type AdminLogEntry = LogEntry & {
  adminId: string
}

type UserLogEntry = LogEntry & {
  userId: string
}

// Mock data for admin log entries
const mockAdminLogs: AdminLogEntry[] = [
  { id: '1', timestamp: '2023-06-01 10:00:00', adminId: 'admin1', action: 'User Created', details: 'Created user: john_doe' },
  { id: '2', timestamp: '2023-06-01 11:30:00', adminId: 'admin2', action: 'User Updated', details: 'Updated user balance: jane_smith' },
  { id: '3', timestamp: '2023-06-02 09:15:00', adminId: 'admin1', action: 'Computer Added', details: 'Added new computer: PC-001' },
  { id: '4', timestamp: '2023-06-02 14:45:00', adminId: 'admin3', action: 'Zone Created', details: 'Created new zone: VIP Area' },
  { id: '5', timestamp: '2023-06-03 08:30:00', adminId: 'admin2', action: 'User Deleted', details: 'Deleted user: inactive_user' },
]

// Mock data for user log entries
const mockUserLogs: UserLogEntry[] = [
  { id: '1', timestamp: '2023-06-01 09:00:00', userId: 'user1', action: 'Login', details: 'User logged in' },
  { id: '2', timestamp: '2023-06-01 10:30:00', userId: 'user2', action: 'Logout', details: 'User logged out' },
  { id: '3', timestamp: '2023-06-02 11:15:00', userId: 'user3', action: 'Purchase', details: 'User purchased 2 hours of computer time' },
  { id: '4', timestamp: '2023-06-02 13:45:00', userId: 'user1', action: 'Recharge', details: 'User recharged account: ¥50' },
  { id: '5', timestamp: '2023-06-03 16:30:00', userId: 'user4', action: 'Profile Update', details: 'User updated profile information' },
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

const fetchLogs = async (type: 'admin' | 'user', from: Date, to: Date) => {
  // In a real application, this would be an API call
  console.log(`Fetching ${type} logs from ${from.toISOString()} to ${to.toISOString()}`)
  // For now, we'll just return the mock data
  return type === 'admin' ? mockAdminLogs : mockUserLogs
}

export default function LogsPage() {
  const [adminLogs, setAdminLogs] = useState<AdminLogEntry[]>(mockAdminLogs)
  const [userLogs, setUserLogs] = useState<UserLogEntry[]>(mockUserLogs)
  const [searchAdminTerm, setSearchAdminTerm] = useState('')
  const [isAdminSearching, setIsAdminSearching] = useState(false)
  const [adminDateRange, setAdminDateRange] = useState({ from: subDays(new Date(), 7), to: new Date() })
  const [searchUserTerm, setSearchUserTerm] = useState('')
  const [isUserSearching, setIsUserSearching] = useState(false)
  const [userDateRange, setUserDateRange] = useState({ from: subDays(new Date(), 7), to: new Date() })
  const [isAdminLoading, setIsAdminLoading] = useState(false)
  const [isUserLoading, setIsUserLoading] = useState(false)

  const filteredAdminLogs = adminLogs.filter(log => 
    (!isAdminSearching || log.details.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
     log.adminId.toLowerCase().includes(searchAdminTerm.toLowerCase())) &&
    (new Date(log.timestamp) >= adminDateRange.from && new Date(log.timestamp) <= adminDateRange.to)
  )

  const filteredUserLogs = userLogs.filter(log => 
    (!isUserSearching || log.details.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
     log.userId.toLowerCase().includes(searchUserTerm.toLowerCase())) &&
    (new Date(log.timestamp) >= userDateRange.from && new Date(log.timestamp) <= userDateRange.to)
  )

  const handleAdminSearch = () => {
    setIsAdminSearching(true)
  }

  const clearAdminSearch = () => {
    setSearchAdminTerm('')
    setIsAdminSearching(false)
  }

  const handleUserSearch = () => {
    setIsUserSearching(true)
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
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间戳</TableHead>
                    <TableHead>管理员ID</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdminLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.adminId}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
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
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间戳</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.timestamp}</TableCell>
                      <TableCell>{log.userId}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.details}</TableCell>
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


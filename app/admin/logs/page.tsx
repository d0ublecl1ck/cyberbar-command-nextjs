'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export default function LogsPage() {
  const [adminLogs, setAdminLogs] = useState<AdminLogEntry[]>(mockAdminLogs)
  const [userLogs, setUserLogs] = useState<UserLogEntry[]>(mockUserLogs)
  const [filterAdmin, setFilterAdmin] = useState<string>('all')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterAdminAction, setFilterAdminAction] = useState<string>('all')
  const [filterUserAction, setFilterUserAction] = useState<string>('all')
  const [searchAdminTerm, setSearchAdminTerm] = useState<string>('')
  const [searchUserTerm, setSearchUserTerm] = useState<string>('')

  const uniqueAdmins = Array.from(new Set(mockAdminLogs.map(log => log.adminId)))
  const uniqueUsers = Array.from(new Set(mockUserLogs.map(log => log.userId)))
  const uniqueAdminActions = Array.from(new Set(mockAdminLogs.map(log => log.action)))
  const uniqueUserActions = Array.from(new Set(mockUserLogs.map(log => log.action)))

  const filteredAdminLogs = adminLogs.filter(log => 
    (filterAdmin === 'all' || log.adminId === filterAdmin) &&
    (filterAdminAction === 'all' || log.action === filterAdminAction) &&
    (log.details.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchAdminTerm.toLowerCase()) ||
     log.adminId.toLowerCase().includes(searchAdminTerm.toLowerCase()))
  )

  const filteredUserLogs = userLogs.filter(log => 
    (filterUser === 'all' || log.userId === filterUser) &&
    (filterUserAction === 'all' || log.action === filterUserAction) &&
    (log.details.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
     log.action.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
     log.userId.toLowerCase().includes(searchUserTerm.toLowerCase()))
  )

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
              <div className="flex space-x-4 mb-4">
                <Select value={filterAdmin} onValueChange={setFilterAdmin}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择管理员" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有管理员</SelectItem>
                    {uniqueAdmins.map(admin => (
                      <SelectItem key={admin} value={admin}>{admin}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterAdminAction} onValueChange={setFilterAdminAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有操作</SelectItem>
                    {uniqueAdminActions.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="搜索管理员日志..."
                  value={searchAdminTerm}
                  onChange={(e) => setSearchAdminTerm(e.target.value)}
                  className="w-[300px]"
                />
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
              <div className="flex space-x-4 mb-4">
                <Select value={filterUser} onValueChange={setFilterUser}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择用户" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有用户</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterUserAction} onValueChange={setFilterUserAction}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择操作类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有操作</SelectItem>
                    {uniqueUserActions.map(action => (
                      <SelectItem key={action} value={action}>{action}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="搜索用户日志..."
                  value={searchUserTerm}
                  onChange={(e) => setSearchUserTerm(e.target.value)}
                  className="w-[300px]"
                />
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


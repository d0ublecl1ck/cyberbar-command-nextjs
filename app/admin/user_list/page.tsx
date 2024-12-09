'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RefreshCw, UserPlus, ArrowUp } from 'lucide-react'

// Generate 200 mock users
const generateMockUsers = (count: number) => {
  const statuses = ['离线', '在线', '封禁'];
  return Array.from({ length: count }, (_, i) => ({
    userid: (i + 1).toString(),
    name: `用户${i + 1}`,
    idCard: `11010119900101${(1000 + i).toString().slice(1)}`,
    phone: `138${(10000000 + i).toString().slice(1)}`,
    balance: Math.floor(Math.random() * 1000),
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }))
}

const mockUsers = generateMockUsers(200)

export default function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState(mockUsers)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [minBalance, setMinBalance] = useState('')
  const [maxBalance, setMaxBalance] = useState('')
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [usersPerPage, setUsersPerPage] = useState(20)
  const [showBackToTop, setShowBackToTop] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const handleRefresh = () => {
    // In a real application, this would fetch the latest data from the server
    console.log('Refreshing user list...')
    setUsers(generateMockUsers(200))
    applyFilters()
  }

  const applyFilters = () => {
    let filtered = users.filter(user => 
      (statusFilter === 'all' || user.status === statusFilter) &&
      (minBalance === '' || user.balance >= Number(minBalance)) &&
      (maxBalance === '' || user.balance <= Number(maxBalance)) &&
      Object.values(user).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
    setFiltersApplied(
      statusFilter !== 'all' || 
      minBalance !== '' || 
      maxBalance !== '' || 
      searchTerm !== ''
    )
  }

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMinBalance('')
    setMaxBalance('')
    setFilteredUsers(users)
    setCurrentPage(1)
    setFiltersApplied(false)
  }

  useEffect(() => {
    applyFilters()
  }, [users, statusFilter, minBalance, maxBalance])

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '在线':
        return <Badge variant="success">在线</Badge>
      case '离线':
        return <Badge variant="secondary">离线</Badge>
      case '封禁':
        return <Badge variant="destructive">封禁</Badge>
      default:
        return null
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>总用户数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredUsers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>在线用户</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredUsers.filter(u => u.status === '在线').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>封禁用户</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredUsers.filter(u => u.status === '封禁').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <Input
              type="text"
              placeholder="搜索用户..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="离线">离线</SelectItem>
                <SelectItem value="在线">在线</SelectItem>
                <SelectItem value="封禁">封禁</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="最低余额"
              value={minBalance}
              onChange={(e) => setMinBalance(e.target.value)}
              className="w-[120px]"
            />
            <Input
              type="number"
              placeholder="最高余额"
              value={maxBalance}
              onChange={(e) => setMaxBalance(e.target.value)}
              className="w-[120px]"
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            {filtersApplied && (
              <Button type="button" variant="outline" onClick={resetFilters}>
                取消筛选
              </Button>
            )}
            <Button type="button" onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Select
              value={usersPerPage.toString()}
              onValueChange={(value) => setUsersPerPage(Number(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="每页显示数量" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="30">30条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/admin/user/new">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                添加新用户
              </Button>
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>用户ID</TableHead>
                <TableHead>姓名</TableHead>
                <TableHead>身份证</TableHead>
                <TableHead>手机号</TableHead>
                <TableHead>余额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.userid}>
                  <TableCell>{user.userid}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.idCard}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>¥{user.balance}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/admin/user/${user.userid}`}>
                        <Button variant="outline" size="sm">编辑</Button>
                      </Link>
                      <Link href={`/admin/user/profile?id=${user.userid}`}>
                        <Button variant="outline" size="sm">查看档案</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-2"
          onClick={scrollToTop}
          size="icon"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}


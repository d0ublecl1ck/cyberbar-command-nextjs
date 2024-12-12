'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, RefreshCw, UserPlus, ArrowUp, Eye, EyeOff } from 'lucide-react'
import { toast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  identityCard: string
  phoneNumber: string
  balance: number
  status: string
}

type UserStats = {
  totalUsers: number
  onlineUsers: number
  bannedUsers: number
}

type PrivacyState = {
  [key: string]: {
    showIdCard: boolean;
    showPhone: boolean;
    showBalance: boolean;
  }
}

type PaginationResponse = {
  pageNum: number;
  pageSize: number;
  total: number;
  pages: number;
  list: User[];
  prePage: number;
  nextPage: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export default function UserListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [minBalance, setMinBalance] = useState('')
  const [maxBalance, setMaxBalance] = useState('')
  const [filtersApplied, setFiltersApplied] = useState(false)
  const [usersPerPage, setUsersPerPage] = useState(20)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    onlineUsers: 0,
    bannedUsers: 0
  })
  const [privacyState, setPrivacyState] = useState<PrivacyState>({})

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleRefresh = () => {
    fetchUserStats()
    fetchUsers()
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/stats`)
      if (!response.ok) throw new Error('获取用户统计信息失败')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取用户统计信息失败"
      })
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        pageNum: currentPage.toString(),
        pageSize: usersPerPage.toString()
      })

      if (searchTerm) params.append('keyword', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (minBalance) params.append('minBalance', minBalance)
      if (maxBalance) params.append('maxBalance', maxBalance)

      const response = await fetch(`${API_URL}${API_ENDPOINTS.USERS}/search?${params}`)
      if (!response.ok) throw new Error('获取用户列表失败')
      
      const data: PaginationResponse = await response.json()
      
      setUsers(data.list || [])
      
      setTotalPages(data.pages)

      setCurrentPage(data.pageNum)

    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取用户列表失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserStats()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      fetchUsers()
    }
  }, [currentPage, usersPerPage, statusFilter])

  useEffect(() => {
    setFiltersApplied(
      statusFilter !== 'all' || 
      searchTerm !== '' || 
      minBalance !== '' || 
      maxBalance !== ''
    )
  }, [statusFilter, searchTerm, minBalance, maxBalance])

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setMinBalance('')
    setMaxBalance('')
    setCurrentPage(1)
    setFiltersApplied(false)
    fetchUsers()
  }

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Online':
        return <Badge variant="default">在线</Badge>
      case 'Offline':
        return <Badge variant="secondary">离线</Badge>
      case 'Banned':
        return <Badge variant="destructive">封禁</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatIdCard = (idCard: string, show: boolean) => {
    if (show) return idCard
    return idCard.replace(/^(.{4})(.*)(.{4})$/, '$1**********$3')
  }

  const formatPhoneNumber = (phone: string, show: boolean) => {
    if (show) return phone
    return phone.replace(/^(.{3})(.*)(.{4})$/, '$1****$3')
  }

  const formatBalance = (balance: number, show: boolean) => {
    if (show) return `¥${balance.toFixed(2)}`
    return '¥****'
  }

  const togglePrivacy = (userId: string, field: 'showIdCard' | 'showPhone' | 'showBalance') => {
    setPrivacyState(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: !prev[userId]?.[field]
      }
    }))
  }

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Card>
          <CardContent className="flex justify-center items-center h-32">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>加载中...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>总用户数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>在线用户</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.onlineUsers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>封禁用户</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.bannedUsers}</p>
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
                    <SelectItem value="Offline">离线</SelectItem>
                    <SelectItem value="Online">在线</SelectItem>
                    <SelectItem value="Banned">封禁</SelectItem>
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
                    <TableHead>序号</TableHead>
                    <TableHead>用户ID</TableHead>
                    <TableHead>姓名</TableHead>
                    <TableHead>身份证号</TableHead>
                    <TableHead>手机号</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>
                            {formatIdCard(
                              user.identityCard,
                              privacyState[user.id]?.showIdCard || false
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => togglePrivacy(user.id, 'showIdCard')}
                          >
                            {privacyState[user.id]?.showIdCard ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>
                            {formatPhoneNumber(
                              user.phoneNumber,
                              privacyState[user.id]?.showPhone || false
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => togglePrivacy(user.id, 'showPhone')}
                          >
                            {privacyState[user.id]?.showPhone ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>
                            {formatBalance(
                              user.balance,
                              privacyState[user.id]?.showBalance || false
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => togglePrivacy(user.id, 'showBalance')}
                          >
                            {privacyState[user.id]?.showBalance ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/user/${user.id}`}>
                            <Button variant="outline" size="sm">编辑</Button>
                          </Link>
                          <Link href={`/admin/user/profile?id=${user.id}`}>
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
        </>
      )}
    </div>
  )
}


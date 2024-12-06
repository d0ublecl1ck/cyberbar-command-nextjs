'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Monitor, Lock, Unlock, RefreshCw } from 'lucide-react'

// Mock data for online computers
const mockComputers = [
  { id: 1, location: '一楼-A区', price: 5, status: 'occupied', user: '张三' },
  { id: 2, location: '一楼-A区', price: 5, status: 'available', user: null },
  { id: 3, location: '一楼-B区', price: 6, status: 'occupied', user: '李四' },
  { id: 4, location: '二楼-C区', price: 7, status: 'maintenance', user: null },
  { id: 5, location: '二楼-C区', price: 7, status: 'available', user: null },
]

export default function OnlineComputersPage() {
  const [computers, setComputers] = useState(mockComputers)
  const [filteredComputers, setFilteredComputers] = useState(mockComputers)
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersApplied, setFiltersApplied] = useState(false)

  const handleLockUnlock = (id: number) => {
    setComputers(computers.map(computer => 
      computer.id === id 
        ? { ...computer, status: computer.status === 'available' ? 'maintenance' : 'available' }
        : computer
    ))
  }

  const handleRefresh = () => {
    // In a real application, this would fetch the latest data from the server
    console.log('Refreshing computer list...')
  }

  const resetFilters = () => {
    setLocationFilter('all')
    setStatusFilter('all')
    setMinPrice('')
    setMaxPrice('')
    setFilteredComputers(computers)
    setFiltersApplied(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'occupied':
        return <Badge variant="default">使用中</Badge>
      case 'available':
        return <Badge variant="secondary">空闲</Badge>
      case 'maintenance':
        return <Badge variant="destructive">维护中</Badge>
      default:
        return null
    }
  }

  useEffect(() => {
    const isFiltered = locationFilter !== 'all' || statusFilter !== 'all' || minPrice !== '' || maxPrice !== '';
    setFiltersApplied(isFiltered);

    if (!isFiltered) {
      setFilteredComputers(computers);
    } else {
      let filtered = computers;

      if (locationFilter !== 'all') {
        filtered = filtered.filter(computer => computer.location === locationFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(computer => computer.status === statusFilter);
      }

      if (minPrice !== '') {
        filtered = filtered.filter(computer => computer.price >= Number(minPrice));
      }

      if (maxPrice !== '') {
        filtered = filtered.filter(computer => computer.price <= Number(maxPrice));
      }

      setFilteredComputers(filtered);
    }
  }, [computers, locationFilter, statusFilter, minPrice, maxPrice])

  const uniqueLocations = Array.from(new Set(computers.map(c => c.location)))

  return (
    <div className="space-y-6">
      {/* Removed h1 tag */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>总电脑数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredComputers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>使用中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredComputers.filter(c => c.status === 'occupied').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>空闲</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredComputers.filter(c => c.status === 'available').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部位置</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="occupied">使用中</SelectItem>
                <SelectItem value="available">空闲</SelectItem>
                <SelectItem value="maintenance">维护中</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="最低价格"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-[120px]"
            />
            <Input
              type="number"
              placeholder="最高价格"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-[120px]"
            />
            {filtersApplied && (
              <Button onClick={resetFilters} variant="outline">
                取消筛选
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>电脑列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>编号</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>价格（元/小时）</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>使用者</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComputers.map((computer) => (
                <TableRow key={computer.id}>
                  <TableCell>{computer.id}</TableCell>
                  <TableCell>{computer.location}</TableCell>
                  <TableCell>{computer.price}</TableCell>
                  <TableCell>{getStatusBadge(computer.status)}</TableCell>
                  <TableCell>{computer.user || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLockUnlock(computer.id)}
                    >
                      {computer.status === 'maintenance' ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          解锁
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          锁定
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


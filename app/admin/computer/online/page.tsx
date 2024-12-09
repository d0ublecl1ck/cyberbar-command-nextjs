'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Monitor, Lock, Unlock, RefreshCw } from 'lucide-react'

type Machine = {
  id: string
  location: string
  price: number
  status: string
  user: string | null
}

export default function OnlineComputersPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>(machines)
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [filtersApplied, setFiltersApplied] = useState(false)

  // 获取机器列表
  const fetchMachines = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}`)
      if (!response.ok) throw new Error('获取机器列表失败')
      const data = await response.json()
      setMachines(data.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取机器列表失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 更新机器状态
  const handleLockUnlock = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINE_STATUS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          machineId: id,
          status: 'maintenance' // 或 'available'
        })
      })

      if (!response.ok) throw new Error('更新机器状态失败')
      
      await fetchMachines()
      toast({
        title: "成功",
        description: "机器状态更新成功"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "更新机器状态失败"
      })
    }
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
    setFilteredMachines(machines)
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
      setFilteredMachines(machines);
    } else {
      let filtered = machines;

      if (locationFilter !== 'all') {
        filtered = filtered.filter(machine => machine.location === locationFilter);
      }

      if (statusFilter !== 'all') {
        filtered = filtered.filter(machine => machine.status === statusFilter);
      }

      if (minPrice !== '') {
        filtered = filtered.filter(machine => machine.price >= Number(minPrice));
      }

      if (maxPrice !== '') {
        filtered = filtered.filter(machine => machine.price <= Number(maxPrice));
      }

      setFilteredMachines(filtered);
    }
  }, [machines, locationFilter, statusFilter, minPrice, maxPrice])

  const uniqueLocations = Array.from(new Set(machines.map(m => m.location)))

  useEffect(() => {
    fetchMachines()
  }, [])

  return (
    <div className="space-y-6">
      {/* Removed h1 tag */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>总电脑数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredMachines.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>使用中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredMachines.filter(m => m.status === 'occupied').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>空闲</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredMachines.filter(m => m.status === 'available').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>维护中</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{filteredMachines.filter(m => m.status === 'maintenance').length}</p>
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
                <SelectItem value="maintenance">���护中</SelectItem>
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
              {filteredMachines.map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>{machine.id}</TableCell>
                  <TableCell>{machine.location}</TableCell>
                  <TableCell>{machine.price}</TableCell>
                  <TableCell>{getStatusBadge(machine.status)}</TableCell>
                  <TableCell>{machine.user || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLockUnlock(machine.id)}
                    >
                      {machine.status === 'maintenance' ? (
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


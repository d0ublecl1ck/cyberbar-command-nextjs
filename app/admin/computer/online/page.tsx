'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { RefreshCw, Edit2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Machine = {
  id: number
  onlineUserId: number | null
  price: number
  status: 'Abnormal' | 'Idle' | 'Occupied'
  zoneId: number | null
}

type Zone = {
  id: number
  name: string
}

type MachineStats = {
  totalMachines: number
  occupiedMachines: number
  idleMachines: number
  abnormalMachines: number
}

type PaginationResponse = {
  pageNum: number
  pageSize: number
  total: number
  pages: number
  list: Machine[]
  prePage: number
  nextPage: number
  isFirstPage: boolean
  isLastPage: boolean
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export default function OnlineComputersPage() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [stats, setStats] = useState<MachineStats>({
    totalMachines: 0,
    occupiedMachines: 0,
    idleMachines: 0,
    abnormalMachines: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedZone, setSelectedZone] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(20)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    price: '',
    status: '',
    zoneId: ''
  })
  const [tempMinPrice, setTempMinPrice] = useState('')
  const [tempMaxPrice, setTempMaxPrice] = useState('')
  const [selectedMachines, setSelectedMachines] = useState<number[]>([])
  const [batchEditDialogOpen, setBatchEditDialogOpen] = useState(false)
  const [batchEditForm, setBatchEditForm] = useState({
    price: '',
    status: '',
    zoneId: ''
  })

  const fetchZones = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}`)
      if (!response.ok) throw new Error('获取区域列表失败')
      const data = await response.json()
      setZones(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取区域列表失败"
      })
    }
  }

  const fetchMachineStats = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedZone !== 'all' && selectedZone !== 'unzoned') {
        params.append('zoneId', selectedZone)
      }
      
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/stats?${params}`)
      if (!response.ok) throw new Error('获取机器统计信息失败')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取机器统计信息失败"
      })
    }
  }

  const fetchMachines = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        pageNum: currentPage.toString(),
        pageSize: usersPerPage.toString()
      })
      
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (minPrice) params.append('minPrice', minPrice)
      if (maxPrice) params.append('maxPrice', maxPrice)

      let url = `${API_URL}${API_ENDPOINTS.MACHINES}/search`
      
      if (selectedZone === 'unzoned') {
        url = `${API_URL}${API_ENDPOINTS.MACHINES}/unbound`
      } 
      else if (selectedZone !== 'all') {
        params.append('zoneId', selectedZone)
      }

      const response = await fetch(`${url}?${params}`)
      if (!response.ok) throw new Error('获取机器列表失败')
      
      const data: PaginationResponse = await response.json()
      setMachines(data.list || [])
      setTotalPages(data.pages)
      setCurrentPage(data.pageNum)
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

  useEffect(() => {
    fetchZones()
    fetchMachineStats()
    fetchMachines()
  }, [])

  useEffect(() => {
    if (!isLoading) {
      fetchMachineStats()
      fetchMachines()
    }
  }, [currentPage, usersPerPage, statusFilter, minPrice, maxPrice, selectedZone])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Occupied':
        return <Badge variant="default">使用中</Badge>
      case 'Idle':
        return <Badge variant="secondary">空闲</Badge>
      case 'Abnormal':
        return <Badge variant="destructive">异常</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleRefresh = () => {
    fetchMachineStats()
    fetchMachines()
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEdit = (machine: Machine) => {
    setEditingMachine(machine)
    setEditForm({
      price: machine.price.toString(),
      status: machine.status,
      zoneId: machine.zoneId?.toString() || 'unzoned'
    })
    setEditDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingMachine) return

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${editingMachine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: parseFloat(editForm.price),
          status: editForm.status,
          zoneId: editForm.zoneId === 'unzoned' ? null : parseInt(editForm.zoneId)
        }),
      })

      if (!response.ok) throw new Error('更新机器信息失败')

      toast({
        title: "成功",
        description: "机器信息已更新",
      })

      setEditDialogOpen(false)
      fetchMachines()
      fetchMachineStats()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "更新机器信息失败"
      })
    }
  }

  const handlePriceKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.target as HTMLInputElement
      input.blur() // 触发 onBlur 事件
    }
  }

  const handleMinPriceBlur = () => {
    setMinPrice(tempMinPrice)
  }

  const handleMaxPriceBlur = () => {
    setMaxPrice(tempMaxPrice)
  }

  const handleBatchSave = async () => {
    try {
      const updates = selectedMachines.map(async (machineId) => {
        // 首先获取当前机器的完整信息
        const machineResponse = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${machineId}`)
        if (!machineResponse.ok) throw new Error(`获取机器 ${machineId} 信息失败`)
        const currentMachine = await machineResponse.json()

        // 构建更新对象，只更新用户指定要修改的字段
        const updatedMachine = {
          ...currentMachine,
          ...(batchEditForm.price && { price: parseFloat(batchEditForm.price) }),
          ...(batchEditForm.status && { status: batchEditForm.status }),
          ...(batchEditForm.zoneId && { 
            zoneId: batchEditForm.zoneId === 'unzoned' ? null : parseInt(batchEditForm.zoneId) 
          })
        }

        // 发送更新请求
        const updateResponse = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/${machineId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedMachine)
        })

        if (!updateResponse.ok) {
          throw new Error(`更新机器 ${machineId} 失败`)
        }
      })

      await Promise.all(updates)
      
      toast({
        title: "成功",
        description: "已批量更新机器信息",
      })

      setBatchEditDialogOpen(false)
      setSelectedMachines([])
      setBatchEditForm({
        price: '',
        status: '',
        zoneId: ''
      })
      fetchMachines()
      fetchMachineStats()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "批量更新机器信息失败"
      })
    }
  }

  const toggleSelectAll = () => {
    if (selectedMachines.length === machines.length) {
      setSelectedMachines([])
    } else {
      setSelectedMachines(machines.map(machine => machine.id))
    }
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>总机器数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.totalMachines}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>使用中</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.occupiedMachines}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>空闲</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.idleMachines}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>异常</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{stats.abnormalMachines}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>筛选</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="状态筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="Idle">空闲</SelectItem>
                    <SelectItem value="Occupied">使用中</SelectItem>
                    <SelectItem value="Abnormal">异常</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedZone}
                  onValueChange={setSelectedZone}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="选择区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部区域</SelectItem>
                    <SelectItem value="unzoned">未分区</SelectItem>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="最低价格"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  onBlur={handleMinPriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  className="w-[120px]"
                />
                <Input
                  type="number"
                  placeholder="最高价格"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  onBlur={handleMaxPriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  className="w-[120px]"
                />
                <Button onClick={handleRefresh} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>机器列表</CardTitle>
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
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedMachines.length === machines.length}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>序号</TableHead>
                    <TableHead>机器ID</TableHead>
                    <TableHead>区域</TableHead>
                    <TableHead>价格</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>在线用户</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {machines.map((machine, index) => (
                    <TableRow key={machine.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedMachines.includes(machine.id)}
                          onCheckedChange={(checked: boolean | 'indeterminate') => {
                            if (checked === true) {
                              setSelectedMachines(prev => [...prev, machine.id])
                            } else {
                              setSelectedMachines(prev => prev.filter(id => id !== machine.id))
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>{(currentPage - 1) * usersPerPage + index + 1}</TableCell>
                      <TableCell>{machine.id}</TableCell>
                      <TableCell>
                        {machine.zoneId ? zones.find(zone => zone.id === machine.zoneId)?.name || '-' : '未分区'}
                      </TableCell>
                      <TableCell>¥{machine.price}/小时</TableCell>
                      <TableCell>{getStatusBadge(machine.status)}</TableCell>
                      <TableCell>{machine.onlineUserId ?? '-'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(machine)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
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

          {selectedMachines.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p>已选择 {selectedMachines.length} 台机器</p>
                  <div className="space-x-2">
                    <Button onClick={() => setBatchEditDialogOpen(true)}>
                      批量编辑
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedMachines([])}>
                      取消选择
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑机器信息</DialogTitle>
                <DialogDescription>
                  修改机器 #{editingMachine?.id} 的信息
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    价格（元/小时）
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    状态
                  </Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idle">空闲</SelectItem>
                      <SelectItem value="Abnormal">异常</SelectItem>
                      <SelectItem value="Occupied">使用中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="zone" className="text-right">
                    区域
                  </Label>
                  <Select
                    value={editForm.zoneId}
                    onValueChange={(value) => setEditForm({ ...editForm, zoneId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择区域" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unzoned">未分区</SelectItem>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSave}>保存更改</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={batchEditDialogOpen} onOpenChange={setBatchEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>批量编辑机器信息</DialogTitle>
                <DialogDescription>
                  将更新 {selectedMachines.length} 台机器的信息
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batch-price" className="text-right">
                    价格（元/小时）
                  </Label>
                  <Input
                    id="batch-price"
                    type="number"
                    step="0.01"
                    value={batchEditForm.price}
                    onChange={(e) => setBatchEditForm({ ...batchEditForm, price: e.target.value })}
                    className="col-span-3"
                    placeholder="保持不变"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batch-status" className="text-right">
                    状态
                  </Label>
                  <Select
                    value={batchEditForm.status}
                    onValueChange={(value) => setBatchEditForm({ ...batchEditForm, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="保持不变" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idle">空闲</SelectItem>
                      <SelectItem value="Abnormal">异常</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="batch-zone" className="text-right">
                    区域
                  </Label>
                  <Select
                    value={batchEditForm.zoneId}
                    onValueChange={(value) => setBatchEditForm({ ...batchEditForm, zoneId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="保持不变" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unzoned">未分区</SelectItem>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id.toString()}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBatchEditDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleBatchSave}>保存更改</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}


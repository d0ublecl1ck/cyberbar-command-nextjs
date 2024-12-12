'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge'

type Zone = {
  id: string
  name: string
}

type Machine = {
  id: number
  status: 'Idle' | 'Occupied' | 'Abnormal'
  price: number
  zoneId: number | null
  onlineUserId: number | null
}

type ZoneWithMachines = Zone & {
  machines: Machine[]
}

export default function ComputerZonesPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [zonesWithMachines, setZonesWithMachines] = useState<ZoneWithMachines[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newZoneName, setNewZoneName] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [deletingZone, setDeletingZone] = useState<Zone | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showMachines, setShowMachines] = useState(false)

  // 获取所有区域
  const fetchZonesAndMachines = async () => {
    try {
      setIsLoading(true)
      // 获取所有区域
      const zonesResponse = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}`)
      if (!zonesResponse.ok) throw new Error('获取区域列表失败')
      const zonesData = await zonesResponse.json()
      setZones(zonesData)

      // 为每个区域获取机器列表
      const zonesWithMachinesData = await Promise.all(
        zonesData.map(async (zone: Zone) => {
          const machinesResponse = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/zone/${zone.id}`)
          if (!machinesResponse.ok) throw new Error(`获取区域 ${zone.name} 的机器列表失败`)
          const machines = await machinesResponse.json()
          return {
            ...zone,
            machines: machines
          }
        })
      )

      setZonesWithMachines(zonesWithMachinesData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取数据失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 检查区域名称是否存在
  const checkZoneName = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const existingZone = zones.find(zone => 
        zone.name === name && zone.id !== excludeId
      )
      return !!existingZone
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "检查区域名称失败"
      })
      return true
    }
  }

  // 添加新区域
  const handleAddZone = async () => {
    try {
      if (!newZoneName.trim()) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "区域名称不能为空"
        })
        return
      }

      // 检查名称是否已存在
      const nameExists = await checkZoneName(newZoneName)
      if (nameExists) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "该区域名称已存在"
        })
        return
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newZoneName })
      })

      if (!response.ok) throw new Error('添加区域失败')
      
      await fetchZonesAndMachines()
      setNewZoneName('')
      setIsAddDialogOpen(false)
      toast({
        title: "成功",
        description: "区域添加成功"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "添加区域失败"
      })
    }
  }

  // 删除区域
  const handleDeleteZone = async () => {
    if (!deletingZone) return

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}/${deletingZone.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('删除区域失败')
      
      await fetchZonesAndMachines()
      setIsDeleteDialogOpen(false)
      setDeletingZone(null)
      toast({
        title: "成功",
        description: "区域删除成功"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "删除区域失败"
      })
    }
  }

  // 更新区域
  const handleUpdateZone = async () => {
    if (!editingZone) return

    try {
      if (!editingZone.name.trim()) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "区域名称不能为空"
        })
        return
      }

      // 检查名称是否已存在
      const nameExists = await checkZoneName(editingZone.name, editingZone.id)
      if (nameExists) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "该区域名称已存在"
        })
        return
      }

      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}/${editingZone.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editingZone.name })
      })

      if (!response.ok) throw new Error('更新区域失败')
      
      await fetchZonesAndMachines()
      setIsEditDialogOpen(false)
      setEditingZone(null)
      toast({
        title: "成功",
        description: "区域更新成功"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "更新区域失败"
      })
    }
  }

  // 获取空闲机器
  const getIdleMachines = (zoneId: string) => {
    const zone = zonesWithMachines.find(z => z.id === zoneId)
    return zone?.machines.filter(machine => machine.status === 'Idle') || []
  }

  useEffect(() => {
    fetchZonesAndMachines()
  }, [])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>区域管理</CardTitle>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            添加区域
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>区域名称</TableHead>
                <TableHead>空闲机器数</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.id}</TableCell>
                  <TableCell>{zone.name}</TableCell>
                  <TableCell>
                    {getIdleMachines(zone.id).length}台
                    <Button
                      variant="link"
                      onClick={() => {
                        setSelectedZone(zone.id)
                        setShowMachines(true)
                      }}
                    >
                      查看详情
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setEditingZone(zone)
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDeletingZone(zone)
                        setIsDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加区域对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新区域</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                区域名称
              </Label>
              <Input
                id="name"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleAddZone}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑区域对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑区域</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                区域名称
              </Label>
              <Input
                id="edit-name"
                value={editingZone?.name || ''}
                onChange={(e) => setEditingZone(prev => prev ? { ...prev, name: e.target.value } : null)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateZone}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除区域 "{deletingZone?.name}" 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteZone}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 显示空闲机器的对话框 */}
      <Dialog open={showMachines} onOpenChange={setShowMachines}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {zones.find(z => z.id === selectedZone)?.name} - 空闲机器列表
            </DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>机器ID</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>价格(元/小时)</TableHead>
                <TableHead>所属区域</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedZone && getIdleMachines(selectedZone).map((machine) => (
                <TableRow key={machine.id}>
                  <TableCell>{machine.id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">空闲</Badge>
                  </TableCell>
                  <TableCell>¥{machine.price}</TableCell>
                  <TableCell>
                    {zones.find(z => z.id === machine.zoneId)?.name || '未分配'}
                  </TableCell>
                </TableRow>
              ))}
              {selectedZone && getIdleMachines(selectedZone).length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    该区域暂无空闲机器
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMachines(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


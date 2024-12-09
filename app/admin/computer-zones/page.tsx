'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Save, Trash2, X } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Zone = {
  id: string
  name: string
  capacity: number
  pricePerHour: number
}

export default function ComputerZonesPage() {
  const [zones, setZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newZone, setNewZone] = useState<Omit<Zone, 'id'>>({
    name: '',
    capacity: 0,
    pricePerHour: 0
  })

  // 获取所有区域
  const fetchZones = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONES}`)
      if (!response.ok) throw new Error('获取区域列表失败')
      const data = await response.json()
      setZones(data.data || [])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取区域列表失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 检查区域名称是否存在
  const checkZoneName = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONE_CHECK(name)}`)
      if (!response.ok) throw new Error('检查区域名称失败')
      const data = await response.json()
      return data.exists
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: "检查区域名称失败"
      })
      return true // 发生错误时返回 true 以阻止操作
    }
  }

  // 添加新区域
  const handleAddZone = async () => {
    try {
      // 首先检查名称是否已存在
      const nameExists = await checkZoneName(newZone.name)
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
        body: JSON.stringify(newZone)
      })

      if (!response.ok) throw new Error('添加区域失败')
      
      await fetchZones()
      setNewZone({ name: '', capacity: 0, pricePerHour: 0 })
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
  const handleDeleteZone = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONE_BY_ID(id)}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('删除区域失败')
      
      await fetchZones()
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
  const handleUpdateZone = async (zone: Zone) => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.ZONE_BY_ID(zone.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zone)
      })

      if (!response.ok) throw new Error('更新区域失败')
      
      await fetchZones()
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

  useEffect(() => {
    fetchZones()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>分区列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>分区名称</TableHead>
                <TableHead>删除</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell>
                    <div className="flex items-center justify-between">
                      <span>{zone.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">添加新分区</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新分区</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                分区名称
              </Label>
              <Input
                id="name"
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddZone}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


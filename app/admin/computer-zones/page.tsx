'use client'

import { useState } from 'react'
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
}

const initialZones: Zone[] = [
  { id: '1', name: '一楼-A区' },
  { id: '2', name: '一楼-B区' },
  { id: '3', name: '二楼-C区' },
]

export default function ComputerZonesPage() {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [newZone, setNewZone] = useState<Omit<Zone, 'id'>>({ name: '' })
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editedZone, setEditedZone] = useState<Zone | null>(null)
  const [deleteConfirmZone, setDeleteConfirmZone] = useState<Zone | null>(null)

  const handleAddZone = () => {
    const id = (zones.length + 1).toString()
    setZones([...zones, { ...newZone, id }])
    setNewZone({ name: '' })
    toast({
      title: "分区添加成功",
      description: `新分区 "${newZone.name}" 已成功添加。`,
    })
  }

  const handleDeleteZone = (zone: Zone) => {
    setDeleteConfirmZone(zone)
  }

  const confirmDeleteZone = () => {
    if (deleteConfirmZone) {
      setZones(zones.filter(zone => zone.id !== deleteConfirmZone.id))
      setDeleteConfirmZone(null)
      toast({
        title: "分区删除成功",
        description: `分区 "${deleteConfirmZone.name}" 已成功删除。`,
      })
    }
  }

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone.id)
    setEditedZone(zone)
  }

  const handleSaveEdit = () => {
    if (editedZone) {
      setZones(zones.map(zone => zone.id === editedZone.id ? editedZone : zone))
      setEditingZone(null)
      setEditedZone(null)
      toast({
        title: "分区更新成功",
        description: `分区 "${editedZone.name}" 已成功更新。`,
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingZone(null)
    setEditedZone(null)
  }

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
                      {editingZone === zone.id ? (
                        <Input
                          value={editedZone?.name}
                          onChange={(e) => setEditedZone({ ...editedZone!, name: e.target.value })}
                          className="w-full mr-2"
                        />
                      ) : (
                        <span>{zone.name}</span>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleEditZone(zone)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone)}>
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
                onChange={(e) => setNewZone({ name: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddZone}>添加</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmZone} onOpenChange={() => setDeleteConfirmZone(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p>您确定要删除分区 "{deleteConfirmZone?.name}" 吗？此操作不可撤销。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmZone(null)}>取消</Button>
            <Button variant="destructive" onClick={confirmDeleteZone}>确认删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


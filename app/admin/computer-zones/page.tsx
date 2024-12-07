'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Save, X } from 'lucide-react'

type Zone = {
  id: string
  name: string
  capacity: number
  pricePerHour: number
}

const initialZones: Zone[] = [
  { id: '1', name: '一楼-A区', capacity: 20, pricePerHour: 5 },
  { id: '2', name: '一楼-B区', capacity: 15, pricePerHour: 6 },
  { id: '3', name: '二楼-C区', capacity: 25, pricePerHour: 7 },
]

export default function ComputerZonesPage() {
  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [newZone, setNewZone] = useState<Omit<Zone, 'id'>>({ name: '', capacity: 0, pricePerHour: 0 })
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [editedZone, setEditedZone] = useState<Zone | null>(null)

  const handleAddZone = () => {
    const id = (zones.length + 1).toString()
    setZones([...zones, { ...newZone, id }])
    setNewZone({ name: '', capacity: 0, pricePerHour: 0 })
  }

  const handleDeleteZone = (id: string) => {
    setZones(zones.filter(zone => zone.id !== id))
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
          <CardTitle>区域列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>区域名称</TableHead>
                <TableHead>容量</TableHead>
                <TableHead>每小时价格</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell>
                    {editingZone === zone.id ? (
                      <Input
                        value={editedZone?.name}
                        onChange={(e) => setEditedZone({ ...editedZone!, name: e.target.value })}
                      />
                    ) : (
                      zone.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingZone === zone.id ? (
                      <Input
                        type="number"
                        value={editedZone?.capacity}
                        onChange={(e) => setEditedZone({ ...editedZone!, capacity: parseInt(e.target.value) })}
                      />
                    ) : (
                      zone.capacity
                    )}
                  </TableCell>
                  <TableCell>
                    {editingZone === zone.id ? (
                      <Input
                        type="number"
                        value={editedZone?.pricePerHour}
                        onChange={(e) => setEditedZone({ ...editedZone!, pricePerHour: parseFloat(e.target.value) })}
                      />
                    ) : (
                      `¥${zone.pricePerHour}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingZone === zone.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEditZone(zone)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(zone.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">添加新区域</Button>
        </DialogTrigger>
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
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                容量
              </Label>
              <Input
                id="capacity"
                type="number"
                value={newZone.capacity}
                onChange={(e) => setNewZone({ ...newZone, capacity: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                每小时价格
              </Label>
              <Input
                id="price"
                type="number"
                value={newZone.pricePerHour}
                onChange={(e) => setNewZone({ ...newZone, pricePerHour: parseFloat(e.target.value) })}
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleAddZone}>添加</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}


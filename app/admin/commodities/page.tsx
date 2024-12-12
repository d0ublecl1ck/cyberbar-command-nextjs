'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { Loader2, Plus, Pencil, Trash2, X } from 'lucide-react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type Commodity = {
  id: number
  name: string
  price: number
  unit: string
  stock: number
}

export default function CommoditiesPage() {
  const [commodities, setCommodities] = useState<Commodity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommodity, setEditingCommodity] = useState<Commodity | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    unit: '',
    stock: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCommodities, setFilteredCommodities] = useState<Commodity[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingCommodity, setDeletingCommodity] = useState<Commodity | null>(null)

  // 获取所有商品
  const fetchCommodities = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}${API_ENDPOINTS.COMMODITIES}`)
      if (!response.ok) throw new Error('获取商品列表失败')
      const data = await response.json()
      setCommodities(data)
      setFilteredCommodities(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "获取商品列表失败"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCommodities()
  }, [])

  useEffect(() => {
    const filtered = commodities.filter(commodity => 
      commodity.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )
    setFilteredCommodities(filtered)
  }, [commodities, searchTerm])

  // 打开新增/编辑对话框
  const handleOpenDialog = (commodity?: Commodity) => {
    if (commodity) {
      setEditingCommodity(commodity)
      setFormData({
        name: commodity.name,
        price: commodity.price.toString(),
        unit: commodity.unit,
        stock: commodity.stock.toString()
      })
    } else {
      setEditingCommodity(null)
      setFormData({
        name: '',
        price: '',
        unit: '',
        stock: ''
      })
    }
    setIsDialogOpen(true)
  }

  // 保存商品
  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "商品名称不能为空"
        })
        return
      }

      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "请输入有效的价格"
        })
        return
      }

      if (!formData.unit.trim()) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "单位不能为空"
        })
        return
      }

      if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
        toast({
          variant: "destructive",
          title: "错误",
          description: "请输入有效的库存数量"
        })
        return
      }

      const commodityData = {
        name: formData.name,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock),
        ...(editingCommodity && { id: editingCommodity.id })
      }

      const response = await fetch(
        `${API_URL}${API_ENDPOINTS.COMMODITIES}${editingCommodity ? `/${editingCommodity.id}` : ''}`,
        {
          method: editingCommodity ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commodityData)
        }
      )

      if (!response.ok) throw new Error(editingCommodity ? '更新商品失败' : '创建商品失败')

      toast({
        title: "成功",
        description: editingCommodity ? "商品已更新" : "商品已创建"
      })

      setIsDialogOpen(false)
      fetchCommodities()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "操作失败"
      })
    }
  }

  // 修改删除商品的处理函数
  const handleDelete = async (commodity: Commodity) => {
    setDeletingCommodity(commodity)
    setDeleteDialogOpen(true)
  }

  // 确认删除的处理函数
  const confirmDelete = async () => {
    if (!deletingCommodity) return

    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.COMMODITIES}/${deletingCommodity.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('删除商品失败')

      toast({
        title: "成功",
        description: "商品已删除"
      })

      fetchCommodities()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "错误",
        description: error instanceof Error ? error.message : "删除商品失败"
      })
    } finally {
      setDeleteDialogOpen(false)
      setDeletingCommodity(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle>商品管理</CardTitle>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                添加商品
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="搜索商品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm('')}
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>商品名称</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead>库存</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommodities.map((commodity) => (
                  <TableRow key={commodity.id}>
                    <TableCell>{commodity.id}</TableCell>
                    <TableCell>{commodity.name}</TableCell>
                    <TableCell>¥{commodity.price.toFixed(2)}</TableCell>
                    <TableCell>{commodity.unit}</TableCell>
                    <TableCell>{commodity.stock}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDialog(commodity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(commodity)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-sm text-gray-500">
        {searchTerm ? (
          <p>找到 {filteredCommodities.length} 个商品</p>
        ) : (
          <p>共 {commodities.length} 个商品</p>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCommodity ? '编辑商品' : '添加商品'}</DialogTitle>
            <DialogDescription>
              请填写商品信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">商品名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">价格</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">单位</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="col-span-3"
                placeholder="如：个、瓶、包"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">库存数量</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="col-span-3"
                placeholder="请输入库存数量"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除商品 "{deletingCommodity?.name}" 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 
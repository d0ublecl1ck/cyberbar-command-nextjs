'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

type MachineStats = {
  totalMachines: number
  occupiedMachines: number
  idleMachines: number
  abnormalMachines: number
}

export function ErrorComputerCount() {
  const [stats, setStats] = useState<MachineStats>({
    totalMachines: 0,
    occupiedMachines: 0,
    idleMachines: 0,
    abnormalMachines: 0
  })

  const fetchMachineStats = async () => {
    try {
      const response = await fetch(`${API_URL}${API_ENDPOINTS.MACHINES}/stats`)
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

  useEffect(() => {
    fetchMachineStats()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>故障电脑数量</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{stats.abnormalMachines}</p>
      </CardContent>
    </Card>
  )
}


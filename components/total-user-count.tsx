'use client'

import { useState, useEffect } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

type UserStats = {
  totalUsers: number
  onlineUsers: number
  bannedUsers: number
}

export function TotalUserCount() {
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    onlineUsers: 0,
    bannedUsers: 0
  })

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

  useEffect(() => {
    fetchUserStats()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>总用户数</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold">{stats.totalUsers}</p>
      </CardContent>
    </Card>
  )
} 
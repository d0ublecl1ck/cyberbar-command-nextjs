'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'

export default function UserDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOnline, setIsOnline] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isOnline) {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isOnline])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleStartSession = () => {
    setIsOnline(true)
  }

  const handleEndSession = () => {
    setIsOnline(false)
    setTimeElapsed(0)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">用户仪表板</CardTitle>
            <Button variant="outline" onClick={handleLogout}>登出</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold">欢迎, {user.name}</h3>
              <p>账户余额: ¥{user.balance.toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">当前状态</h3>
              <p>{isOnline ? '在线' : '离线'}</p>
              {isOnline && <p>已上网时间: {formatTime(timeElapsed)}</p>}
            </div>
          </div>
          <div className="flex justify-center space-x-4">
            {!isOnline ? (
              <Button onClick={handleStartSession}>上机</Button>
            ) : (
              <Button onClick={handleEndSession} variant="destructive">下机</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


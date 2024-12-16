'use client'

import { useEffect, useState } from 'react'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Message {
  id: number
  content: string
  time: string
  userId: number | null
  machineId: number
  status: string
}

export function Messages() {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}${API_ENDPOINTS.PENDING_MESSAGES}`)
        if (!response.ok) throw new Error('获取消息失败')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('获取消息失败:', error)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>待办消息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {message.userId ? "用户消息" : "系统提示"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.time).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1">{message.content}</p>
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-center text-muted-foreground">暂无待办消息</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 
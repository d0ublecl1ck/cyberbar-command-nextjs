'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function ErrorComputerCount() {
  const [errorCount, setErrorCount] = useState(0)

  useEffect(() => {
    // In a real application, you would fetch this data from your API
    // This is just a mock implementation
    const fetchErrorCount = async () => {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setErrorCount(Math.floor(Math.random() * 5)) // Random number between 0 and 4
    }

    fetchErrorCount()
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">故障电脑数量</CardTitle>
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{errorCount}</div>
      </CardContent>
    </Card>
  )
}


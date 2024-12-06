'use client'

import { useState, useEffect } from 'react'

export function DynamicClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  return (
    <div className="text-center">
      <div className="text-6xl font-bold mb-2">{formatTime(time)}</div>
      <div className="text-xl">
        {time.toLocaleDateString('zh-CN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long'
        })}
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'

export function DynamicClock() {
  // 组件挂载状态
  const [mounted, setMounted] = useState(false)
  // 当前时间状态
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    // 创建定时器每秒更新时间
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    // 清理定时器
    return () => {
      clearInterval(timer)
    }
  }, [])

  // 组件未挂载时不渲染
  if (!mounted) {
    return null
  }

  // 格式化时间显示
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


import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || '登录失败' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data, {
      status: 200,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
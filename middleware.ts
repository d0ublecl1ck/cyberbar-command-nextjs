import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 记录请求路径和cookie信息用于调试
  console.log('Middleware running for path:', request.nextUrl.pathname)
  console.log('Cookies:', request.cookies.toString())
  
  // 检查是否访问管理员页面且不是登录页
  if (request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    const token = request.cookies.get('adminToken')?.value
    console.log('Admin token:', token)

    // 如果没有管理员token，重定向到登录页
    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      // 添加 from 参数以便登录后跳回原页面
      loginUrl.searchParams.set('from', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  return NextResponse.next()
}

// 配置中间件只匹配admin路径
export const config = {
  matcher: '/admin/:path*'
} 
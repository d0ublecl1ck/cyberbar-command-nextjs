'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Monitor, CreditCard, LogOut, Layout, FileText, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TopNav() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/admin', icon: Home, label: '首页' },
    { href: '/admin/user_list', icon: Users, label: '用户管理' },
    { href: '/admin/computer/online', icon: Monitor, label: '机器管理' },
    { href: '/admin/computer-zones', icon: Layout, label: '区域管理' },
    { href: '/admin/recharge', icon: CreditCard, label: '用户充值' },
    { href: '/admin/commodities', icon: ShoppingBag, label: '商品管理' },
    { href: '/admin/logs', icon: FileText, label: '日志' },
  ]

  const handleLogout = () => {
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/admin/login')
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">网吧管理系统</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    pathname === item.href
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              登出
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}


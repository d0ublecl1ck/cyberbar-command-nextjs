import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from "@/components/ui/toaster"
import { AdminAuthProvider } from '@/contexts/admin-auth-context'
import { OrderNotificationProvider } from '@/contexts/order-notification-context'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AuthProvider>
          <AdminAuthProvider>
            <OrderNotificationProvider>
              {children}
            </OrderNotificationProvider>
          </AdminAuthProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}


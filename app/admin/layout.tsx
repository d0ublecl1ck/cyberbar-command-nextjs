import { TopNav } from '@/components/top-nav'
import { AuthInterceptor } from '@/components/auth-interceptor'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthInterceptor>
      <div className="min-h-screen bg-gray-100">
        <TopNav />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AuthInterceptor>
  )
}


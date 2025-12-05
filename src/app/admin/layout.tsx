'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TenantProvider } from '@/lib/contexts/tenant-provider'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          // Redirect to main login page
          router.replace('/login')
          return
        }
        
        setIsAuthenticated(true)
      } catch (error) {
        router.replace('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.replace('/login')
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render admin content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <TenantProvider>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="lg:pl-64">
          {/* Header */}
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TenantProvider>
  )
}
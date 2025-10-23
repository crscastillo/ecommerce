'use client'

import { ReactNode } from 'react'
import { TenantProvider } from '@/lib/contexts/tenant-provider'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <TenantProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Sidebar */}
        <AdminSidebar />
        
        <div className="lg:pl-64">
          {/* Header */}
          <AdminHeader />
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
'use client'

import { ReactNode, useState, useEffect } from 'react'
import { TenantProvider } from '@/lib/contexts/tenant-provider'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <TenantProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Simple sidebar placeholder */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block hidden">
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <h2 className="text-lg font-semibold">Store Admin</h2>
          </div>
          <nav className="mt-4 px-4">
            <a href="/admin" className="block px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-md">
              Dashboard
            </a>
            <a href="/admin/products" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 mt-1">
              Products
            </a>
            <a href="/admin/orders" className="block px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 mt-1">
              Orders
            </a>
          </nav>
        </div>
        
        <div className="lg:pl-64">
          {/* Simple header placeholder */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-500 hover:text-gray-700">
                    Settings
                  </button>
                  <button className="text-gray-500 hover:text-gray-700">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>
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
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  FileText,
  Menu,
  X,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: Tag },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Pages', href: '/admin/pages', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { tenant, isLoading } = useTenant()

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-semibold text-gray-900">
                  {tenant?.name || 'Demo Store'}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Subscription info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs">
                {tenant?.subscription_tier || 'Basic'} Plan
              </Badge>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {tenant?.subdomain}.yourdomain.com
            </p>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-40 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>
    </>
  )
}
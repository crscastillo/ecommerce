'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { platformConfig } from '@/lib/config/platform'
import { FeatureFlagsService } from '@/lib/services/feature-flags'
import {
  Store,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  FileText,
  X,
  Home,
  CreditCard,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Navigation items with translation keys
const navigationItems = [
  { key: 'dashboard', href: '/admin', icon: Home },
  { key: 'categories', href: '/admin/categories', icon: Tag },
  { key: 'brands', href: '/admin/brands', icon: BadgeCheck },
  { key: 'products', href: '/admin/products', icon: Package },
  { key: 'orders', href: '/admin/orders', icon: ShoppingCart },
  { key: 'customers', href: '/admin/customers', icon: Users },
  { key: 'analytics', href: '/admin/analytics', icon: BarChart3 },
  { key: 'pages', href: '/admin/pages', icon: FileText },
  { key: 'settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { tenant, isLoading } = useTenant()
  const t = useTranslations('navigation')
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [pagesEnabled, setPagesEnabled] = useState(false)

  // Check if features are enabled
  useEffect(() => {
    const checkFeatures = async () => {
      if (tenant?.id) {
        const featureFlags = await FeatureFlagsService.getFeatureFlags(tenant.id)
        setAnalyticsEnabled(featureFlags.analytics || false)
        setPagesEnabled(featureFlags.pages || false)
      }
    }
    
    checkFeatures()
  }, [tenant?.id])

  if (isLoading) {
    return (
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg lg:block">
        <div className="flex h-16 items-center justify-center border-b border-border">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-600 dark:bg-gray-900 opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-border bg-muted">
            <div className="flex items-center">
              <Store className="h-6 w-6 text-primary" />
              <div className="ml-2">
                <p className="text-sm font-semibold text-foreground">
                  {tenant?.name || 'Demo Store'}
                </p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems
              .filter((item) => {
                // Filter out analytics if feature is disabled
                if (item.key === 'analytics' && !analyticsEnabled) {
                  return false
                }
                // Filter out pages if feature is disabled
                if (item.key === 'pages' && !pagesEnabled) {
                  return false
                }
                return true
              })
              .map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                    )}
                    onClick={onClose}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                      )}
                    />
                    {t(item.key)}
                  </Link>
                )
              })}
          </nav>

          {/* Theme Toggle */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-center">
              <ThemeToggle variant="dropdown" size="sm" showLabel />
            </div>
          </div>

          {/* Subscription info */}
          <div className="border-t border-border p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {tenant?.subscription_tier || (tenant?.settings as any)?.plan || 'Starter'} Plan
              </Badge>
              <Link 
                href="/admin/settings?tab=billing"
                className="text-xs text-primary hover:text-primary/80"
                onClick={onClose}
              >
                Upgrade
              </Link>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {tenant?.subdomain}.{platformConfig.getDomain()}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
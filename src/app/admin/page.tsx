'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { platformConfig } from '@/lib/config/platform'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalRevenue: number
  productsCount: number
  ordersCount: number
  customersCount: number
  revenueGrowth: number
}

export default function AdminDashboard() {
  const t = useTranslations()
  const { tenant } = useTenant()
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    productsCount: 0,
    ordersCount: 0,
    customersCount: 0,
    revenueGrowth: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadDashboardStats()
    }
  }, [tenant?.id])

  const loadDashboardStats = async () => {
    if (!tenant?.id) return

    try {
      setIsLoading(true)

      // Fetch all stats in parallel
      const [ordersResult, productsResult, customersResult] = await Promise.all([
        // Orders and revenue
        supabase
          .from('orders')
          .select('total_price, financial_status')
          .eq('tenant_id', tenant.id),
        
        // Products count
        supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenant.id)
          .eq('is_active', true),
        
        // Customers count
        supabase
          .from('customers')
          .select('id', { count: 'exact' })
          .eq('tenant_id', tenant.id)
      ])

      // Calculate revenue from paid orders
      const totalRevenue = ordersResult.data
        ?.filter(order => order.financial_status === 'paid')
        .reduce((sum, order) => sum + (order.total_price || 0), 0) || 0

      setStats({
        totalRevenue,
        productsCount: productsResult.count || 0,
        ordersCount: ordersResult.data?.length || 0,
        customersCount: customersResult.count || 0,
        revenueGrowth: 0 // TODO: Calculate month-over-month growth
      })

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeBack', { storeName: tenant?.name })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('products.addProduct')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Store Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.storeStatus')}</span>
            <Badge variant={tenant?.is_active ? "default" : "secondary"}>
              {tenant?.is_active ? t('dashboard.live') : t('dashboard.inactive')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.storeUrl')}</p>
              <p className="font-medium">
                {tenant?.subdomain}.{platformConfig.getDomain()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('dashboard.subscription')}</p>
              <p className="font-medium capitalize">
                {tenant?.subscription_tier} {t('dashboard.plan')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.revenueGrowth >= 0 ? '+' : ''}{stats.revenueGrowth.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('navigation.products')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productsCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.productsCount === 0 ? t('dashboard.startAddingProducts') : 'Active products'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('navigation.orders')}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersCount === 0 ? t('dashboard.noOrdersYet') : 'Total orders'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('navigation.customers')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customersCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.customersCount === 0 ? t('dashboard.noCustomersYet') : 'Total customers'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.quickSetup')}</CardTitle>
            <CardDescription>
              {t('dashboard.quickSetupDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/products">
                  <Package className="mr-2 h-4 w-4" />
                  {t('dashboard.addFirstProduct')}
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link href="/admin/settings">
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  {t('dashboard.configureStoreSettings')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.recentActivity')}</CardTitle>
            <CardDescription>
              {t('dashboard.recentActivityDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('dashboard.noRecentActivity')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('dashboard.performance')}</CardTitle>
            <CardDescription>
              {t('dashboard.performanceDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm">{t('dashboard.storeReadyForLaunch')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.completeSetupToStartSelling')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
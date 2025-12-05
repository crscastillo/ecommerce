'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { FeatureFlagsService } from '@/lib/services/feature-flags'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Calendar,
  Download,
  Lock
} from 'lucide-react'

export default function AnalyticsPage() {
  const t = useTranslations('analytics')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { tenant } = useTenant()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (!tenant?.id) {
        setIsLoading(false)
        return
      }

      try {
        const featureFlags = await FeatureFlagsService.getFeatureFlags(tenant.id)
        const analyticsEnabled = featureFlags.analytics || false
        
        if (!analyticsEnabled) {
          // Redirect to dashboard if no access
          router.replace('/admin')
          return
        }
        
        setHasAccess(true)
      } catch (error) {
        // Redirect to dashboard on error
        router.replace('/admin')
      } finally {
        setIsLoading(false)
      }
    }

    checkFeatureAccess()
  }, [tenant, router])

  // Show loading while checking access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render content if no access (will redirect)
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Lock className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Analytics dashboard is not available for your current plan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-3 md:hidden">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-foreground" />
            <h1 className="text-xl font-bold">{t('title')}</h1>
          </div>
          <div className="flex justify-start">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {t('comingSoon')}
            </Badge>
          </div>
        </div>
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-foreground" />
            <h1 className="text-3xl font-bold">{t('title')}</h1>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {t('comingSoon')}
          </Badge>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>{t('advancedAnalytics')}</span>
          </CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{t('revenue')}</p>
                <p className="text-xs text-gray-500">{t('trackSales')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('customers')}</p>
                <p className="text-xs text-muted-foreground">{t('userBehavior')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('orders')}</p>
                <p className="text-xs text-muted-foreground">{t('conversionRates')}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">{t('traffic')}</p>
                <p className="text-xs text-muted-foreground">{t('pageViews')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Placeholder Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{t('salesOverview')}</span>
            </CardTitle>
            <CardDescription>{t('salesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">{t('chartPlaceholder')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>{t('topProducts')}</span>
            </CardTitle>
            <CardDescription>{t('productsDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Download className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">{t('reportPlaceholder')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
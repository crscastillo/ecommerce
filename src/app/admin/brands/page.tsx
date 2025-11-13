'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Package,
  AlertCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'

// Import our components and hooks
import { BrandList } from '@/components/admin/brands/brand-list'
import { BrandFiltersComponent } from '@/components/admin/brands/brand-filters'
import { useBrands, useBrandActions } from '@/lib/hooks/use-brands'
import { BrandFilters } from '@/lib/types/brand'
import { useToast } from '@/lib/contexts/toast-context'

export default function BrandsPage() {
  const { tenant, isLoading: tenantLoading } = useTenant()
  const { success, error: showError } = useToast()
  const t = useTranslations()
  
  // State for filters
  const [filters, setFilters] = useState<BrandFilters>({
    status: 'all',
    search: ''
  })

  // Custom hooks for data and actions
  const { brands, loading, error, refetch } = useBrands(filters)
  const { 
    deleteBrand,
    loading: actionLoading,
    error: actionError
  } = useBrandActions(refetch)

  // Event handlers
  const handleDelete = async (brandId: string) => {
    try {
      const brand = brands.find(b => b.id === brandId)
      await deleteBrand(brandId)
      success(t('brands.deletedSuccessfully', { name: brand?.name || '' }))
    } catch (err: any) {
      showError(err.message || t('brands.failedToDelete'))
    }
  }

  // Show loading state while tenant is loading
  if (tenantLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('navigation.brands')}</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show tenant access required message if no tenant after loading
  if (!tenantLoading && !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('navigation.brands')}</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('errors.tenantAccessRequired')}</h3>
            <p className="text-gray-600 mb-4">
              {t('brands.managementRequiresAccess')}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              {t('common.goToMainSite')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render until we have a tenant
  if (!tenant) {
    return null
  }

  // Check if filters are active
  const hasFilters = Boolean(filters.search || filters.status !== 'all')

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile Compact Header */}
        <div className="flex flex-col space-y-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-600" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">{t('navigation.brands')}</h1>
                {brands.length > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {t('brands.brandCount', { count: brands.length })}
                  </p>
                )}
              </div>
            </div>
            <Button asChild size="sm" className="h-8 px-3">
              <Link href="/admin/brands/new">
                <Plus className="mr-1 h-3 w-3" />
                {t('common.add')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-gray-600" />
            <h1 className="text-3xl font-bold">{t('navigation.brands')}</h1>
          </div>
          <Button asChild>
            <Link href="/admin/brands/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('brands.addBrand')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error || actionError}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <BrandFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={brands.length}
      />

      {/* Brands List */}
      <div className="md:hidden">
        {/* Mobile: Direct brand list without card wrapper */}
        <BrandList
          brands={brands}
          loading={loading}
          hasFilters={hasFilters}
          onDelete={handleDelete}
        />
      </div>

      {/* Desktop: Full card layout */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('brands.brandsWithCount', { count: brands.length })}
          </CardTitle>
          <CardDescription>
            {t('brands.manageBrandPortfolio')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandList
            brands={brands}
            loading={loading}
            hasFilters={hasFilters}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  )
}
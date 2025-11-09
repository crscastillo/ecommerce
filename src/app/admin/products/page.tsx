'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Plus, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Import our new components and hooks
import { ProductFiltersComponent } from '@/components/admin/products/product-filters'
import { ProductList } from '@/components/admin/products/product-list'
import { CSVImportModal } from '@/components/admin/csv-import-modal'
import { useProducts, useProductActions, useTenantSettings } from '@/lib/hooks/use-products'
import { 
  ProductFilters, 
  defaultProductFilters,
  ProductWithVariants
} from '@/lib/types/product'

export default function ProductsPage() {
  const { tenant } = useTenant()
  const router = useRouter()
  const t = useTranslations()
  
  // State for filters and modals
  const [filters, setFilters] = useState<ProductFilters>(defaultProductFilters)
  const [showImportModal, setShowImportModal] = useState(false)

  // Custom hooks for data and actions
  const { products, loading, error, refetch } = useProducts(filters)
  const { settings } = useTenantSettings()
  const { 
    deleteProduct, 
    toggleProductStatus,
    loading: actionLoading,
    error: actionError
  } = useProductActions(refetch)

  // Event handlers
  const handleEdit = (productId: string) => {
    router.push(`/admin/products/${productId}?mode=edit`)
  }

  const handleDelete = async (product: ProductWithVariants) => {
    try {
      await deleteProduct(product.id)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: boolean) => {
    try {
      await toggleProductStatus(productId, currentStatus)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  const handleImportComplete = () => {
    refetch()
  }

  // Check if filters are active
  const hasFilters = Boolean(filters.search || filters.status !== 'all' || filters.productType !== 'all')

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile Compact Header */}
        <div className="flex flex-col space-y-3 md:hidden">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">{t('navigation.products')}</h1>
              {products.length > 0 && (
                <p className="text-muted-foreground text-xs">
                  {t('products.productCount', { count: products.length })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowImportModal(true)} 
                className="h-8 px-2"
              >
                <Upload className="h-3 w-3" />
              </Button>
              <Button asChild size="sm" className="h-8 px-3">
                <Link href="/admin/products/new">
                  <Plus className="mr-1 h-3 w-3" />
                  {t('common.add')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.products')}</h1>
            <p className="text-muted-foreground">
              {t('products.manageProductCatalog')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              {t('products.importCsv')}
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                {t('products.addProduct')}
              </Link>
            </Button>
          </div>
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
      <ProductFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={products.length}
      />

      {/* Products List */}
      <div className="md:hidden">
        {/* Mobile: Direct product list without card wrapper */}
        <ProductList
          products={products}
          settings={settings}
          tenant={tenant}
          loading={loading}
          hasFilters={hasFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Desktop: Full card layout */}
      <Card className="hidden md:block">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            {t('products.productsWithCount', { count: products.length })}
          </CardTitle>
          <CardDescription className="text-sm">
            {t('products.productsListDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ProductList
            products={products}
            settings={settings}
            tenant={tenant}
            loading={loading}
            hasFilters={hasFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      {/* CSV Import Modal */}
      <CSVImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
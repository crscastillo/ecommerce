'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
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
  defaultProductFilters 
} from '@/lib/types/product'

export default function ProductsPage() {
  const { tenant } = useTenant()
  const router = useRouter()
  
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

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId)
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4 md:space-y-0">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-4 md:hidden">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground text-sm">
              Manage your store's product catalog
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)} className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Import CSV</span>
              <span className="sm:hidden">Import</span>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage your store's product catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {(error || actionError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error || actionError}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <ProductFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={products.length}
      />

      {/* Products List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Package className="h-5 w-5" />
            <span className="hidden sm:inline">Products ({products.length})</span>
            <span className="sm:hidden">Products ({products.length})</span>
          </CardTitle>
          <CardDescription className="text-sm">
            <span className="hidden sm:inline">A list of all products in your store</span>
            <span className="sm:hidden">All store products</span>
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
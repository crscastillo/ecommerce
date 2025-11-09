'use client'

import { Button } from '@/components/ui/button'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'
import { ProductWithVariants, TenantSettings } from '@/lib/types/product'
import { ProductMobileCard } from './product-mobile-card'
import { ProductTable } from './product-table'

interface ProductListProps {
  products: ProductWithVariants[]
  settings: TenantSettings
  tenant: any
  loading: boolean
  hasFilters: boolean
  onEdit: (productId: string) => void
  onDelete: (product: ProductWithVariants) => Promise<void>
  onToggleStatus: (productId: string, currentStatus: boolean) => void
}

export function ProductList({ 
  products, 
  settings, 
  tenant, 
  loading, 
  hasFilters,
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ProductListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 md:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-2 md:mb-3"></div>
          <p className="text-xs md:text-sm text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-6 md:py-8 px-4">
        <Package className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4 text-xs md:text-sm max-w-md mx-auto">
          {hasFilters 
            ? 'No products match your current filters. Try adjusting your search criteria.' 
            : 'Get started by adding your first product to your store.'
          }
        </p>
        <Button asChild size="sm" className="h-8 md:h-auto">
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <ProductMobileCard
        products={products}
        settings={settings}
        tenant={tenant}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
      <ProductTable
        products={products}
        settings={settings}
        tenant={tenant}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    </>
  )
}
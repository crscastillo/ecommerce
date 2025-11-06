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
  onDelete: (productId: string) => void
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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4">
          {hasFilters 
            ? 'No products match your current filters.' 
            : 'Get started by adding your first product.'
          }
        </p>
        <Button asChild>
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
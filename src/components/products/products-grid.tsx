'use client'

import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product-card'
import { Package } from 'lucide-react'

type ViewMode = 'grid' | 'list'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  [key: string]: any
}

interface ProductsGridProps {
  products: Product[]
  loading: boolean
  viewMode: ViewMode
  tenantSettings: any
  searchQuery: string
  hasFilters: boolean
  onClearFilters: () => void
  t: any
}

export function ProductsGrid({
  products,
  loading,
  viewMode,
  tenantSettings,
  searchQuery,
  hasFilters,
  onClearFilters,
  t
}: ProductsGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('products.noProductsFound')}</h3>
        <p className="text-muted-foreground mb-4">
          {hasFilters
            ? t('products.noProductsMatchFilters')
            : t('products.storeNoProductsYet')
          }
        </p>
        {hasFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            {t('products.clearFilters')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
          : 'space-y-4'
        }
      `}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            tenantSettings={tenantSettings}
          />
        ))}
      </div>

      {/* Results count */}
      <div className="mt-8 text-center text-sm text-gray-600">
        {t('products.showingResults', { count: products.length })}
      </div>
    </>
  )
}

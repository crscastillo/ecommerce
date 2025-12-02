'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCurrencySymbol } from '@/lib/utils/currency'
import { Tenant } from '@/lib/contexts/tenant-context'

interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface ActiveFiltersProps {
  selectedCategories: string[]
  categories: Category[]
  onRemoveCategory: (categorySlug: string) => void
  selectedBrands: string[]
  brands: Brand[]
  onRemoveBrand: (brandSlug: string) => void
  searchQuery: string
  onRemoveSearch: () => void
  priceRange?: { min: number; max: number }
  onRemovePriceRange?: () => void
  onClearAll: () => void
  tenant?: Tenant | null
  t: any
}

export function ActiveFilters({
  selectedCategories,
  categories,
  onRemoveCategory,
  selectedBrands,
  brands,
  onRemoveBrand,
  searchQuery,
  onRemoveSearch,
  priceRange,
  onRemovePriceRange,
  onClearAll,
  tenant,
  t
}: ActiveFiltersProps) {
  // Get currency symbol from tenant
  const currencySymbol = getCurrencySymbol(tenant)
  const hasActivePriceRange = priceRange && (priceRange.min > 0 || priceRange.max < 1000)
  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery || hasActivePriceRange

  if (!hasFilters) return null

  return (
    <div className="mt-4 flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">{t('products.activeFilters')}:</span>
      
      {selectedCategories.map(categorySlug => {
        const category = categories.find(c => c.slug === categorySlug)
        return category ? (
          <Badge key={categorySlug} variant="secondary" className="gap-1">
            {t('products.category')}: {category.name}
            <button
              onClick={() => onRemoveCategory(categorySlug)}
              className="ml-1 hover:text-red-600"
            >
              ×
            </button>
          </Badge>
        ) : null
      })}
      
      {selectedBrands.map(brandSlug => {
        const brand = brands.find(b => b.slug === brandSlug)
        return brand ? (
          <Badge key={brandSlug} variant="secondary" className="gap-1">
            {t('products.brand')}: {brand.name}
            <button
              onClick={() => onRemoveBrand(brandSlug)}
              className="ml-1 hover:text-red-600"
            >
              ×
            </button>
          </Badge>
        ) : null
      })}
      
      {searchQuery && (
        <Badge variant="secondary" className="gap-1">
          {t('products.search')}: "{searchQuery}"
          <button
            onClick={onRemoveSearch}
            className="ml-1 hover:text-red-600"
          >
            ×
          </button>
        </Badge>
      )}
      
      {hasActivePriceRange && onRemovePriceRange && (
        <Badge variant="secondary" className="gap-1">
          {t('products.priceRange') || 'Price'}: {currencySymbol}{priceRange?.min || 0} - {currencySymbol}{priceRange?.max || 1000}
          <button
            onClick={onRemovePriceRange}
            className="ml-1 hover:text-red-600"
          >
            ×
          </button>
        </Badge>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-xs lg:hidden"
      >
        {t('products.clearAll')}
      </Button>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface ActiveFiltersProps {
  selectedCategories: string[]
  categories: Category[]
  onRemoveCategory: (categoryId: string) => void
  selectedBrands: string[]
  brands: Brand[]
  onRemoveBrand: (brandId: string) => void
  searchQuery: string
  onRemoveSearch: () => void
  onClearAll: () => void
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
  onClearAll,
  t
}: ActiveFiltersProps) {
  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery

  if (!hasFilters) return null

  return (
    <div className="mt-4 flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-600">{t('products.activeFilters')}:</span>
      
      {selectedCategories.map(categoryId => {
        const category = categories.find(c => c.id === categoryId)
        return category ? (
          <Badge key={categoryId} variant="secondary" className="gap-1">
            {t('products.category')}: {category.name}
            <button
              onClick={() => onRemoveCategory(categoryId)}
              className="ml-1 hover:text-red-600"
            >
              ×
            </button>
          </Badge>
        ) : null
      })}
      
      {selectedBrands.map(brandId => {
        const brand = brands.find(b => b.id === brandId)
        return brand ? (
          <Badge key={brandId} variant="secondary" className="gap-1">
            {t('products.brand')}: {brand.name}
            <button
              onClick={() => onRemoveBrand(brandId)}
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

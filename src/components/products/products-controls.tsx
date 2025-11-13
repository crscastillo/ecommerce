'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, Grid3X3, List } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'name'

interface ProductsControlsProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  hasActiveFilters: boolean
  activeFiltersCount: number
  onShowMobileFilters: () => void
  t: any
}

export function ProductsControls({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  activeFiltersCount,
  onShowMobileFilters,
  t
}: ProductsControlsProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Mobile Filter Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onShowMobileFilters}
          className="lg:hidden flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {t('products.filters')}
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {/* Sort and View Controls */}
        <div className="flex gap-3 items-center">
          <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('products.sortBy')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
              <SelectItem value="price-low">{t('products.sortPriceLowHigh')}</SelectItem>
              <SelectItem value="price-high">{t('products.sortPriceHighLow')}</SelectItem>
              <SelectItem value="name">{t('products.sortNameAZ')}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

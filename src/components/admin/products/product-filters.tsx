'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
import { ProductFilters, productTypeOptions, statusOptions } from '@/lib/types/product'

interface ProductFiltersProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  totalCount: number
}

export function ProductFiltersComponent({ 
  filters, 
  onFiltersChange, 
  totalCount 
}: ProductFiltersProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleStatusChange = (status: 'all' | 'active' | 'inactive') => {
    onFiltersChange({ 
      ...filters, 
      status,
      is_active: status === 'all' ? undefined : status === 'active'
    })
  }

  const handleProductTypeChange = (productType: 'all' | 'single' | 'variable' | 'digital') => {
    onFiltersChange({ 
      ...filters, 
      productType,
      product_type: productType === 'all' ? undefined : productType as any
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      productType: 'all',
      search: ''
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.productType !== 'all'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Products
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount} products)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 items-center">
              <div className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">
                Status:
              </div>
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.status === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(option.value as any)}
                  className="min-w-16"
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Product Type Filter */}
            <div className="flex gap-2 items-center">
              <div className="text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">
                Type:
              </div>
              {productTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filters.productType === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleProductTypeChange(option.value as any)}
                  className="min-w-20"
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-4">
              <span>Active filters:</span>
              <div className="flex gap-2 flex-wrap">
                {filters.search && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.status !== 'all' && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Status: {filters.status}
                  </span>
                )}
                {filters.productType !== 'all' && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Type: {productTypeOptions.find(opt => opt.value === filters.productType)?.label}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-6 px-2 text-xs ml-auto"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
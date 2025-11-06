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
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-5 w-5" />
          <span className="hidden sm:inline">Filter Products</span>
          <span className="sm:hidden">Filters</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({totalCount})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Search */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
          </div>

          {/* Mobile Filter Buttons - Stacked Layout */}
          <div className="space-y-4 md:hidden">
            {/* Status Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.status === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(option.value as any)}
                    className="h-9 text-xs"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Type Filter */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Product Type
              </div>
              <div className="grid grid-cols-2 gap-2">
                {productTypeOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.productType === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleProductTypeChange(option.value as any)}
                    className="h-9 justify-start text-xs"
                  >
                    <span className="mr-1.5">{option.icon}</span>
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Filter Layout */}
          <div className="hidden md:flex md:flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2 items-center flex-wrap">
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
            <div className="flex gap-2 items-center flex-wrap">
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
            <div className="flex items-start gap-2 text-sm text-muted-foreground border-t pt-4">
              <span className="flex-shrink-0 mt-1">Active filters:</span>
              <div className="flex gap-2 flex-wrap flex-1">
                {filters.search && (
                  <span className="bg-muted px-2 py-1 rounded text-xs">
                    Search: "{filters.search.length > 15 ? filters.search.substring(0, 15) + '...' : filters.search}"
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
                className="h-7 px-2 text-xs flex-shrink-0"
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
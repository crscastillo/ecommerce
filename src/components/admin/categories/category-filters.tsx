'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import { CategoryFilters } from '@/lib/types/category'

interface CategoryFiltersProps {
  filters: CategoryFilters
  onFiltersChange: (filters: CategoryFilters) => void
  totalCount: number
}

export function CategoryFiltersComponent({ 
  filters, 
  onFiltersChange, 
  totalCount 
}: CategoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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

  const hasActiveFilters = filters.search || filters.status !== 'all'

  return (
    <Card>
      {/* Mobile Compact Header */}
      <div className="md:hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
              {totalCount > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalCount})
                </span>
              )}
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                  {[filters.search, filters.status !== 'all' && filters.status].filter(Boolean).length}
                </span>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Always Visible Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Collapsible Filters */}
          {isExpanded && (
            <div className="space-y-3">
              {/* Status Filter */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">Status</div>
                <div className="flex gap-1">
                  <Button
                    variant={filters.status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('all')}
                    className="h-7 text-xs flex-1"
                  >
                    All
                  </Button>
                  <Button
                    variant={filters.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    className="h-7 text-xs flex-1"
                  >
                    Active
                  </Button>
                  <Button
                    variant={filters.status === 'inactive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange('inactive')}
                    className="h-7 text-xs flex-1"
                  >
                    Inactive
                  </Button>
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFiltersChange({ status: 'all', search: '' })}
                  className="h-7 text-xs w-full"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {totalCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({totalCount} categories)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Status Filter Buttons */}
            <div className="flex gap-2">
              <Button
                variant={filters.status === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('all')}
                className="min-w-16"
              >
                All
              </Button>
              <Button
                variant={filters.status === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('active')}
                className="min-w-16"
              >
                Active
              </Button>
              <Button
                variant={filters.status === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('inactive')}
                className="min-w-16"
              >
                Inactive
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Active filters:</span>
              <div className="flex gap-2">
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
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onFiltersChange({ status: 'all', search: '' })}
                className="h-6 px-2 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}
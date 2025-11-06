'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter } from 'lucide-react'
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

  return (
    <Card>
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
        {(filters.search || filters.status !== 'all') && (
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
    </Card>
  )
}
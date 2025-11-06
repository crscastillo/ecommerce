'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  FolderOpen,
  AlertCircle,
  Plus,
  Package
} from 'lucide-react'
import Link from 'next/link'

// Import our new components and hooks
import { CategoryTable } from '@/components/admin/categories/category-table'
import { CategoryFiltersComponent } from '@/components/admin/categories/category-filters'
import { useCategories, useCategoryActions } from '@/lib/hooks/use-categories'
import { 
  Category, 
  CategoryFilters 
} from '@/lib/types/category'

export default function CategoriesPage() {
  const { tenant } = useTenant()
  
  // State for filters
  const [filters, setFilters] = useState<CategoryFilters>({
    status: 'all',
    search: ''
  })

  // Custom hooks for data and actions
  const { categories, loading, error, refetch } = useCategories(filters)
  const { 
    deleteCategory, 
    toggleCategoryStatus,
    loading: actionLoading,
    error: actionError
  } = useCategoryActions(refetch)

  // Event handlers
  const handleDelete = async (category: Category) => {
    await deleteCategory(category.id)
  }

  const handleToggleStatus = async (categoryId: string, currentStatus: boolean) => {
    await toggleCategoryStatus(categoryId, currentStatus)
  }

  // Show tenant access required message if no tenant
  if (!tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Access Required</h3>
            <p className="text-gray-600 mb-4">
              Categories management requires access via your store subdomain.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FolderOpen className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold">Categories</h1>
        </div>
                <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Error Messages */}
      {(error || actionError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error || actionError}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <CategoryFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={categories.length}
      />

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Categories ({categories.length})
          </CardTitle>
          <CardDescription>
            Manage your store categories and organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryTable
            categories={categories}
            loading={loading}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>
    </div>
  )
}
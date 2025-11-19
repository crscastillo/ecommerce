'use client'

import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
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
import { CategoryList } from '@/components/admin/categories/category-list'
import { CategoryFiltersComponent } from '@/components/admin/categories/category-filters'
import { useCategories, useCategoryActions } from '@/lib/hooks/use-categories'
import { 
  Category, 
  CategoryFilters 
} from '@/lib/types/category'

export default function CategoriesPage() {
  const { tenant } = useTenant()
  const t = useTranslations()
  
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

  // Check if filters are active
  const hasFilters = Boolean(filters.search || filters.status !== 'all')

  return (
    <div className="space-y-3 md:space-y-6">
      {/* Header */}
      <div className="space-y-3 md:space-y-0">
        {/* Mobile Compact Header */}
        <div className="flex flex-col space-y-3 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-gray-600" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">{t('navigation.categories')}</h1>
                {categories.length > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {t('categories.categoryCount', { count: categories.length })}
                  </p>
                )}
              </div>
            </div>
            <Button asChild size="sm" className="h-8 px-3">
              <Link href="/admin/categories/new">
                <Plus className="mr-1 h-3 w-3" />
                {t('common.add')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="h-8 w-8 text-gray-600" />
            <h1 className="text-3xl font-bold">{t('navigation.categories')}</h1>
          </div>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              {t('categories.addCategory')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error || actionError}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <CategoryFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        totalCount={categories.length}
      />

      {/* Categories List */}
      <div className="md:hidden">
        {/* Mobile: Direct category list without card wrapper */}
        <CategoryList
          categories={categories}
          loading={loading}
          hasFilters={hasFilters}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {/* Desktop: Full card layout */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {t('categories.categoriesWithCount', { count: categories.length })}
          </CardTitle>
          <CardDescription>
            {t('categories.manageStoreCategories')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories}
            loading={loading}
            hasFilters={hasFilters}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>
    </div>
  )
}
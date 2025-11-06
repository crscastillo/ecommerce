'use client'

import { Button } from '@/components/ui/button'
import { FolderOpen, Plus } from 'lucide-react'
import Link from 'next/link'
import { CategoryWithProductCount } from '@/lib/types/category'
import { CategoryMobileCard } from './category-mobile-card'
import { CategoryTable } from './category-table'

interface CategoryListProps {
  categories: CategoryWithProductCount[]
  loading: boolean
  hasFilters: boolean
  onDelete: (category: CategoryWithProductCount) => Promise<void>
  onToggleStatus: (categoryId: string, currentStatus: boolean) => Promise<void>
}

export function CategoryList({ 
  categories, 
  loading, 
  hasFilters,
  onDelete, 
  onToggleStatus 
}: CategoryListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 md:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-2 md:mb-3"></div>
          <p className="text-xs md:text-sm text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-6 md:py-8 px-4">
        <FolderOpen className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-2">No categories found</h3>
        <p className="text-muted-foreground mb-4 text-xs md:text-sm max-w-md mx-auto">
          {hasFilters 
            ? 'No categories match your current filters. Try adjusting your search criteria.' 
            : 'Get started by creating your first category to organize your products.'
          }
        </p>
        <Button asChild size="sm" className="h-8 md:h-auto">
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <CategoryMobileCard
        categories={categories}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
      <div className="hidden lg:block">
        <CategoryTable
          categories={categories}
          loading={loading}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </div>
    </>
  )
}
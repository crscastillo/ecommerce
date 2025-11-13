'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Brand {
  id: string
  name: string
}

interface ProductsSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: Category[]
  selectedCategories: string[]
  onCategoryChange: (categoryId: string, checked: boolean) => void
  brands: Brand[]
  selectedBrands: string[]
  onBrandChange: (brandId: string, checked: boolean) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  t: any
}

export function ProductsSidebar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryChange,
  brands,
  selectedBrands,
  onBrandChange,
  hasActiveFilters,
  onClearFilters,
  t
}: ProductsSidebarProps) {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-8">
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{t('products.filters')}</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                {t('products.clearAll')}
              </Button>
            )}
          </div>

          {/* Search */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t('products.search')}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">{t('navigation.categories')}</Label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => onCategoryChange(category.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">{t('navigation.brands')}</Label>
            <div className="space-y-2">
              {brands.map((brand) => (
                <label key={brand.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={(e) => onBrandChange(brand.id, e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

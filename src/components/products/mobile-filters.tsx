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

interface MobileFiltersProps {
  show: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: Category[]
  selectedCategories: string[]
  onCategoryChange: (categoryId: string, checked: boolean) => void
  brands: Brand[]
  selectedBrands: string[]
  onBrandChange: (brandId: string, checked: boolean) => void
  onClearFilters: () => void
  t: any
}

export function MobileFilters({
  show,
  onClose,
  searchQuery,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryChange,
  brands,
  selectedBrands,
  onBrandChange,
  onClearFilters,
  t
}: MobileFiltersProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">{t('products.filters')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ×
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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

          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="flex-1"
              >
                {t('products.clearAll')}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                {t('products.applyFilters')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

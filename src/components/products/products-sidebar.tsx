'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from 'lucide-react'
import { getCurrencySymbol } from '@/lib/utils/currency'
import { Tenant } from '@/lib/contexts/tenant-context'



interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
}

interface ProductsSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  categories: Category[]
  selectedCategories: string[]
  onCategoryChange: (categorySlug: string, checked: boolean) => void
  brands: Brand[]
  selectedBrands: string[]
  onBrandChange: (brandSlug: string, checked: boolean) => void
  priceRange: { min: number; max: number }
  onPriceRangeChange: (min: number, max: number) => void
  maxProductPrice: number
  hasActiveFilters: boolean
  onClearFilters: () => void
  tenant?: Tenant | null
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
  priceRange,
  onPriceRangeChange,
  maxProductPrice,
  hasActiveFilters,
  onClearFilters,
  tenant,
  t
}: ProductsSidebarProps) {
  
  // Get currency symbol from tenant
  const currencySymbol = getCurrencySymbol(tenant)
  
  // Smart rounding function based on price scale
  const getSmartRounding = (price: number) => {
    if (price <= 100) return 5        // Round to 5s for prices under 100
    if (price <= 1000) return 50      // Round to 50s for prices under 1000
    if (price <= 10000) return 500    // Round to 500s for prices under 10000
    return 5000                       // Round to 5000s for higher prices
  }

  const smartRound = (price: number, roundingUnit: number) => {
    return Math.ceil(price / roundingUnit) * roundingUnit
  }

  // Format price without decimals
  const formatPrice = (price: number) => {
    return Math.floor(price).toLocaleString()
  }

  // Generate dynamic price ranges based on maxProductPrice
  const generatePriceRanges = () => {
    const ranges = []
    const roundingUnit = getSmartRounding(maxProductPrice)
    
    const quarter = smartRound(maxProductPrice / 4, roundingUnit)
    const half = smartRound(maxProductPrice / 2, roundingUnit)
    const threeQuarters = smartRound(maxProductPrice * 0.75, roundingUnit)
    
    ranges.push({
      label: `Under ${currencySymbol}${formatPrice(quarter)}`,
      min: 0,
      max: quarter,
      isActive: priceRange.min === 0 && priceRange.max === quarter
    })
    
    ranges.push({
      label: `${currencySymbol}${formatPrice(quarter)} - ${currencySymbol}${formatPrice(half)}`,
      min: quarter,
      max: half,
      isActive: priceRange.min === quarter && priceRange.max === half
    })
    
    ranges.push({
      label: `${currencySymbol}${formatPrice(half)} - ${currencySymbol}${formatPrice(threeQuarters)}`,
      min: half,
      max: threeQuarters,
      isActive: priceRange.min === half && priceRange.max === threeQuarters
    })
    
    ranges.push({
      label: `${currencySymbol}${formatPrice(threeQuarters)}+`,
      min: threeQuarters,
      max: maxProductPrice,
      isActive: priceRange.min === threeQuarters && priceRange.max === maxProductPrice
    })
    
    return ranges
  }
  
  const priceRanges = generatePriceRanges()

  return (
    <div className="hidden md:block w-64 flex-shrink-0">
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
                    checked={selectedCategories.includes(category.slug)}
                    onChange={(e) => onCategoryChange(category.slug, e.target.checked)}
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
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={(e) => onBrandChange(brand.slug, e.target.checked)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">{t('products.priceRange') || 'Price Range'}</Label>
            <div className="space-y-4">
              {/* Simple input fields */}
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">{t('products.minPrice')}</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={priceRange.min || ''}
                    onChange={(e) => {
                      const newMin = Math.max(0, parseFloat(e.target.value) || 0)
                      onPriceRangeChange(newMin, priceRange.max)
                    }}
                    className="w-full text-sm"
                    min="0"
                  />
                </div>
                <span className="text-gray-400 text-sm pt-5">-</span>
                <div className="flex-1">
                  <Label className="text-xs text-gray-500 mb-1 block">{t('products.maxPrice')}</Label>
                  <Input
                    type="number"
                    placeholder={t('products.noLimit')}
                    value={priceRange.max === maxProductPrice ? '' : priceRange.max || ''}
                    onChange={(e) => {
                      const newMax = parseFloat(e.target.value) || maxProductPrice
                      onPriceRangeChange(priceRange.min, newMax)
                    }}
                    className="w-full text-sm"
                    min="0"
                    max={maxProductPrice}
                  />
                </div>
              </div>
              
              {/* Current range display */}
              {(priceRange.min > 0 || priceRange.max < maxProductPrice) && (
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-800">
                    {currencySymbol}{priceRange.min} - {priceRange.max === maxProductPrice ? t('products.noLimit') : `${currencySymbol}${priceRange.max}`}
                  </span>
                </div>
              )}
              
              {/* Quick preset buttons */}
              <div className="space-y-2">
                <Label className="text-xs text-gray-500">{t('products.quickFilters')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((range, index) => (
                    <Button
                      key={index}
                      variant={range.isActive ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => onPriceRangeChange(range.min, range.max)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs text-gray-500"
                  onClick={() => onPriceRangeChange(0, maxProductPrice)}
                >
                  {t('products.clearPriceFilter')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
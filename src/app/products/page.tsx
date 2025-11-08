'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils/currency'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  Package,
  SlidersHorizontal
} from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  getCategories, 
  getProducts, 
  searchProducts,
  type Category, 
  type Product 
} from '@/lib/services/api'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'name'

interface Brand {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const { tenant } = useTenant()
  const t = useTranslations()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [tenantSettings, setTenantSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (!tenant?.id) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Load categories
        const categoriesResult = await getCategories(tenant.id, { is_active: true })
        if (categoriesResult.data) {
          setCategories(categoriesResult.data)
        } else {
          console.error('Error loading categories:', categoriesResult.error)
        }

        // Load brands
        let currentBrands = brands // Use existing brands if available
        if (brands.length === 0) { // Only fetch if we don't have brands yet
          const brandsResponse = await fetch(`/api/brands?tenant_id=${tenant.id}&is_active=true`)
          if (brandsResponse.ok) {
            const brandsResult = await brandsResponse.json()
            if (brandsResult.data) {
              currentBrands = brandsResult.data
              setBrands(brandsResult.data)
            }
          } else {
            console.error('Error loading brands')
          }
        }

        // Build product filters
        const filters: any = {
          is_active: true,
          sort_by: sortBy
        }

        if (selectedCategories.length > 0) {
          filters.category_ids = selectedCategories.join(',')
        }

        if (selectedBrands.length > 0) {
          // Find brand slugs by IDs using the current brands data
          const brandSlugs = currentBrands
            .filter(b => selectedBrands.includes(b.id))
            .map(b => b.slug)
          if (brandSlugs.length > 0) {
            filters.brand_slugs = brandSlugs.join(',')
          }
        }

        // Load products with filters
        let productsResult
        if (searchQuery) {
          productsResult = await searchProducts(tenant.id, searchQuery, filters)
        } else {
          productsResult = await getProducts(tenant.id, filters)
        }

        if (productsResult.data) {
          setProducts(productsResult.data)
        } else {
          console.error('Error loading products:', productsResult.error)
        }

        // For now, use empty tenant settings since we removed the direct DB call
        // TODO: Create an API route for tenant settings if needed
        setTenantSettings({})
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant?.id, selectedCategories, selectedBrands, searchQuery, sortBy])

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories(prev => [...prev, categoryId])
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId))
    }
  }

  const handleBrandChange = (brandId: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands(prev => [...prev, brandId])
    } else {
      setSelectedBrands(prev => prev.filter(id => id !== brandId))
    }
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSearchQuery('')
    setSortBy('newest')
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('errors.storeNotFound')}</h3>
          <p className="text-muted-foreground">
            {t('errors.storeNotFoundDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('navigation.products')}</h1>
        <p className="text-gray-600">
          {t('products.discoverCollection')}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Hidden on mobile */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{t('products.filters')}</h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
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
                        onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filter Button & Top Controls */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                {t('products.filters')}
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {selectedCategories.length + selectedBrands.length + (searchQuery ? 1 : 0)}
                  </Badge>
                )}
              </Button>

              {/* Sort and View Controls */}
              <div className="flex gap-3 items-center">
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t('products.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('products.sortNewest')}</SelectItem>
                    <SelectItem value="price-low">{t('products.sortPriceLowHigh')}</SelectItem>
                    <SelectItem value="price-high">{t('products.sortPriceHighLow')}</SelectItem>
                    <SelectItem value="name">{t('products.sortNameAZ')}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters - Mobile */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">{t('products.activeFilters')}:</span>
                {selectedCategories.map(categoryId => {
                  const category = categories.find(c => c.id === categoryId)
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="gap-1">
                      {t('products.category')}: {category.name}
                      <button
                        onClick={() => handleCategoryChange(categoryId, false)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null
                })}
                {selectedBrands.map(brandId => {
                  const brand = brands.find(b => b.id === brandId)
                  return brand ? (
                    <Badge key={brandId} variant="secondary" className="gap-1">
                      {t('products.brand')}: {brand.name}
                      <button
                        onClick={() => handleBrandChange(brandId, false)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null
                })}
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    {t('products.search')}: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs lg:hidden"
                >
                  {t('products.clearAll')}
                </Button>
              </div>
            )}
          </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('products.noProductsFound')}</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategories.length > 0 || selectedBrands.length > 0
              ? t('products.noProductsMatchFilters')
              : t('products.storeNoProductsYet')
            }
          </p>
          {(searchQuery || selectedCategories.length > 0 || selectedBrands.length > 0) && (
            <Button variant="outline" onClick={clearFilters}>
              {t('products.clearFilters')}
            </Button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
            : 'space-y-4'
          }
        `}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              tenantSettings={tenantSettings}
            />
          ))}
        </div>
      )}

          {/* Results count */}
          {!loading && products.length > 0 && (
            <div className="mt-8 text-center text-sm text-gray-600">
              {t('products.showingResults', { count: products.length })}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileFilters(false)} />
          <div className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{t('products.filters')}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
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
                      onChange={(e) => setSearchQuery(e.target.value)}
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
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
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
                          onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
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
                    onClick={clearFilters}
                    className="flex-1"
                  >
                    {t('products.clearAll')}
                  </Button>
                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1"
                  >
                    {t('products.applyFilters')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { Package } from 'lucide-react'
import { 
  getCategories, 
  getProducts, 
  searchProducts,
  type Category, 
  type Product 
} from '@/lib/services/api'
import { 
  ProductsSidebar,
  ProductsControls,
  ActiveFilters,
  ProductsGrid,
  MobileFilters 
} from '@/components/products'

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
          // Featured products first
          const sorted = [...productsResult.data].sort((a, b) => {
            if (a.is_featured === b.is_featured) return 0
            return a.is_featured ? -1 : 1
          })
          setProducts(sorted)
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

  const hasActiveFilters = !!(selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery)

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
        <ProductsSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          brands={brands}
          selectedBrands={selectedBrands}
          onBrandChange={handleBrandChange}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          t={t}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filter Button & Top Controls */}
          <ProductsControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hasActiveFilters={hasActiveFilters}
            activeFiltersCount={selectedCategories.length + selectedBrands.length + (searchQuery ? 1 : 0)}
            onShowMobileFilters={() => setShowMobileFilters(true)}
            t={t}
          />

          {/* Active Filters - Mobile */}
          <ActiveFilters
            selectedCategories={selectedCategories}
            categories={categories}
            onRemoveCategory={(categoryId) => handleCategoryChange(categoryId, false)}
            selectedBrands={selectedBrands}
            brands={brands}
            onRemoveBrand={(brandId) => handleBrandChange(brandId, false)}
            searchQuery={searchQuery}
            onRemoveSearch={() => setSearchQuery('')}
            onClearAll={clearFilters}
            t={t}
          />

          {/* Products Grid/List */}
          <ProductsGrid
            products={products}
            loading={loading}
            viewMode={viewMode}
            tenantSettings={tenantSettings}
            searchQuery={searchQuery}
            hasFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            t={t}
          />
        </main>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilters
        show={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        brands={brands}
        selectedBrands={selectedBrands}
        onBrandChange={handleBrandChange}
        onClearFilters={clearFilters}
        t={t}
      />
    </div>
  )
}
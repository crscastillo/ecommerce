'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

function ProductsPageContent() {
  const { tenant } = useTenant()
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [tenantSettings, setTenantSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = searchParams?.get('category')
    return categoryParam ? categoryParam.split(',').filter(Boolean) : []
  })
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const brandParam = searchParams?.get('brand')
    return brandParam ? brandParam.split(',').filter(Boolean) : []
  })
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sortParam = searchParams?.get('sort') as SortOption
    return sortParam && ['newest', 'price-low', 'price-high', 'name'].includes(sortParam) ? sortParam : 'newest'
  })
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [maxProductPrice, setMaxProductPrice] = useState<number>(1000)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>(() => {
    const minPrice = searchParams?.get('min_price')
    const maxPrice = searchParams?.get('max_price')
    return {
      min: minPrice ? parseFloat(minPrice) : 0,
      max: maxPrice ? parseFloat(maxPrice) : 1000
    }
  })

  // Update URL when filters change
  const updateURL = (newParams: {
    search?: string
    category?: string[]
    brand?: string[]
    sort?: string
    priceRange?: { min: number; max: number }
  }) => {
    const params = new URLSearchParams(searchParams?.toString())
    
    // Update search
    if (newParams.search !== undefined) {
      if (newParams.search) {
        params.set('search', newParams.search)
      } else {
        params.delete('search')
      }
    }
    
    // Update category
    if (newParams.category !== undefined) {
      if (newParams.category.length > 0) {
        params.set('category', newParams.category.join(','))
      } else {
        params.delete('category')
      }
    }
    
    // Update brands
    if (newParams.brand !== undefined) {
      if (newParams.brand.length > 0) {
        params.set('brand', newParams.brand.join(','))
      } else {
        params.delete('brand')
      }
    }
    
    // Update sort
    if (newParams.sort !== undefined) {
      if (newParams.sort !== 'newest') {
        params.set('sort', newParams.sort)
      } else {
        params.delete('sort')
      }
    }
    
    // Update price range
    if (newParams.priceRange !== undefined) {
      if (newParams.priceRange.min > 0) {
        params.set('min_price', newParams.priceRange.min.toString())
      } else {
        params.delete('min_price')
      }
      if (newParams.priceRange.max < maxProductPrice) {
        params.set('max_price', newParams.priceRange.max.toString())
      } else {
        params.delete('max_price')
      }
    }
    
    const newURL = params.toString() ? `?${params.toString()}` : '/products'
    router.replace(newURL, { scroll: false })
  }

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

  // Calculate price statistics from products
  const calculatePriceStats = (products: Product[]) => {
    if (!products.length) return { maxPrice: 1000 }
    
    const prices = products.flatMap(product => {
      if (product.product_type === 'variable' && product.variants?.length) {
        return product.variants.map(v => v.price).filter((price): price is number => price !== null)
      }
      return [product.price]
    })
    
    const maxPrice = Math.max(...prices)
    const roundingUnit = getSmartRounding(maxPrice)
    const roundedMax = smartRound(maxPrice, roundingUnit)
    return { maxPrice: Math.max(roundedMax, roundingUnit * 4) } // Ensure at least 4 units for range generation
  }

  // Debounced price range change to prevent excessive API calls
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange)
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedPriceRange(priceRange)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [priceRange])

  useEffect(() => {
    if (debouncedPriceRange !== priceRange) {
      updateURL({ priceRange: debouncedPriceRange })
    }
  }, [debouncedPriceRange])

  useEffect(() => {
    if (!tenant?.id) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Load categories
        const categoriesResult = await getCategories(tenant.id, { is_active: true })
        if (categoriesResult.data) {
          setCategories(categoriesResult.data)
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
          }
        }

        // Build product filters
        const filters: any = {
          is_active: true,
          sort_by: sortBy
        }

        if (selectedCategories.length > 0) {
          filters.category_slugs = selectedCategories.join(',')
        }

        if (selectedBrands.length > 0) {
          filters.brand_slugs = selectedBrands.join(',')
        }

        if (debouncedPriceRange.min > 0) {
          filters.min_price = debouncedPriceRange.min
        }

        if (debouncedPriceRange.max < maxProductPrice) {
          filters.max_price = debouncedPriceRange.max
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
          
          // Calculate dynamic price range based on all products (not just filtered ones)
          // Get all products first to calculate proper max price
          const allProductsResult = await getProducts(tenant.id, { is_active: true })
          if (allProductsResult.data) {
            const { maxPrice } = calculatePriceStats(allProductsResult.data)
            setMaxProductPrice(maxPrice)
          }
        }

        // For now, use empty tenant settings since we removed the direct DB call
        // TODO: Create an API route for tenant settings if needed
        setTenantSettings({})
      } catch (error) {
        // Handle error silently
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant?.id, selectedCategories, selectedBrands, searchQuery, sortBy, debouncedPriceRange.min, debouncedPriceRange.max])

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    const newCategories = checked 
      ? [...selectedCategories, categorySlug]
      : selectedCategories.filter(slug => slug !== categorySlug)
    
    setSelectedCategories(newCategories)
    updateURL({ category: newCategories })
  }

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    const newBrands = checked
      ? [...selectedBrands, brandSlug]
      : selectedBrands.filter(slug => slug !== brandSlug)
    
    setSelectedBrands(newBrands)
    updateURL({ brand: newBrands })
  }

  const handlePriceRangeChange = useCallback((min: number, max: number) => {
    const newPriceRange = { min, max }
    setPriceRange(newPriceRange)
  }, [])

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSearchQuery('')
    setSortBy('newest')
    setPriceRange({ min: 0, max: maxProductPrice })
    updateURL({ category: [], brand: [], search: '', sort: 'newest', priceRange: { min: 0, max: maxProductPrice } })
  }

  const hasActiveFilters = !!(selectedCategories.length > 0 || selectedBrands.length > 0 || searchQuery || priceRange.min > 0 || priceRange.max < maxProductPrice)

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
          priceRange={priceRange}
          onPriceRangeChange={handlePriceRangeChange}
          maxProductPrice={maxProductPrice}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
          tenant={tenant}
          t={t}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile Filter Button & Top Controls */}
          <ProductsControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            sortBy={sortBy}
            onSortChange={(newSort) => {
              setSortBy(newSort)
              updateURL({ sort: newSort })
            }}
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
            onRemoveSearch={() => {
              setSearchQuery('')
              updateURL({ search: '' })
            }}
            priceRange={priceRange}
            onRemovePriceRange={() => {
              const defaultRange = { min: 0, max: maxProductPrice }
              setPriceRange(defaultRange)
              updateURL({ priceRange: defaultRange })
            }}
            onClearAll={clearFilters}
            tenant={tenant}
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
        onSearchChange={(query) => {
          setSearchQuery(query)
          updateURL({ search: query })
        }}
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        brands={brands}
        selectedBrands={selectedBrands}
        onBrandChange={handleBrandChange}
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        maxProductPrice={maxProductPrice}
        onClearFilters={clearFilters}
        tenant={tenant}
        t={t}
      />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded mb-2 max-w-md animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded max-w-xl animate-pulse"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
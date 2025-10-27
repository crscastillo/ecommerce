'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  category?: {
    id: string
    name: string
    slug: string
  }
  images: any
  is_active: boolean
  is_featured: boolean
  inventory_quantity: number
  track_inventory: boolean
  tags: string[] | null
}

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  is_active: boolean
}

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'name'

export default function ProductsPage() {
  const { tenant } = useTenant()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tenantSettings, setTenantSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!tenant?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const tenantDb = new TenantDatabase(tenant.id)

        // Load categories
        const categoriesResult = await tenantDb.getCategories({ is_active: true })
        if (categoriesResult.data) {
          setCategories(categoriesResult.data)
        }

        // Load tenant settings
        const settings = await tenantDb.getTenantSettings()
        setTenantSettings(settings)

        // Load products
        const filters: any = {
          is_active: true,
        }

        if (selectedCategory) {
          filters.category_id = selectedCategory
        }

        if (searchQuery) {
          filters.search = searchQuery
        }

        const productsResult = await tenantDb.getProducts(filters)
        if (productsResult.data) {
          let sortedProducts = [...productsResult.data]
          
          // Apply sorting
          switch (sortBy) {
            case 'price-low':
              sortedProducts.sort((a, b) => a.price - b.price)
              break
            case 'price-high':
              sortedProducts.sort((a, b) => b.price - a.price)
              break
            case 'name':
              sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
              break
            case 'newest':
            default:
              // Already sorted by created_at desc in database
              break
          }
          
          setProducts(sortedProducts)
        }
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant?.id, selectedCategory, searchQuery, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId === 'all' ? '' : categoryId)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSearchQuery('')
    setSortBy('newest')
  }

  if (!tenant) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Store not found</h3>
          <p className="text-muted-foreground">
            The store you're looking for could not be found.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">
          Discover our amazing collection of products
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="name">Name: A to Z</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
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

        {/* Active Filters */}
        {(selectedCategory || searchQuery) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategory && (
              <Badge variant="secondary" className="gap-1">
                Category: {categories.find(c => c.id === selectedCategory)?.name}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:text-red-600"
                >
                  ×
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
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
              className="text-xs"
            >
              Clear all
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
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory
              ? 'No products match your current filters.'
              : 'This store doesn\'t have any products yet.'
            }
          </p>
          {(searchQuery || selectedCategory) && (
            <Button variant="outline" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
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
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Grid3X3, 
  List, 
  Package,
  ArrowLeft
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
  searchProducts,
  type Category, 
  type Product 
} from '@/lib/services/api'
import Link from 'next/link'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'price-low' | 'price-high' | 'name'

interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
}

export default function BrandPage() {
  const params = useParams()
  const brandSlug = params.slug as string
  const { tenant } = useTenant()
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    if (!tenant?.id || !brandSlug) return

    const loadData = async () => {
      try {
        setLoading(true)

        // First, get brand information
        const response = await fetch(`/api/brands/${brandSlug}?tenant_id=${tenant.id}`)
        if (response.ok) {
          const brandData = await response.json()
          setBrand(brandData.brand)
        } else {
          console.error('Brand not found')
          return
        }

        // Load categories
        const categoriesResult = await getCategories(tenant.id, { is_active: true })
        if (categoriesResult.data) {
          setCategories(categoriesResult.data)
        }

        // Build product filters
        const filters: any = {
          is_active: true,
          sort_by: sortBy,
          brand_slug: brandSlug
        }

        if (selectedCategory) {
          filters.category_id = selectedCategory
        }

        // Load products with filters
        let productsResult = await searchProducts(tenant.id, searchQuery || '', filters)

        if (productsResult.data) {
          setProducts(productsResult.data)
        } else {
          console.error('Error loading products:', productsResult.error)
        }
      } catch (error) {
        console.error('Error loading brand data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant?.id, brandSlug, selectedCategory, searchQuery, sortBy])

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
      {/* Back button */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="p-0">
          <Link href="/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      {/* Brand Header */}
      {brand && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{brand.name}</h1>
          {brand.description && (
            <p className="text-gray-600 max-w-3xl">{brand.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Showing all products from {brand.name}
          </p>
        </div>
      )}

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
              ? `No products from ${brand?.name} match your current filters.`
              : `${brand?.name} doesn't have any products yet.`
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
            ? 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6' 
            : 'space-y-4'
          }
        `}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && products.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''} from {brand?.name}
        </div>
      )}
    </div>
  )
}
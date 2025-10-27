'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import Link from 'next/link'

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

export default function CategoryProductsPage() {
  const params = useParams()
  const categorySlug = params.category as string
  const { tenant } = useTenant()
  
  const [products, setProducts] = useState<Product[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [tenantSettings, setTenantSettings] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  useEffect(() => {
    if (!tenant?.id || !categorySlug) return

    const loadData = async () => {
      try {
        setLoading(true)
        const tenantDb = new TenantDatabase(tenant.id)

        // Load category by slug
        const categoryResult = await tenantDb.getCategoryBySlug(categorySlug)
        if (categoryResult.error || !categoryResult.data) {
          console.error('Category not found:', categorySlug)
          setLoading(false)
          return
        }

        setCategory(categoryResult.data)

        // Load tenant settings
        const settings = await tenantDb.getTenantSettings()
        setTenantSettings(settings)

        // Load products for this category
        const filters: any = {
          is_active: true,
          category_id: categoryResult.data.id
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
        console.error('Error loading category products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [tenant?.id, categorySlug, searchQuery, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Category not found</h3>
          <p className="text-muted-foreground mb-4">
            The category "{categorySlug}" could not be found.
          </p>
          <Button asChild variant="outline">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to all products
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/products" className="hover:text-gray-900">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{category.name}</span>
        </div>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 text-lg">
            {category.description}
          </p>
        )}
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder={`Search in ${category.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

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

        {/* Active Search Filter */}
        {searchQuery && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <Badge variant="secondary" className="gap-1">
              "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No products match "${searchQuery}" in ${category.name}.`
              : `No products available in ${category.name} yet.`
            }
          </p>
          {searchQuery && (
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear search
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
      {products.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {products.length} product{products.length !== 1 ? 's' : ''} in {category.name}
        </div>
      )}
    </div>
  )
}
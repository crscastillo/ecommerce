'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import { getProductsByCategory, type ProductsByCategoryResponse } from '@/lib/services/api'

export default function CategoryProductsPage() {
  const params = useParams()
  const { tenant } = useTenant()
  const [data, setData] = useState<ProductsByCategoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const categorySlug = params?.slug as string

  useEffect(() => {
    async function fetchProducts() {
      if (!tenant?.id || !categorySlug) return

      setLoading(true)
      setError(null)

      try {
        const result = await getProductsByCategory(tenant.id, categorySlug, { is_active: true })
        
        if (result.error) {
          throw new Error(result.error)
        }

        setData(result.data)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [tenant?.id, categorySlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Category Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded mb-4 max-w-md animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded max-w-xl animate-pulse"></div>
          </div>

          {/* Products Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="bg-gray-200 h-48 rounded-t-lg animate-pulse"></div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const { category, products } = data

  // Helper functions for variable products (same as ProductCard)
  const getProductPrice = (product: any) => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter((v: any) => v.is_active && v.price !== null)
      if (activeVariants.length === 0) return 0
      
      const prices = activeVariants.map((v: any) => v.price!).filter((p: any) => p > 0)
      if (prices.length === 0) return 0
      
      return Math.min(...prices)
    }
    return product.price
  }

  const getProductComparePrice = (product: any) => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter((v: any) => v.is_active && v.compare_price !== null)
      if (activeVariants.length === 0) return null
      
      const comparePrices = activeVariants.map((v: any) => v.compare_price!).filter((p: any) => p > 0)
      if (comparePrices.length === 0) return null
      
      return Math.min(...comparePrices)
    }
    return product.compare_price
  }

  const getPriceRange = (product: any) => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter((v: any) => v.is_active && v.price !== null)
      if (activeVariants.length === 0) return null
      
      const prices = activeVariants.map((v: any) => v.price!).filter((p: any) => p > 0)
      if (prices.length === 0) return null
      
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      return { minPrice, maxPrice, hasRange: minPrice !== maxPrice }
    }
    return null
  }

  const isProductOutOfStock = (product: any) => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter((v: any) => v.is_active)
      if (activeVariants.length === 0) return true
      
      const totalStock = activeVariants.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0)
      return totalStock <= 0
    }
    
    return product.track_inventory && product.inventory_quantity <= 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No products found</h2>
            <p className="text-gray-600 mb-8">This category doesn't have any products yet.</p>
            <Button asChild>
              <Link href="/">Browse Other Categories</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.is_featured && (
                      <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                        Featured
                      </Badge>
                    )}
                    {isProductOutOfStock(product) && (
                      <Badge className="absolute top-2 right-2 bg-gray-500 hover:bg-gray-600">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </CardTitle>
                  {product.short_description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {product.short_description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {(() => {
                      const currentPrice = getProductPrice(product)
                      const currentComparePrice = getProductComparePrice(product)
                      const priceRange = getPriceRange(product)
                      
                      return (
                        <>
                          {priceRange && priceRange.hasRange ? (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(priceRange.minPrice, tenant)} - {formatPrice(priceRange.maxPrice, tenant)}
                            </span>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(currentPrice, tenant)}
                            </span>
                          )}
                          {currentComparePrice && currentComparePrice > currentPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(currentComparePrice, tenant)}
                            </span>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {isProductOutOfStock(product) ? (
                    <Button disabled className="w-full">
                      Out of Stock
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href={`/product/${product.slug}`}>View Details</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
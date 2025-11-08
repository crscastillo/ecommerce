'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Heart, 
  Star,
  Package
} from 'lucide-react'
import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { isProductLowStock, getLowStockBadge } from '@/lib/utils/low-stock'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  brand_id: string | null
  category?: {
    id: string
    name: string
    slug: string
  }
  brand?: {
    id: string
    name: string
    slug: string
  }
  images: any
  is_active: boolean
  is_featured: boolean
  inventory_quantity: number
  track_inventory: boolean
  product_type: 'single' | 'variable' | 'digital'
  variants?: Array<{
    id: string
    title: string
    option1: string | null
    option2: string | null
    option3: string | null
    sku: string | null
    price: number | null
    compare_price: number | null
    inventory_quantity: number
    image_url: string | null
    is_active: boolean
  }>
  tags: string[] | null
}

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
  tenantSettings?: {
    low_stock_threshold?: number
  }
}

export function ProductCard({ product, viewMode = 'grid', tenantSettings = {} }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { tenant } = useTenant()

  // Helper functions for variable products
  const getProductPrice = () => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active && v.price !== null)
      if (activeVariants.length === 0) return 0
      
      const prices = activeVariants.map(v => v.price!).filter(p => p > 0)
      if (prices.length === 0) return 0
      
      return Math.min(...prices)
    }
    return product.price
  }

  const getProductComparePrice = () => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active && v.compare_price !== null)
      if (activeVariants.length === 0) return null
      
      const comparePrices = activeVariants.map(v => v.compare_price!).filter(p => p > 0)
      if (comparePrices.length === 0) return null
      
      return Math.min(...comparePrices)
    }
    return product.compare_price
  }

  const getProductInventoryStatus = () => {
    console.log('Checking inventory for product:', product.name, {
      product_type: product.product_type,
      inventory_quantity: product.inventory_quantity,
      track_inventory: product.track_inventory,
      variants: product.variants?.length || 0,
      variantsData: product.variants
    })
    
    if (product.product_type === 'variable') {
      // If variants are expected but not loaded, treat as loading state
      if (!product.variants || !Array.isArray(product.variants)) {
        console.log('Variable product but no variants array loaded yet')
        return { isOutOfStock: false, totalStock: 0 }
      }
      
      if (product.variants.length > 0) {
        const activeVariants = product.variants.filter(v => v.is_active)
        console.log('Active variants:', activeVariants.length, activeVariants.map(v => ({ id: v.id, inventory_quantity: v.inventory_quantity, is_active: v.is_active })))
        
        if (activeVariants.length === 0) return { isOutOfStock: true, totalStock: 0 }
        
        const totalStock = activeVariants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0)
        const isOutOfStock = totalStock <= 0
        
        console.log('Variable product stock calculation:', { totalStock, isOutOfStock })
        return { isOutOfStock, totalStock }
      } else {
        console.log('Variable product has no variants')
        return { isOutOfStock: true, totalStock: 0 }
      }
    }
    
    const isOutOfStock = product.track_inventory && product.inventory_quantity <= 0
    console.log('Single product stock calculation:', { isOutOfStock, inventory_quantity: product.inventory_quantity, track_inventory: product.track_inventory })
    return { isOutOfStock, totalStock: product.inventory_quantity }
  }

  const getPriceRange = () => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active && v.price !== null)
      if (activeVariants.length === 0) return null
      
      const prices = activeVariants.map(v => v.price!).filter(p => p > 0)
      if (prices.length === 0) return null
      
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      return { minPrice, maxPrice, hasRange: minPrice !== maxPrice }
    }
    return null
  }

  const currentPrice = getProductPrice()
  const currentComparePrice = getProductComparePrice()
  const inventoryStatus = getProductInventoryStatus()
  const priceRange = getPriceRange()

  const getImageUrl = (): string => {
    try {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0]
      }
      if (typeof product.images === 'string') {
        return product.images
      }
    } catch (error) {
      console.error('Error parsing product images:', error)
    }
    return '/placeholder-product.svg' // SVG placeholder image
  }

  const discountPercentage = currentComparePrice && currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  const { isOutOfStock, totalStock } = inventoryStatus
  const lowStockSettings = { low_stock_threshold: tenantSettings.low_stock_threshold || 5 }
  
  // For variable products, use total stock for low stock calculation
  const stockForLowStockCheck = product.product_type === 'variable' 
    ? { ...product, inventory_quantity: totalStock }
    : product
    
  const lowStockBadge = getLowStockBadge(stockForLowStockCheck, lowStockSettings)
  const isLowStockProduct = isProductLowStock(stockForLowStockCheck, lowStockSettings)

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          {/* Image */}
          <div className="w-48 h-48 flex-shrink-0 relative bg-gray-100">
            {!imageError ? (
              <Image
                src={getImageUrl()}
                alt={product.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_featured && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {isOutOfStock && (
                <Badge variant="secondary" className="text-xs">
                  Out of Stock
                </Badge>
              )}
              {lowStockBadge.show && (
                <Badge 
                  variant={lowStockBadge.variant === 'destructive' ? 'destructive' : 'outline'} 
                  className={`text-xs ${lowStockBadge.variant === 'warning' ? 'border-orange-500 text-orange-600' : ''}`}
                >
                  {lowStockBadge.text}
                </Badge>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <Heart 
                className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </button>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <Link 
                  href={`/products/${product.slug}`}
                  className="hover:underline"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 text-sm">
                  {product.brand && (
                    <>
                      <span className="text-gray-600">by</span>
                      <Link 
                        href={`/brands/${product.brand.slug}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {product.brand.name}
                      </Link>
                    </>
                  )}
                  {product.category && (
                    <>
                      {product.brand && <span className="text-gray-400">•</span>}
                      <span className="text-gray-600">in</span>
                      <Link 
                        href={`/products/category/${product.category.slug}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {product.category.name}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {priceRange && priceRange.hasRange ? (
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(priceRange.minPrice, tenant)} - {formatPrice(priceRange.maxPrice, tenant)}
                    </span>
                  ) : (
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(currentPrice, tenant)}
                    </span>
                  )}
                  {currentComparePrice && currentComparePrice > currentPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(currentComparePrice, tenant)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {product.short_description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.short_description}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {isOutOfStock ? (
                  <span className="text-red-600">Out of stock</span>
                ) : lowStockBadge.show ? (
                  <span className="text-orange-600">{lowStockBadge.text}</span>
                ) : (
                  <span className="text-green-600">In stock</span>
                )}
              </div>

              <Button 
                size="sm" 
                disabled={isOutOfStock}
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden">
        {!imageError ? (
          <Image
            src={getImageUrl()}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_featured && (
            <Badge variant="default" className="text-xs">
              Featured
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary" className="text-xs">
              Out of Stock
            </Badge>
          )}
          {lowStockBadge.show && (
            <Badge 
              variant={lowStockBadge.variant === 'destructive' ? 'destructive' : 'outline'} 
              className={`text-xs ${lowStockBadge.variant === 'warning' ? 'border-orange-500 text-orange-600' : ''}`}
            >
              {lowStockBadge.text}
            </Badge>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart 
            className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Quick Actions */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            size="sm" 
            className="w-full"
            disabled={isOutOfStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <Link 
          href={`/products/${product.slug}`}
          className="hover:underline"
        >
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="space-y-1">
          {product.brand && (
            <div className="text-sm">
              <span className="text-gray-500">by </span>
              <Link 
                href={`/brands/${product.brand.slug}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {product.brand.name}
              </Link>
            </div>
          )}
          
          {product.category && (
            <Link 
              href={`/products/category/${product.category.slug}`}
              className="text-sm text-gray-600 hover:text-gray-900 block"
            >
              {product.category.name}
            </Link>
          )}
        </div>

        {product.short_description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Stock status */}
        <div className="mt-2 text-sm">
          {isOutOfStock ? (
            <span className="text-red-600">Out of stock</span>
          ) : lowStockBadge.show ? (
            <span className="text-orange-600">{lowStockBadge.text}</span>
          ) : (
            <span className="text-green-600">In stock</span>
          )}
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {product.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{product.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
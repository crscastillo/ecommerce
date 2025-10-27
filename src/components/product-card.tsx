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
  tags: string[] | null
}

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

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

  const discountPercentage = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  const isOutOfStock = product.inventory_quantity <= 0
  const isLowStock = product.inventory_quantity <= 5 && product.inventory_quantity > 0

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
              {isLowStock && (
                <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                  Low Stock
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
                
                {product.category && (
                  <Link 
                    href={`/products/${product.category.slug}`}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {product.category.name}
                  </Link>
                )}
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && product.compare_price > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.compare_price)}
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
                ) : isLowStock ? (
                  <span className="text-orange-600">Only {product.inventory_quantity} left</span>
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
          {isLowStock && (
            <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
              Low Stock
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
        
        {product.category && (
          <Link 
            href={`/products/${product.category.slug}`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {product.category.name}
          </Link>
        )}

        {product.short_description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {product.short_description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>

        {/* Stock status */}
        <div className="mt-2 text-sm">
          {isOutOfStock ? (
            <span className="text-red-600">Out of stock</span>
          ) : isLowStock ? (
            <span className="text-orange-600">Only {product.inventory_quantity} left</span>
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
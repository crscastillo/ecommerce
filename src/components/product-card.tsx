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
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { useTranslations } from 'next-intl'
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
  const [addingToCart, setAddingToCart] = useState(false)
  const { tenant } = useTenant()
  const { addToCart, items } = useCart()
  const { success, error: showError } = useToast()
  const t = useTranslations()

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

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    console.log('handleAddToCart called')
    e.preventDefault() // Prevent navigation if card is wrapped in Link
    e.stopPropagation()
    
    if (isOutOfStock || addingToCart) return
    
    setAddingToCart(true)
    
    try {
      const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : undefined

      const maxQuantity = product.track_inventory ? totalStock : undefined

      // Debug log for addToCart payload
      console.log('AddToCart payload:', {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice,
        image: productImage,
        maxQuantity: maxQuantity
      })
      // Debug log for cart items before
      console.log('Cart items before:', items)

      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice,
        image: productImage,
        maxQuantity: maxQuantity
      }, 1)

      // Debug log for cart items after (async, so use setTimeout)
      setTimeout(() => {
        console.log('Cart items after:', items)
      }, 500)

      success(
        'Added to cart!',
        `${product.name} has been added to your cart`
      )
    } catch (err) {
      console.error('Error adding to cart:', err)
      showError(
        'Failed to add to cart',
        'Please try again later'
      )
    } finally {
      setAddingToCart(false)
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="w-full sm:w-48 h-48 flex-shrink-0 relative bg-gray-100">
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
                  {t('product.featured')}
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
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
          <CardContent className="flex-1 p-3 sm:p-6 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 flex-1">
              <div className="flex-1">
                <Link 
                  href={`/products/${product.slug}`}
                  className="hover:underline"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm mb-2 sm:mb-0">
                  {product.brand && (
                    <>
                      <span className="text-gray-600">{t('product.by')}</span>
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
                      <span className="text-gray-600">{t('product.in')}</span>
                      <Link 
                        href={`/products?category=${product.category.slug}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {product.category.name}
                      </Link>
                    </>
                  )}
                </div>

                {product.short_description && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 hidden sm:block">
                    {product.short_description}
                  </p>
                )}

                {/* Tags - desktop only */}
                {product.tags && product.tags.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 mb-4">
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

                {/* Price - mobile only */}
                <div className="sm:hidden mb-2">
                  <div className="flex items-center gap-1">
                    {priceRange && priceRange.hasRange ? (
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(priceRange.minPrice, tenant)} - {formatPrice(priceRange.maxPrice, tenant)}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(currentPrice, tenant)}
                      </span>
                    )}
                    {currentComparePrice && currentComparePrice > currentPrice && (
                      <span className="text-xs text-gray-500 line-through">
                        {formatPrice(currentComparePrice, tenant)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock status - mobile */}
                <div className="text-xs sm:text-sm text-gray-600 sm:hidden mb-2">
                  {isOutOfStock ? (
                    <span className="text-red-600">{t('product.outOfStock')}</span>
                  ) : lowStockBadge.show ? (
                    <span className="text-orange-600">{lowStockBadge.translationKey ? t(lowStockBadge.translationKey, lowStockBadge.translationParams) : ''}</span>
                  ) : (
                    <span className="text-green-600">{t('product.inStock')}</span>
                  )}
                </div>
              </div>

              {/* Price - desktop only */}
              <div className="text-right hidden sm:block">
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

            {/* Bottom row - Stock and Add to Cart */}
            <div className="flex items-center justify-between mt-auto">
              {/* Stock status - desktop */}
              <div className="text-sm text-gray-600 hidden sm:block">
                {isOutOfStock ? (
                  <span className="text-red-600">{t('product.outOfStock')}</span>
                ) : lowStockBadge.show ? (
                  <span className="text-orange-600">{lowStockBadge.translationKey ? t(lowStockBadge.translationKey, lowStockBadge.translationParams) : ''}</span>
                ) : (
                  <span className="text-green-600">{t('product.inStock')}</span>
                )}
              </div>

              {/* Add to Cart button - wider on mobile */}
              <Button 
                size="sm" 
                disabled={isOutOfStock || addingToCart}
                onClick={handleAddToCart}
                className="flex items-center gap-2 ml-auto w-auto sm:w-auto min-w-[120px]"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {addingToCart ? t('product.adding') : 
                   isOutOfStock ? t('product.outOfStock') : 
                   t('product.addToCart')}
                </span>
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  // Grid view
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden flex-shrink-0">
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
              {t('product.featured')}
            </Badge>
          )}
          {discountPercentage > 0 && (
            <Badge variant="destructive" className="text-xs">
              -{discountPercentage}%
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
            disabled={isOutOfStock || addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addingToCart ? t('product.adding') : 
             isOutOfStock ? t('product.outOfStock') : 
             t('product.addToCart')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="flex-1">
          <Link 
            href={`/products/${product.slug}`}
            className="hover:underline"
          >
            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>
          
          <div className="space-y-0.5 sm:space-y-1">
            {product.brand && (
              <div className="text-xs sm:text-sm">
                <span className="text-gray-500">{t('product.by')} </span>
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
                href={`/products?category=${product.category.slug}`}
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 block"
              >
                {product.category.name}
              </Link>
            )}
          </div>

          {product.short_description && (
            <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2 line-clamp-2 hidden sm:block">
              {product.short_description}
            </p>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 sm:mt-2 hidden sm:flex">
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
        </div>

        {/* Price and Stock - Always at bottom */}
        <div className="mt-auto pt-2 sm:pt-3 space-y-1 sm:space-y-2">
          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {priceRange && priceRange.hasRange ? (
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  {formatPrice(priceRange.minPrice, tenant)} - {formatPrice(priceRange.maxPrice, tenant)}
                </span>
              ) : (
                <span className="text-base sm:text-lg font-bold text-gray-900">
                  {formatPrice(currentPrice, tenant)}
                </span>
              )}
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="text-xs sm:text-sm text-gray-500 line-through">
                  {formatPrice(currentComparePrice, tenant)}
                </span>
              )}
            </div>
          </div>

          {/* Stock status */}
          <div className="text-xs sm:text-sm">
            {isOutOfStock ? (
              <span className="text-red-600">{t('product.outOfStock')}</span>
            ) : lowStockBadge.show ? (
              <span className="text-orange-600">{lowStockBadge.translationKey ? t(lowStockBadge.translationKey, lowStockBadge.translationParams) : ''}</span>
            ) : (
              <span className="text-green-600">{t('product.inStock')}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
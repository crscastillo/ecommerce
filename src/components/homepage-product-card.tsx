'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  ShoppingCart, 
  Heart, 
  Package
} from 'lucide-react'
import { useState } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { useTranslations } from 'next-intl'
import { formatPrice } from '@/lib/utils/currency'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_price: number | null
  images: any
  is_featured: boolean
  product_type: 'single' | 'variable' | 'digital'
  variants?: Array<{
    id: string
    price: number | null
    compare_price: number | null
    is_active: boolean
  }>
}

interface HomepageProductCardProps {
  product: Product
}

export function HomepageProductCard({ product }: HomepageProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const { tenant } = useTenant()
  const { addToCart } = useCart()
  const { success, error: showError } = useToast()
  const t = useTranslations()
  const cartT = useTranslations('cart')

  // Get product image URL
  const getImageUrl = () => {
    if (!product.images) return '/placeholder-product.jpg'
    
    try {
      const images = typeof product.images === 'string' 
        ? JSON.parse(product.images) 
        : product.images
      
      if (Array.isArray(images) && images.length > 0) {
        return images[0]
      }
    } catch (error) {
      // Handle parsing error
    }
    
    return '/placeholder-product.jpg'
  }

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

  const currentPrice = getProductPrice()
  const currentComparePrice = getProductComparePrice()

  // Calculate discount percentage
  const discountPercentage = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  // Check for price range in variable products
  const getPriceRange = () => {
    if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
      const activeVariants = product.variants.filter(v => v.is_active && v.price !== null)
      if (activeVariants.length === 0) return null
      
      const prices = activeVariants.map(v => v.price!).filter(p => p > 0)
      if (prices.length === 0) return null
      
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      
      return {
        minPrice,
        maxPrice,
        hasRange: minPrice !== maxPrice
      }
    }
    return null
  }

  const priceRange = getPriceRange()

  // Handle add to cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setAddingToCart(true)
    
    try {
      const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : undefined

      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: currentPrice,
        image: productImage
      }, 1)

      success(
        cartT('addedToCart'),
        cartT('addedToCartDescription', { productName: product.name })
      )
    } catch (err) {
      showError(
        cartT('failedToAddToCart'),
        cartT('tryAgainLater')
      )
    } finally {
      setAddingToCart(false)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 overflow-hidden flex-shrink-0">
        {/* Mobile: Clickable image for navigation */}
        <Link href={`/products/${product.slug}`} className="block md:hidden absolute inset-0 z-10">
          <span className="sr-only">View {product.name}</span>
        </Link>
        
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
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
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

        {/* Wishlist - Desktop only */}
        <button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all opacity-0 group-hover:opacity-100 hidden md:block z-20"
        >
          <Heart 
            className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>

        {/* Mobile: Small Add to Cart button */}
        <Button
          size="sm"
          className="absolute bottom-2 right-2 h-8 w-8 p-0 rounded-full md:hidden z-20 shadow-lg"
          disabled={addingToCart}
          onClick={(e) => {
            handleAddToCart(e)
          }}
        >
          {addingToCart ? (
            <div className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
        </Button>

        {/* Desktop: Quick Actions on hover */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block">
          <Button 
            size="sm" 
            className="w-full"
            disabled={addingToCart}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {addingToCart ? t('product.adding') : t('product.addToCart')}
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
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm sm:text-base">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Price - Always at bottom */}
        <div className="mt-auto pt-2">
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
      </CardContent>
    </Card>
  )
}
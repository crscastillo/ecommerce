'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Package, ChevronLeft } from 'lucide-react'
import { getProductBySlug, type Product, type ProductVariant } from '@/lib/services/api'
import {
  ProductBreadcrumb,
  ProductImageGallery,
  ProductInfoHeader,
  VariantSelector,
  AddToCartSection,
  ProductFeatures,
  ProductTags,
  ProductDescription
} from '@/components/product-detail'

export default function ProductPage() {
  const params = useParams()
  const { tenant } = useTenant()
  const { addToCart, isInCart, getCartItem } = useCart()
  const { success, error: showError } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  const productSlug = params?.slug as string

  useEffect(() => {
    async function fetchProduct() {
      if (!tenant?.id || !productSlug) return

      setLoading(true)
      setError(null)

      try {
        const result = await getProductBySlug(tenant.id, productSlug)
        
        if (result.error) {
          throw new Error(result.error)
        }

        if (result.data) {
          setProduct(result.data.product)
          
          // For variable products, auto-select the first available variant
          if (result.data.product.product_type === 'variable' && result.data.product.variants?.length) {
            const firstAvailableVariant = result.data.product.variants.find(
              v => v.is_active && (!v.inventory_quantity || v.inventory_quantity > 0)
            ) || result.data.product.variants[0]
            setSelectedVariant(firstAvailableVariant)
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [tenant?.id, productSlug])

  // Helper functions for variable products
  const getTotalStock = () => {
    if (!product) return 0
    
    if (product.product_type === 'variable' && product.variants) {
      return product.variants.reduce((total, variant) => {
        return total + (variant.inventory_quantity || 0)
      }, 0)
    }
    
    return product.inventory_quantity
  }

  const getCurrentPrice = () => {
    if (product?.product_type === 'variable' && selectedVariant) {
      return selectedVariant.price || product.price
    }
    return product?.price || 0
  }

  const getCurrentComparePrice = () => {
    if (product?.product_type === 'variable' && selectedVariant) {
      return selectedVariant.compare_price || product.compare_price
    }
    return product?.compare_price
  }

  const getCurrentStock = () => {
    if (product?.product_type === 'variable' && selectedVariant) {
      return selectedVariant.inventory_quantity || 0
    }
    return product?.inventory_quantity || 0
  }

  const isCurrentlyOutOfStock = () => {
    if (!product?.track_inventory) return false
    
    if (product.product_type === 'variable') {
      if (selectedVariant) {
        return selectedVariant.inventory_quantity <= 0
      }
      return getTotalStock() <= 0
    }
    
    return product.inventory_quantity <= 0
  }

  const isCurrentlyLowStock = () => {
    if (!product?.track_inventory) return false
    
    const currentStock = getCurrentStock()
    return currentStock > 0 && currentStock <= 5
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    try {
      // Get the main product image or variant image
      let productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : undefined

      // For variable products, use variant image if available
      if (product.product_type === 'variable' && selectedVariant?.image_url) {
        productImage = selectedVariant.image_url
      }

      // Determine the price and max quantity
      const price = getCurrentPrice()
      const maxQuantity = product.track_inventory ? getCurrentStock() : undefined

      // Create a unique cart item ID for variants
      const cartItemId = product.product_type === 'variable' && selectedVariant
        ? `${product.id}-${selectedVariant.id}`
        : product.id

      addToCart({
        id: cartItemId,
        name: product.product_type === 'variable' && selectedVariant
          ? `${product.name} - ${selectedVariant.title}`
          : product.name,
        slug: product.slug,
        price: price,
        image: productImage,
        maxQuantity: maxQuantity
      }, quantity)

      // Show success toast
      success(
        'Added to cart!',
        `${quantity} ${quantity === 1 ? 'item' : 'items'} added to your cart`
      )
      
      // Reset quantity to 1 after adding
      setQuantity(1)
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

  const handleQuantityChange = (newQuantity: number) => {
    if (product && product.track_inventory) {
      const maxStock = getCurrentStock()
      setQuantity(Math.min(Math.max(1, newQuantity), maxStock))
    } else {
      setQuantity(Math.max(1, newQuantity))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="space-y-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Product Not Found'}
            </h1>
            <p className="text-gray-600 mb-8">
              {error ? error : "The product you're looking for doesn't exist."}
            </p>
            <div className="space-x-4">
              <Button asChild variant="outline">
                <Link href="/products">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Products
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isOutOfStock = isCurrentlyOutOfStock()
  const isLowStock = isCurrentlyLowStock()
  const currentPrice = getCurrentPrice()
  const currentComparePrice = getCurrentComparePrice()
  const discountPercentage = currentComparePrice 
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <ProductBreadcrumb
          productName={product.name}
          brand={product.brand}
          category={product.category}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <ProductImageGallery
            images={product.images}
            productName={product.name}
            isFeatured={product.is_featured}
            discountPercentage={discountPercentage}
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
          />

          {/* Product Information */}
          <div className="space-y-6">
            <ProductInfoHeader
              name={product.name}
              brand={product.brand}
              category={product.category}
              price={formatPrice(currentPrice, tenant)}
              comparePrice={currentComparePrice ? formatPrice(currentComparePrice, tenant) : undefined}
              shortDescription={product.short_description || undefined}
              isOutOfStock={isOutOfStock}
              isLowStock={isLowStock}
              currentStock={getCurrentStock()}
              totalStock={getTotalStock()}
              isVariableProduct={product.product_type === 'variable'}
              isInCart={isInCart(product.id)}
              cartQuantity={getCartItem(product.id)?.quantity}
            />

            {/* Variant Selection for Variable Products */}
            {product.product_type === 'variable' && product.variants && product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={setSelectedVariant}
                formatPrice={formatPrice}
                tenant={tenant}
              />
            )}

            {/* Quantity and Add to Cart */}
            <AddToCartSection
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              onToggleWishlist={() => setIsWishlisted(!isWishlisted)}
              isWishlisted={isWishlisted}
              isOutOfStock={isOutOfStock}
              isAddingToCart={addingToCart}
              canIncreaseQuantity={!product.track_inventory || quantity < getCurrentStock()}
              isVariableProduct={product.product_type === 'variable'}
              hasSelectedVariant={!!selectedVariant}
              isInCart={isInCart(product.id)}
            />

            {/* Features */}
            <ProductFeatures shippingThreshold={formatPrice(50, tenant)} />

            {/* Tags */}
            <ProductTags tags={product.tags || undefined} />
          </div>
        </div>

        {/* Product Description */}
        <ProductDescription description={product.description || undefined} />
      </div>
    </div>
  )
}
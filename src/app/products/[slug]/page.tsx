'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  Package,
  Star,
  ChevronLeft
} from 'lucide-react'
import { getProductBySlug, type Product, type ProductVariant } from '@/lib/services/api'

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
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
          {product.brand && (
            <>
              <span>/</span>
              <Link 
                href={`/brands/${product.brand.slug}`} 
                className="hover:text-gray-900"
              >
                {product.brand.name}
              </Link>
            </>
          )}
          {product.category && (
            <>
              <span>/</span>
              <Link 
                href={`/products/category/${product.category.slug}`} 
                className="hover:text-gray-900"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="w-16 h-16 text-gray-400" />
                </div>
              )}
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.is_featured && (
                  <Badge className="bg-blue-600 hover:bg-blue-700">Featured</Badge>
                )}
                {discountPercentage > 0 && (
                  <Badge variant="destructive">-{discountPercentage}% OFF</Badge>
                )}
                {isOutOfStock && (
                  <Badge variant="secondary">Out of Stock</Badge>
                )}
                {isLowStock && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square relative bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index 
                        ? 'border-blue-600' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
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
                      className="font-medium text-blue-600 hover:text-blue-800"
                    >
                      {product.category.name}
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice, tenant)}
              </span>
              {currentComparePrice && currentComparePrice > currentPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(currentComparePrice, tenant)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-lg text-gray-600">{product.short_description}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center space-x-2">
              {isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : isLowStock ? (
                <Badge variant="outline" className="border-orange-500 text-orange-600">
                  Only {getCurrentStock()} left in stock
                </Badge>
              ) : (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  In Stock
                  {product.product_type === 'variable' && (
                    <span className="ml-1">({getTotalStock()} total)</span>
                  )}
                </Badge>
              )}
              
              {/* Cart Status */}
              {isInCart(product.id) && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {getCartItem(product.id)?.quantity} in cart
                </Badge>
              )}
            </div>

            {/* Variant Selection for Variable Products */}
            {product.product_type === 'variable' && product.variants && product.variants.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">Select Variant:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {product.variants.map((variant) => {
                      const variantOutOfStock = variant.inventory_quantity <= 0
                      const isSelected = selectedVariant?.id === variant.id
                      
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          disabled={variantOutOfStock}
                          className={`
                            p-3 border-2 rounded-lg text-left transition-all duration-200 hover:shadow-sm
                            ${isSelected 
                              ? 'border-blue-600 bg-blue-50 shadow-sm' 
                              : variantOutOfStock
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="font-medium text-gray-900 text-sm leading-tight">
                                {variant.title}
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {variantOutOfStock ? (
                                  <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                                    Out of Stock
                                  </Badge>
                                ) : variant.inventory_quantity <= 5 ? (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-orange-500 text-orange-600">
                                    {variant.inventory_quantity} left
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-green-500 text-green-600">
                                    In Stock
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {variant.sku && (
                              <div className="text-xs text-gray-500">
                                SKU: {variant.sku}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              {variant.price && (
                                <span className="font-bold text-gray-900 text-sm">
                                  {formatPrice(variant.price, tenant)}
                                </span>
                              )}
                              {variant.compare_price && variant.compare_price > (variant.price || 0) && (
                                <span className="text-xs text-gray-500 line-through">
                                  {formatPrice(variant.compare_price, tenant)}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quantity and Add to Cart */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="quantity" className="font-medium">Quantity:</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={product.track_inventory && quantity >= getCurrentStock()}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={isOutOfStock || addingToCart || (product.product_type === 'variable' && !selectedVariant)}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addingToCart 
                        ? 'Adding...' 
                        : isOutOfStock 
                        ? 'Out of Stock'
                        : product.product_type === 'variable' && !selectedVariant
                        ? 'Select Variant'
                        : isInCart(product.id)
                        ? 'Add More to Cart'
                        : 'Add to Cart'
                      }
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setIsWishlisted(!isWishlisted)}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="lg">
                      <Share2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over {formatPrice(50, tenant)}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-5 h-5" />
                <span>1-year warranty included</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RefreshCw className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description */}
        {product.description && (
          <div className="mb-12">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
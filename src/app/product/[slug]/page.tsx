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
import { getProductBySlug, type Product } from '@/lib/services/api'

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

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    
    try {
      // Get the main product image
      const productImage = product.images && product.images.length > 0 
        ? product.images[0] 
        : undefined

      addToCart({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: productImage,
        maxQuantity: product.track_inventory ? product.inventory_quantity : undefined
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
      setQuantity(Math.min(Math.max(1, newQuantity), product.inventory_quantity))
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

  const isOutOfStock = product.track_inventory && product.inventory_quantity <= 0
  const isLowStock = product.track_inventory && product.inventory_quantity > 0 && product.inventory_quantity <= 5
  const discountPercentage = product.compare_price 
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-gray-900">Products</Link>
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
              {product.category && (
                <Link 
                  href={`/products/category/${product.category.slug}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {product.category.name}
                </Link>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price, tenant)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.compare_price, tenant)}
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
                  Only {product.inventory_quantity} left in stock
                </Badge>
              ) : (
                <Badge variant="outline" className="border-green-500 text-green-600">
                  In Stock
                </Badge>
              )}
              
              {/* Cart Status */}
              {isInCart(product.id) && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  {getCartItem(product.id)?.quantity} in cart
                </Badge>
              )}
            </div>

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
                        disabled={product.track_inventory && quantity >= product.inventory_quantity}
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
                      disabled={isOutOfStock || addingToCart}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {addingToCart 
                        ? 'Adding...' 
                        : isOutOfStock 
                        ? 'Out of Stock' 
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
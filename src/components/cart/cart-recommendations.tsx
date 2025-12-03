'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images?: string[]
  is_featured: boolean
}

interface CartRecommendationsProps {
  tenant?: any
  formatPrice: (price: number, tenant?: any) => string
}

export function CartRecommendations({ tenant, formatPrice }: CartRecommendationsProps) {
  const t = useTranslations('cart')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      if (!tenant?.id) return

      try {
        setLoading(true)
        
        // Create tenant database instance
        const tenantDb = new TenantDatabase(tenant.id)
        
        // Fetch active products, limit to 8 to get variety for random selection
        const result = await tenantDb.getProducts({ 
          is_active: true,
          limit: 8
        })
        
        if (result.data) {
          // Sort by featured first, then randomize
          const sortedProducts = [...result.data].sort((a, b) => {
            if (a.is_featured === b.is_featured) {
              // If same featured status, randomize
              return Math.random() - 0.5
            }
            // Featured products first
            return a.is_featured ? -1 : 1
          })
          
          // Take first 4 products
          setProducts(sortedProducts.slice(0, 4))
        }
      } catch (error) {
        // Handle error silently, show empty state
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [tenant?.id])

  if (loading) {
    return (
      <div className="mt-8 lg:mt-16">
        <Card>
          <CardContent className="p-4 lg:p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              {t('youMightAlsoLike')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (products.length === 0) {
    return null // Don't show section if no products
  }

  return (
    <div className="mt-8 lg:mt-16">
      <Card>
        <CardContent className="p-4 lg:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {t('youMightAlsoLike')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {products.map((product) => (
              <Link 
                key={product.id} 
                href={`/products/${product.slug}`}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-gray-200 rounded-lg mb-2 group-hover:shadow-md transition-shadow overflow-hidden relative">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                  {product.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-xs lg:text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                  {product.name}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  {formatPrice(product.price, tenant)}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
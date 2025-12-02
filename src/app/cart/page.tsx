'use client'

import { useCart } from '@/lib/contexts/cart-context'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { EmptyCart, CartItemCard, CartSummary } from '@/components/cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, Home, ShoppingCart, ArrowLeft, Bookmark, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getItemCount 
  } = useCart()
  
  const { tenant } = useTenant()
  const t = useTranslations('cart')
  const tNav = useTranslations('navigation')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-20 h-20 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <Home className="w-4 h-4 mr-1" />
              {tNav('home')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
              {tNav('products')}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{t('title')}</span>
          </nav>
        </div>
      </div>
      
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                  <ShoppingCart className="w-6 h-6" />
                  {t('title')}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-gray-600">
                    {getItemCount()} {getItemCount() === 1 ? t('item') : t('items')} {t('inYourCart')}
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {formatPrice(getTotalPrice(), tenant)} {t('totalAmount')}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Link href="/products">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    {t('continueShopping')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                  <Bookmark className="w-4 h-4" />
                  {t('saveCart')}
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  {t('share')}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Cart Items */}
            <div className="xl:col-span-3">
              <div className="space-y-4">
                {/* Quick Actions Bar */}
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="px-3 py-1.5">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex items-center gap-4">
                        <div className="text-xs">
                          <span className="font-medium text-gray-900">{t('quickActions')}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-xs">
                            {t('selectAll')}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs text-red-600">
                            {t('removeSelected')}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {t('estimatedDelivery')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Cart Items List */}
                {items.map((item, index) => (
                  <div key={item.id} className="relative">
                    <CartItemCard
                      item={item}
                      tenant={tenant}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      formatPrice={formatPrice}
                    />
                    {index < items.length - 1 && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-10">
                        <div className="bg-gray-300 rounded-full p-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="xl:col-span-1">
              <CartSummary
                itemCount={getItemCount()}
                totalPrice={getTotalPrice()}
                tenant={tenant}
                formatPrice={formatPrice}
              />
            </div>
          </div>
          
          {/* Recently Viewed / Recommendations */}
          <div className="mt-16">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-base font-semibold text-gray-900 mb-4">
                  {t('youMightAlsoLike')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="group cursor-pointer">
                      <div className="aspect-square bg-gray-200 rounded-lg mb-2 group-hover:shadow-md transition-shadow"></div>
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">{t('recommendedProduct')} {i}</div>
                      <div className="text-sm text-gray-600">{formatPrice(29.99 * i, tenant)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
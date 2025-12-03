'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface CartRecommendationsProps {
  tenant?: any
  formatPrice: (price: number, tenant?: any) => string
}

export function CartRecommendations({ tenant, formatPrice }: CartRecommendationsProps) {
  const t = useTranslations('cart')

  // Mock recommendations data - replace with real data from your API
  const recommendations = [
    { id: 1, name: `${t('recommendedProduct')} 1`, price: 29.99 },
    { id: 2, name: `${t('recommendedProduct')} 2`, price: 59.98 },
    { id: 3, name: `${t('recommendedProduct')} 3`, price: 89.97 },
    { id: 4, name: `${t('recommendedProduct')} 4`, price: 119.96 }
  ]

  return (
    <div className="mt-8 lg:mt-16">
      <Card>
        <CardContent className="p-4 lg:p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4">
            {t('youMightAlsoLike')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            {recommendations.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2 group-hover:shadow-md transition-shadow"></div>
                <div className="text-xs lg:text-sm font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </div>
                <div className="text-xs lg:text-sm text-gray-600">
                  {formatPrice(product.price, tenant)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
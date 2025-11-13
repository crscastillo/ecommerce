'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ProductVariant } from '@/lib/services/api'

interface VariantSelectorProps {
  variants: ProductVariant[]
  selectedVariant: ProductVariant | null
  onSelectVariant: (variant: ProductVariant) => void
  formatPrice: (price: number, tenant?: any) => string
  tenant?: any
}

export function VariantSelector({
  variants,
  selectedVariant,
  onSelectVariant,
  formatPrice,
  tenant
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Select Variant:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {variants.map((variant) => {
            const variantOutOfStock = variant.inventory_quantity <= 0
            const isSelected = selectedVariant?.id === variant.id
            
            return (
              <button
                key={variant.id}
                onClick={() => onSelectVariant(variant)}
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
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Heart, Share2 } from 'lucide-react'

interface AddToCartSectionProps {
  quantity: number
  onQuantityChange: (newQuantity: number) => void
  onAddToCart: () => void
  onToggleWishlist: () => void
  isWishlisted: boolean
  isOutOfStock: boolean
  isAddingToCart: boolean
  canIncreaseQuantity: boolean
  isVariableProduct?: boolean
  hasSelectedVariant?: boolean
  isInCart?: boolean
  t: any
}

export function AddToCartSection({
  quantity,
  onQuantityChange,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  isOutOfStock,
  isAddingToCart,
  canIncreaseQuantity,
  isVariableProduct,
  hasSelectedVariant,
  isInCart,
  t
}: AddToCartSectionProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label htmlFor="quantity" className="font-medium">{t('product.quantity')}:</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onQuantityChange(quantity + 1)}
                disabled={!canIncreaseQuantity}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              className="flex-1" 
              size="lg"
              onClick={onAddToCart}
              disabled={isOutOfStock || isAddingToCart || (isVariableProduct && !hasSelectedVariant)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAddingToCart 
                ? t('product.adding')
                : isOutOfStock 
                ? t('product.outOfStock')
                : isVariableProduct && !hasSelectedVariant
                ? t('product.selectVariant')
                : isInCart
                ? t('product.addMoreToCart')
                : t('product.addToCart')
              }
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleWishlist}
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
  )
}

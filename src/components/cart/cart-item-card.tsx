'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingBag, Heart, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useTranslations } from "next-intl"

interface CartItemCardProps {
  item: {
    id: string
    name: string
    slug: string
    price: number
    image?: string
    quantity: number
    productId: string
    maxQuantity?: number
    comparePrice?: number
    sku?: string
    category?: string
    brand?: string
  }
  tenant?: any
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  formatPrice: (price: number, tenant?: any) => string
}

export function CartItemCard({ item, tenant, onUpdateQuantity, onRemove, formatPrice }: CartItemCardProps) {
  const t = useTranslations('cart')
  const [isRemoving, setIsRemoving] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleRemove = async () => {
    setIsRemoving(true)
    await new Promise(resolve => setTimeout(resolve, 200)) // Small delay for UX
    onRemove(item.productId)
  }
  
  const handleQuantityChange = async (newQuantity: number) => {
    setIsUpdating(true)
    await new Promise(resolve => setTimeout(resolve, 100))
    onUpdateQuantity(item.productId, newQuantity)
    setIsUpdating(false)
  }
  
  const discount = item.comparePrice ? ((item.comparePrice - item.price) / item.comparePrice * 100) : 0
  const savings = item.comparePrice ? (item.comparePrice - item.price) * item.quantity : 0
  
  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isRemoving ? 'opacity-50 scale-95' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Product Image */}
          <div className="relative">
            <div className="w-full sm:w-32 h-40 sm:h-32 relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <ShoppingBag className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {discount > 0 && (
                <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                  -{Math.round(discount)}%
                </Badge>
              )}
            </div>
            <div className="absolute top-2 right-2 sm:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white text-red-600 hover:text-red-800 shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <Link 
                    href={`/products/${item.slug}`}
                    className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 group"
                  >
                    {item.name}
                    <ExternalLink className="w-4 h-4 inline ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </div>
                
                {/* Product Meta */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.category && (
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                  {item.brand && (
                    <Badge variant="outline" className="text-xs">
                      {item.brand}
                    </Badge>
                  )}
                  {item.sku && (
                    <span className="text-xs text-gray-500">{t('sku')}: {item.sku}</span>
                  )}
                </div>

                {/* Pricing */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price, tenant)}
                    </span>
                    {item.comparePrice && item.comparePrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.comparePrice, tenant)}
                      </span>
                    )}
                    <span className="text-sm text-gray-600">each</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      {t('youSave')} {formatPrice(savings, tenant)} total
                    </p>
                  )}
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                    className="h-8 w-8 p-0 hover:bg-white"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className={`w-12 text-center font-semibold transition-opacity ${isUpdating ? 'opacity-50' : ''}`}>
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(item.quantity + 1)}
                    disabled={(item.maxQuantity ? item.quantity >= item.maxQuantity : false) || isUpdating}
                    className="h-8 w-8 p-0 hover:bg-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                {item.maxQuantity && (
                  <p className="text-xs text-gray-500 text-center">
                    Max: {item.maxQuantity}
                  </p>
                )}

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity, tenant)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {formatPrice(item.price, tenant)}
                    </p>
                  )}
                </div>

                {/* Desktop Remove Button */}
                <div className="hidden sm:flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Mobile Actions */}
            <div className="flex sm:hidden justify-between items-center mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('remove')}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Heart className="w-4 h-4 mr-2" />
                {t('saveForLater')}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

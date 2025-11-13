'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  }
  tenant?: any
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  formatPrice: (price: number, tenant?: any) => string
}

export function CartItemCard({ item, tenant, onUpdateQuantity, onRemove, formatPrice }: CartItemCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <div className="w-20 h-20 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <Link 
              href={`/products/${item.slug}`}
              className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {item.name}
            </Link>
            <p className="text-gray-600 mt-1">
              {formatPrice(item.price, tenant)} each
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="w-12 text-center font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Item Total */}
          <div className="text-right">
            <p className="text-lg font-medium text-gray-900">
              {formatPrice(item.price * item.quantity, tenant)}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.productId)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

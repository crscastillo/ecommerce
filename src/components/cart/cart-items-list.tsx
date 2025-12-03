'use client'

import { CartItemCard } from './cart-item-card'

interface CartItem {
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

interface CartItemsListProps {
  items: CartItem[]
  tenant?: any
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  formatPrice: (price: number, tenant?: any) => string
}

export function CartItemsList({ 
  items, 
  tenant, 
  onUpdateQuantity, 
  onRemove, 
  formatPrice 
}: CartItemsListProps) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={item.id} className="relative">
          <CartItemCard
            item={item}
            tenant={tenant}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
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
  )
}
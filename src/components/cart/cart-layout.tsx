'use client'

import { CartSummary } from './cart-summary'
import { CartItemsList } from './cart-items-list'

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

interface CartLayoutProps {
  items: CartItem[]
  tenant?: any
  itemCount: number
  totalPrice: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemove: (productId: string) => void
  formatPrice: (price: number, tenant?: any) => string
}

export function CartLayout({
  items,
  tenant,
  itemCount,
  totalPrice,
  onUpdateQuantity,
  onRemove,
  formatPrice
}: CartLayoutProps) {
  return (
    <>
      {/* Mobile Layout (xs, sm, and md) */}
      <div className="block lg:hidden">
        {/* Mobile Cart Summary at Top */}
        <div className="mb-6">
          <CartSummary
            itemCount={itemCount}
            totalPrice={totalPrice}
            tenant={tenant}
            formatPrice={formatPrice}
          />
        </div>
        
        {/* Mobile Cart Items */}
        <CartItemsList
          items={items}
          tenant={tenant}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
          formatPrice={formatPrice}
        />
      </div>

      {/* Desktop/Tablet Layout (lg and up) */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="xl:col-span-3">
            <CartItemsList
              items={items}
              tenant={tenant}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              formatPrice={formatPrice}
            />
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <CartSummary
              itemCount={itemCount}
              totalPrice={totalPrice}
              tenant={tenant}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>
    </>
  )
}
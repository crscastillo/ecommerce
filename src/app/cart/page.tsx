'use client'

import { useCart } from '@/lib/contexts/cart-context'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { EmptyCart, CartItemCard, CartSummary } from '@/components/cart'

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getItemCount 
  } = useCart()
  
  const { tenant } = useTenant()

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                tenant={tenant}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                formatPrice={formatPrice}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              itemCount={getItemCount()}
              totalPrice={getTotalPrice()}
              tenant={tenant}
              formatPrice={formatPrice}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useCart } from '@/lib/contexts/cart-context'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { 
  EmptyCart, 
  CartBreadcrumb, 
  CartHeader, 
  CartLoadingSkeleton, 
  CartLayout, 
  CartRecommendations 
} from '@/components/cart'
import { useState, useEffect } from 'react'

export default function CartPage() {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    getTotalPrice, 
    getItemCount 
  } = useCart()
  
  const { tenant } = useTenant()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // Loading state
  if (!mounted) {
    return <CartLoadingSkeleton />
  }

  // Empty cart state
  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CartBreadcrumb />
      
      <div className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CartHeader itemCount={getItemCount()} />
          
          <CartLayout
            items={items}
            tenant={tenant}
            itemCount={getItemCount()}
            totalPrice={getTotalPrice()}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            formatPrice={formatPrice}
          />
          
          <CartRecommendations tenant={tenant} formatPrice={formatPrice} />
        </div>
      </div>
    </div>
  )
}
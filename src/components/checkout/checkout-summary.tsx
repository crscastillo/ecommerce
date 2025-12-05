'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield } from 'lucide-react'

interface CheckoutSummaryProps {
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  formatPrice: (price: number, tenant?: any) => string
  tenant?: any
}

export function CheckoutSummary({ 
  items, 
  subtotal, 
  shipping, 
  tax, 
  total, 
  formatPrice, 
  tenant 
}: CheckoutSummaryProps) {
  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Items List - Collapsible on mobile */}
        <div className="lg:block">
          <div className="lg:hidden mb-3">
            <div className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your order
            </div>
          </div>
          <div className="hidden lg:block space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity, tenant)}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-3 sm:pt-4 space-y-2">
          <div className="flex justify-between text-sm sm:text-base">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, tenant)}</span>
          </div>
          
          <div className="flex justify-between text-sm sm:text-base">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? 'Free' : formatPrice(shipping, tenant)}
            </span>
          </div>
          
          <div className="flex justify-between text-sm sm:text-base">
            <span>Tax</span>
            <span>{formatPrice(tax, tenant)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg sm:text-xl font-medium">
              <span>Total</span>
              <span>{formatPrice(total, tenant)}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
          <div className="flex items-center text-green-800 dark:text-green-200">
            <Shield className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Secure checkout guaranteed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

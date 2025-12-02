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
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} × {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity, tenant)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal, tenant)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Shipping</span>
            <span className={shipping === 0 ? "text-green-600" : ""}>
              {shipping === 0 ? 'Free' : formatPrice(shipping, tenant)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatPrice(tax, tenant)}</span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>{formatPrice(total, tenant)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center text-green-800">
            <Shield className="w-4 h-4 mr-2" />
            <span className="text-sm">Secure checkout guaranteed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

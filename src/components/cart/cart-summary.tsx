'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface CartSummaryProps {
  itemCount: number
  totalPrice: number
  tenant?: any
  formatPrice: (price: number, tenant?: any) => string
}

export function CartSummary({ itemCount, totalPrice, tenant, formatPrice }: CartSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPrice(totalPrice, tenant)}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between text-lg font-medium">
            <span>Total</span>
            <span>{formatPrice(totalPrice, tenant)}</span>
          </div>
        </div>

        {itemCount > 0 && (
          <Link href="/checkout">
            <Button className="w-full mt-6" size="lg">
              Proceed to Checkout
            </Button>
          </Link>
        )}
        
        <Link href="/products">
          <Button variant="outline" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

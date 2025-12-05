'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Shield, ShoppingBag } from 'lucide-react'
import Image from 'next/image'

interface ShippingInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderReviewProps {
  shippingInfo: ShippingInfo
  paymentMethod: string
  paymentDetails?: {
    card?: { last4?: string; brand?: string }
    paymentId?: string
    cardNumber?: string
    cardholderName?: string
  }
  items: OrderItem[]
  onBack: () => void
  onPlaceOrder: () => void
  isProcessing: boolean
  formatPrice: (price: number, tenant?: any) => string
  tenant?: any
}

export function OrderReview({ 
  shippingInfo, 
  paymentMethod, 
  paymentDetails,
  items,
  onBack,
  onPlaceOrder,
  isProcessing,
  formatPrice,
  tenant
}: OrderReviewProps) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <Shield className="w-5 h-5 mr-2" />
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Shipping Info Review */}
        <div>
          <h3 className="font-medium mb-2 text-sm sm:text-base">Shipping Address</h3>
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <p className="text-sm sm:text-base">{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p className="text-sm sm:text-base">{shippingInfo.address}</p>
            <p className="text-sm sm:text-base">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
            <p className="text-sm sm:text-base">{shippingInfo.country}</p>
            <p className="text-sm sm:text-base">{shippingInfo.email}</p>
          </div>
        </div>

        {/* Payment Info Review */}
        <div>
          <h3 className="font-medium mb-2 text-sm sm:text-base">Payment Method</h3>
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            {paymentMethod === 'stripe' && paymentDetails?.card ? (
              <div>
                <p className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe Payment
                </p>
                <p className="text-sm text-muted-foreground">
                  **** **** **** {paymentDetails.card.last4 || '****'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {paymentDetails.card.brand?.toUpperCase()} ending in {paymentDetails.card.last4}
                </p>
              </div>
            ) : paymentMethod === 'tilopay' && paymentDetails?.paymentId ? (
              <div>
                <p className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  TiloPay Payment
                </p>
                <p className="text-sm text-muted-foreground">
                  Payment ID: {paymentDetails.paymentId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Secure payment processed via TiloPay
                </p>
              </div>
            ) : paymentMethod === 'card' && paymentDetails?.cardNumber ? (
              <div>
                <p className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Credit Card
                </p>
                <p>**** **** **** {paymentDetails.cardNumber.slice(-4)}</p>
                <p>{paymentDetails.cardholderName}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No payment method selected</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-medium mb-2 text-sm sm:text-base">Order Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 relative bg-muted-foreground/10 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">{item.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium text-sm sm:text-base whitespace-nowrap ml-2">{formatPrice(item.price * item.quantity, tenant)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex-1 min-h-[48px]"
            size="lg"
          >
            Back to Payment
          </Button>
          <Button 
            onClick={onPlaceOrder}
            disabled={isProcessing}
            className="flex-1 min-h-[48px]"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

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
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Review Your Order
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Shipping Info Review */}
        <div>
          <h3 className="font-medium mb-2">Shipping Address</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
            <p>{shippingInfo.address}</p>
            <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
            <p>{shippingInfo.email}</p>
          </div>
        </div>

        {/* Payment Info Review */}
        <div>
          <h3 className="font-medium mb-2">Payment Method</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {paymentMethod === 'stripe' && paymentDetails?.card ? (
              <div>
                <p className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Stripe Payment
                </p>
                <p className="text-sm text-gray-600">
                  **** **** **** {paymentDetails.card.last4 || '****'}
                </p>
                <p className="text-sm text-gray-600">
                  {paymentDetails.card.brand?.toUpperCase()} ending in {paymentDetails.card.last4}
                </p>
              </div>
            ) : paymentMethod === 'tilopay' && paymentDetails?.paymentId ? (
              <div>
                <p className="flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  TiloPay Payment
                </p>
                <p className="text-sm text-gray-600">
                  Payment ID: {paymentDetails.paymentId}
                </p>
                <p className="text-sm text-gray-600">
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
              <p className="text-gray-600">No payment method selected</p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="font-medium mb-2">Order Items</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 relative bg-gray-200 rounded overflow-hidden">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-medium">{formatPrice(item.price * item.quantity, tenant)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="flex-1"
          >
            Back to Payment
          </Button>
          <Button 
            onClick={onPlaceOrder}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react'

export default function OrderConfirmationPage() {
  const [orderNumber] = useState(() => {
    // Generate a random order number
    return `ORD-${Date.now().toString().slice(-8)}`
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-mono font-bold text-gray-900">{orderNumber}</p>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Estimated Delivery</p>
                    <p className="font-medium">3-5 business days</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Status</p>
                    <p className="font-medium text-green-600">Processing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Order Processing</h3>
                    <p className="text-sm text-gray-600">
                      We're preparing your items for shipment. You'll receive an email confirmation shortly.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Truck className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Shipping Notification</h3>
                    <p className="text-sm text-gray-600">
                      Once your order ships, we'll send you tracking information via email.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Your order will arrive within 3-5 business days. Enjoy your purchase!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Track Your Order
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>
              A confirmation email has been sent to your email address.
            </p>
            <p>
              Need help? <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { CreditCard } from 'lucide-react'
import type { PaymentMethodConfig } from '@/lib/services/payment-methods'

interface PaymentMethodSelectorProps {
  availablePaymentMethods: PaymentMethodConfig[]
  selectedPaymentMethod: string
  onSelect: (method: string) => void
  loading?: boolean
}

export function PaymentMethodSelector({ 
  availablePaymentMethods, 
  selectedPaymentMethod, 
  onSelect,
  loading = false
}: PaymentMethodSelectorProps) {
  if (loading) {
    return (
      <div>
        <Label className="text-base font-medium mb-3 block">Choose Payment Method</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i} className="border-2 border-gray-200">
              <CardContent className="p-4 text-center">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-32 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (availablePaymentMethods.length === 0) {
    return (
      <div>
        <Label className="text-base font-medium mb-3 block">Choose Payment Method</Label>
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <h3 className="font-medium text-gray-900 mb-1">No Payment Methods Available</h3>
          <p className="text-sm text-gray-600">
            Please contact the store owner to configure payment methods.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Label className="text-base font-medium mb-3 block">Choose Payment Method</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availablePaymentMethods.map((method) => (
          <Card 
            key={method.id}
            className={`cursor-pointer border-2 transition-colors ${
              selectedPaymentMethod === method.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelect(method.id)}
          >
            <CardContent className="p-4 text-center">
              <div className="mb-2">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${
                  method.id === 'stripe' ? 'bg-indigo-100' : 
                  method.id === 'tilopay' ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <CreditCard className={`w-6 h-6 ${
                    method.id === 'stripe' ? 'text-indigo-600' : 
                    method.id === 'tilopay' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                </div>
              </div>
              <h3 className="font-medium">{method.name}</h3>
              <p className="text-sm text-gray-600">
                {method.id === 'stripe' ? 'Secure payment with Stripe' :
                 method.id === 'traditional' ? 'Enter card details manually' :
                 method.id === 'tilopay' ? 'Costa Rican payment gateway' :
                 method.id === 'paypal' ? 'Pay with PayPal' :
                 method.id === 'bank_transfer' ? 'Pay via direct bank transfer' :
                 method.id === 'mobile_bank_transfer' ? 'Pay via mobile bank transfer' :
                 'Secure payment processing'}
              </p>
              <div className="mt-2 flex justify-center space-x-2">
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Visa</span>
                <span className="text-xs bg-gray-200 px-2 py-1 rounded">MC</span>
                {method.id === 'stripe' && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Amex</span>}
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

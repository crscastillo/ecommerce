'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Lock } from 'lucide-react'
import { formatPrice } from '@/lib/utils/currency'
import { Tenant } from '@/lib/contexts/tenant-context'

interface TiloPayPaymentProps {
  amount: number
  currency: string
  tenant: Tenant | null
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  apiKey: string
  disabled?: boolean
}

interface PaymentData {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvv: string
  cardholderName: string
}

export function TiloPayPayment({ 
  amount, 
  currency, 
  tenant,
  onSuccess, 
  onError, 
  apiKey,
  disabled = false 
}: TiloPayPaymentProps) {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleanValue = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    return formattedValue.substring(0, 19) // Limit to 16 digits + 3 spaces
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setPaymentData(prev => ({ ...prev, cardNumber: formatted }))
  }

  const handleExpiryChange = (field: 'expiryMonth' | 'expiryYear', value: string) => {
    const numericValue = value.replace(/\D/g, '')
    let formattedValue = numericValue

    if (field === 'expiryMonth') {
      // Ensure month is between 01-12
      if (numericValue.length === 1 && parseInt(numericValue) > 1) {
        formattedValue = `0${numericValue}`
      } else if (numericValue.length === 2) {
        const month = parseInt(numericValue)
        if (month > 12) formattedValue = '12'
        else if (month < 1) formattedValue = '01'
      }
      formattedValue = formattedValue.substring(0, 2)
    } else {
      // Year - limit to 2 digits
      formattedValue = formattedValue.substring(0, 2)
    }

    setPaymentData(prev => ({ ...prev, [field]: formattedValue }))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '').substring(0, 4)
    setPaymentData(prev => ({ ...prev, cvv: numericValue }))
  }

  const validateForm = (): boolean => {
    const { cardNumber, expiryMonth, expiryYear, cvv, cardholderName } = paymentData
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      onError('Please enter a valid card number')
      return false
    }
    
    if (!expiryMonth || !expiryYear) {
      onError('Please enter the card expiry date')
      return false
    }
    
    if (!cvv || cvv.length < 3) {
      onError('Please enter a valid CVV')
      return false
    }
    
    if (!cardholderName.trim()) {
      onError('Please enter the cardholder name')
      return false
    }

    return true
  }

  const processPayment = async () => {
    if (!validateForm()) return

    setIsProcessing(true)

    try {
      // Simulate TiloPay API call
      // In a real implementation, you would call TiloPay's API
      const mockPaymentResponse = await simulateTiloPayPayment({
        amount,
        currency,
        card: {
          number: paymentData.cardNumber.replace(/\s/g, ''),
          exp_month: paymentData.expiryMonth,
          exp_year: `20${paymentData.expiryYear}`,
          cvc: paymentData.cvv,
          name: paymentData.cardholderName
        },
        apiKey
      })

      if (mockPaymentResponse.success && mockPaymentResponse.paymentId) {
        onSuccess(mockPaymentResponse.paymentId)
      } else {
        onError(mockPaymentResponse.error || 'Payment failed')
      }
    } catch (error) {
      onError('An error occurred while processing the payment')
    } finally {
      setIsProcessing(false)
    }
  }

  // Mock TiloPay payment processing
  const simulateTiloPayPayment = async (data: any): Promise<{ success: boolean; paymentId?: string; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock validation
    if (!data.apiKey) {
      return { success: false, error: 'Invalid API key' }
    }

    // Simulate different card behaviors for testing
    const cardNumber = data.card.number
    if (cardNumber.startsWith('4000000000000002')) {
      return { success: false, error: 'Card was declined' }
    }
    if (cardNumber.startsWith('4000000000000119')) {
      return { success: false, error: 'Processing error' }
    }

    // Success case
    return {
      success: true,
      paymentId: `tilo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  if (!apiKey) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">TiloPay Not Configured</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please configure TiloPay API keys in the admin settings.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          TiloPay Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="tilopay-cardholder-name">Cardholder Name</Label>
          <Input
            id="tilopay-cardholder-name"
            value={paymentData.cardholderName}
            onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
            placeholder="John Doe"
            disabled={disabled || isProcessing}
          />
        </div>

        <div>
          <Label htmlFor="tilopay-card-number">Card Number</Label>
          <Input
            id="tilopay-card-number"
            value={paymentData.cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            disabled={disabled || isProcessing}
            className="font-mono"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="tilopay-expiry-month">Month</Label>
            <Input
              id="tilopay-expiry-month"
              value={paymentData.expiryMonth}
              onChange={(e) => handleExpiryChange('expiryMonth', e.target.value)}
              placeholder="MM"
              disabled={disabled || isProcessing}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="tilopay-expiry-year">Year</Label>
            <Input
              id="tilopay-expiry-year"
              value={paymentData.expiryYear}
              onChange={(e) => handleExpiryChange('expiryYear', e.target.value)}
              placeholder="YY"
              disabled={disabled || isProcessing}
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="tilopay-cvv">CVV</Label>
            <Input
              id="tilopay-cvv"
              value={paymentData.cvv}
              onChange={handleCvvChange}
              placeholder="123"
              disabled={disabled || isProcessing}
              className="font-mono"
            />
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded-lg">
          <div className="flex items-start space-x-2">
            <Lock className="h-4 w-4 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900">Secure Payment</p>
              <p className="text-green-700">
                Your payment is secured by TiloPay with industry-standard encryption.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <p className="font-medium">Test Cards:</p>
          <p>• 4242424242424242 - Success</p>
          <p>• 4000000000000002 - Declined</p>
          <p>• 4000000000000119 - Processing Error</p>
        </div>

        <Button 
          onClick={processPayment} 
          disabled={disabled || isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPrice(amount, tenant)}`}
        </Button>
      </CardContent>
    </Card>
  )
}
'use client'

import { useState, useMemo } from 'react'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { STRIPE_CONFIG } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/lib/contexts/toast-context'

interface StripePaymentFormProps {
  amount: number
  onSuccess: (paymentMethod: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

function StripePaymentForm({ 
  amount, 
  onSuccess, 
  onError, 
  isProcessing, 
  setIsProcessing 
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { error: showError } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      showError('Payment Error', 'Stripe has not loaded yet.')
      return
    }

    setIsProcessing(true)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      showError('Payment Error', 'Card element not found.')
      setIsProcessing(false)
      return
    }

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) {
        onError(error.message || 'Payment failed')
        setIsProcessing(false)
        return
      }

      // In a real application, you would send the payment method to your server
      // to create a payment intent and confirm the payment
      
      // For demo purposes, we'll simulate a successful payment
      setTimeout(() => {
        onSuccess(paymentMethod)
        setIsProcessing(false)
      }, 2000)

    } catch (err) {
      onError('An unexpected error occurred')
      setIsProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <CardElement options={cardElementOptions} />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>💳 Test card numbers:</p>
        <p>• Visa: 4242 4242 4242 4242</p>
        <p>• Mastercard: 5555 5555 5555 4444</p>
        <p>• Use any future expiry date and any 3-digit CVC</p>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  )
}

interface StripePaymentWrapperProps {
  amount: number
  onSuccess: (paymentMethod: any) => void
  onError: (error: string) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
  publishableKey?: string
}

export function StripePaymentWrapper(props: StripePaymentWrapperProps) {
  const { publishableKey, ...otherProps } = props
  
  // Use provided key or fall back to environment variable
  const stripeKey = publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef'
  
  const dynamicStripePromise = useMemo(() => {
    return loadStripe(stripeKey)
  }, [stripeKey])

  return (
    <Elements stripe={dynamicStripePromise} options={{
      mode: 'payment',
      amount: props.amount,
      currency: STRIPE_CONFIG.currency,
      appearance: STRIPE_CONFIG.appearance,
    }}>
      <StripePaymentForm {...otherProps} />
    </Elements>
  )
}
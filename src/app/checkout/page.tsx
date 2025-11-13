'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { useTenant } from '@/lib/contexts/tenant-context'
import { PaymentMethodsService, type PaymentMethodConfig } from '@/lib/services/payment-methods'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StripePaymentWrapper } from '@/components/stripe-payment'
import { TiloPayPayment } from '@/components/tilopay-payment'
import { 
  CheckoutSteps, 
  ShippingForm, 
  PaymentMethodSelector, 
  TraditionalCardForm,
  OrderReview,
  CheckoutSummary 
} from '@/components/checkout'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

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

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
  paymentMethod: 'card' | 'stripe' | 'tilopay'
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, getItemCount, clearCart } = useCart()
  const { success, error } = useToast()
  const { tenant } = useTenant()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [stripePaymentMethod, setStripePaymentMethod] = useState<any>(null)
  const [tiloPayPaymentMethod, setTiloPayPaymentMethod] = useState<any>(null)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodConfig[]>([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    paymentMethod: 'stripe'
  })

  // Load available payment methods for this tenant
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!tenant?.id) return
      
      try {
        setLoadingPaymentMethods(true)
        const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenant.id)
        const enabledMethods = PaymentMethodsService.getEnabledPaymentMethods(methods)
        setAvailablePaymentMethods(enabledMethods)
        
        // Set default payment method to the first enabled one
        if (enabledMethods.length > 0) {
          setPaymentInfo(prev => ({
            ...prev,
            paymentMethod: enabledMethods[0].id as 'card' | 'stripe' | 'tilopay'
          }))
        }
      } catch (err) {
        console.error('Error loading payment methods:', err)
        error('Payment Methods Error', 'Failed to load available payment methods')
      } finally {
        setLoadingPaymentMethods(false)
      }
    }

    loadPaymentMethods()
  }, [tenant?.id])

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\D/g, '')
    // Add slash after first 2 digits
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const subtotal = getTotalPrice()
  const shipping = 0 // Free shipping
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(field => 
      !shippingInfo[field as keyof ShippingInfo].trim()
    )
    
    if (missingFields.length > 0) {
      error('Missing Information', 'Please fill in all required fields')
      return
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      error('Invalid Email', 'Please enter a valid email address')
      return
    }
    
    success('Shipping Information Saved', 'Proceeding to payment details')
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentInfo.paymentMethod === 'stripe') {
      // Stripe payment will be handled by the Stripe component
      if (!stripePaymentMethod) {
        error('Payment Required', 'Please complete your payment information')
        return
      }
      success('Payment Information Saved', 'Please review your order')
      setCurrentStep('review')
      return
    }

    if (paymentInfo.paymentMethod === 'tilopay') {
      // TiloPay payment will be handled by the TiloPay component
      if (!tiloPayPaymentMethod) {
        error('Payment Required', 'Please complete your payment information')
        return
      }
      success('Payment Information Saved', 'Please review your order')
      setCurrentStep('review')
      return
    }
    
    // Handle traditional card form validation
    const requiredFields = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName']
    const missingFields = requiredFields.filter(field => 
      !paymentInfo[field as keyof PaymentInfo].trim()
    )
    
    if (missingFields.length > 0) {
      error('Missing Information', 'Please fill in all payment fields')
      return
    }
    
    // Basic card number validation (should be 16 digits)
    const cardNumber = paymentInfo.cardNumber.replace(/\s/g, '')
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      error('Invalid Card Number', 'Please enter a valid card number')
      return
    }
    
    // Basic expiry date validation (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/
    if (!expiryRegex.test(paymentInfo.expiryDate)) {
      error('Invalid Expiry Date', 'Please enter date in MM/YY format')
      return
    }
    
    // CVV validation (3-4 digits)
    if (paymentInfo.cvv.length < 3 || paymentInfo.cvv.length > 4) {
      error('Invalid CVV', 'Please enter a valid CVV')
      return
    }
    
    success('Payment Information Saved', 'Please review your order')
    setCurrentStep('review')
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real app, you would:
      // 1. Create order in database
      // 2. Process payment (Stripe or traditional)
      // 3. Send confirmation email
      // 4. Update inventory
      
      success(
        'Order Placed Successfully!',
        `Your order for ${getItemCount()} items has been confirmed.`
      )
      
      // Clear cart and redirect
      clearCart()
      router.push('/order-confirmation')
      
    } catch (err) {
      error(
        'Order Failed',
        'There was an error processing your order. Please try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStripeSuccess = (paymentMethod: any) => {
    setStripePaymentMethod(paymentMethod)
    success('Payment Method Added', 'Stripe payment method saved successfully')
    setCurrentStep('review')
  }

  const handleStripeError = (errorMessage: string) => {
    error('Payment Failed', errorMessage)
  }

  const handleTiloPaySuccess = (paymentId: string) => {
    setTiloPayPaymentMethod({ paymentId, last4: '****' })
    success('Payment Method Added', 'TiloPay payment method saved successfully')
    setCurrentStep('review')
  }

  const handleTiloPayError = (errorMessage: string) => {
    error('Payment Failed', errorMessage)
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">
            Complete your order for {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Progress Steps */}
        <CheckoutSteps currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Information */}
            {currentStep === 'shipping' && (
              <ShippingForm
                shippingInfo={shippingInfo}
                onUpdate={setShippingInfo}
                onSubmit={handleShippingSubmit}
              />
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <>
                <PaymentMethodSelector
                  availablePaymentMethods={availablePaymentMethods}
                  selectedPaymentMethod={paymentInfo.paymentMethod}
                  onSelect={(method) => setPaymentInfo(prev => ({ ...prev, paymentMethod: method as 'card' | 'stripe' | 'tilopay' }))}
                  loading={loadingPaymentMethods}
                />

                {/* Stripe Payment Form */}
                {paymentInfo.paymentMethod === 'stripe' && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">Stripe Payment</h3>
                      {(() => {
                        const stripeConfig = PaymentMethodsService.getStripeConfig(availablePaymentMethods)
                        if (!stripeConfig || !stripeConfig.keys?.publishableKey) {
                          return (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800">
                                Stripe is not properly configured. Please contact support.
                              </p>
                            </div>
                          )
                        }
                        
                        return (
                          <StripePaymentWrapper
                            amount={Math.round(total * 100)} // Convert to cents
                            tenant={tenant}
                            onSuccess={handleStripeSuccess}
                            onError={handleStripeError}
                            isProcessing={isProcessing}
                            setIsProcessing={setIsProcessing}
                            publishableKey={stripeConfig.keys.publishableKey}
                          />
                        )
                      })()}
                      
                      <div className="flex space-x-4 mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep('shipping')}
                          className="flex-1"
                        >
                          Back to Shipping
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* TiloPay Payment Form */}
                {paymentInfo.paymentMethod === 'tilopay' && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">TiloPay Payment</h3>
                      {(() => {
                        const tiloPayConfig = PaymentMethodsService.getTiloPayConfig(availablePaymentMethods)
                        if (!tiloPayConfig || !tiloPayConfig.keys?.publishableKey) {
                          return (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800">
                                TiloPay is not properly configured. Please contact support.
                              </p>
                            </div>
                          )
                        }
                        
                        return (
                          <TiloPayPayment
                            amount={total}
                            currency={tenant?.settings?.currency || "USD"}
                            tenant={tenant}
                            onSuccess={handleTiloPaySuccess}
                            onError={handleTiloPayError}
                            apiKey={tiloPayConfig.keys.publishableKey}
                            disabled={isProcessing}
                          />
                        )
                      })()}
                      
                      <div className="flex space-x-4 mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep('shipping')}
                          className="flex-1"
                        >
                          Back to Shipping
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Traditional Card Form */}
                {paymentInfo.paymentMethod === 'card' && (
                  <TraditionalCardForm
                    paymentInfo={paymentInfo}
                    onUpdate={setPaymentInfo}
                    onSubmit={handlePaymentSubmit}
                    onBack={() => setCurrentStep('shipping')}
                  />
                )}
              </>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
              <OrderReview
                shippingInfo={shippingInfo}
                paymentMethod={paymentInfo.paymentMethod}
                paymentDetails={{
                  card: stripePaymentMethod?.card,
                  paymentId: tiloPayPaymentMethod?.paymentId,
                  cardNumber: paymentInfo.cardNumber,
                  cardholderName: paymentInfo.cardholderName
                }}
                items={items}
                onBack={() => setCurrentStep('payment')}
                onPlaceOrder={handlePlaceOrder}
                isProcessing={isProcessing}
                formatPrice={formatPrice}
                tenant={tenant}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shipping={0}
              tax={tax}
              total={total}
              formatPrice={formatPrice}
              tenant={tenant}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
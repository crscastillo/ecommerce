'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
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
  CheckoutSummary,
  ShippingMethodSelector
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

import type { PaymentInfo } from '@/components/checkout/types'

export default function CheckoutPage() {
  const router = useRouter()
  const t = useTranslations('checkout')
  const { items, getTotalPrice, getItemCount, clearCart } = useCart()
  const { success, error } = useToast()
  const { tenant } = useTenant()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  const [stripePaymentMethod, setStripePaymentMethod] = useState<any>(null)
  const [tiloPayPaymentMethod, setTiloPayPaymentMethod] = useState<any>(null)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethodConfig[]>([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true)
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | undefined>()
  const [shippingPrice, setShippingPrice] = useState(0)
  
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
    paymentMethod: 'stripe' // default, will be set by availablePaymentMethods
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
  const shipping = shippingPrice
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  const handleShippingMethodChange = (methodId: string, price: number) => {
    setSelectedShippingMethodId(methodId)
    setShippingPrice(price)
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode', 'country']
    const missingFields = requiredFields.filter(field => 
      !shippingInfo[field as keyof ShippingInfo].trim()
    )
    
    if (missingFields.length > 0) {
      error('Missing Information', t('errors.missingFields'))
      return
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      error('Invalid Email', t('errors.invalidEmail'))
      return
    }
    
    // Validate shipping method is selected
    if (!selectedShippingMethodId) {
      error('Shipping Method Required', t('errors.shippingMethodRequired'))
      return
    }
    
    success(t('success.shippingSaved'), t('success.proceedingToPayment'))
    setCurrentStep('payment')
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentInfo.paymentMethod === 'stripe') {
      // Stripe payment will be handled by the Stripe component
      if (!stripePaymentMethod) {
        error('Payment Required', t('errors.paymentRequired'))
        return
      }
      success(t('success.paymentSaved'), t('success.reviewOrder'))
      setCurrentStep('review')
      return
    }

    if (paymentInfo.paymentMethod === 'tilopay') {
      // TiloPay payment will be handled by the TiloPay component
      if (!tiloPayPaymentMethod) {
        error('Payment Required', t('errors.paymentRequired'))
        return
      }
      success(t('success.paymentSaved'), t('success.reviewOrder'))
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
      // Debug log for items payload
      console.log('Order POST items payload:', items)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant?.id,
          customer_info: {
            email: shippingInfo.email,
            first_name: shippingInfo.firstName,
            last_name: shippingInfo.lastName,
            phone: shippingInfo.phone,
          },
          shipping_info: shippingInfo,
          payment_info: paymentInfo,
          items,
          totals: {
            subtotal,
            tax,
            total,
            currency: tenant?.settings?.currency || 'USD'
          }
        })
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Order failed')
      success('Order Placed Successfully!', `Your order for ${getItemCount()} items has been confirmed.`)
      clearCart()
      router.push('/order-confirmation')
    } catch (err) {
      error('Order Failed', err instanceof Error ? err.message : 'There was an error processing your order. Please try again.')
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
              <div className="space-y-6">
                <ShippingForm
                  shippingInfo={shippingInfo}
                  onUpdate={setShippingInfo}
                  onSubmit={() => {}} // Handle submission separately
                  showSubmitButton={false}
                />
                
                {/* Show shipping methods when we have basic location info */}
                {shippingInfo.zipCode && shippingInfo.country && tenant?.id && (
                  <ShippingMethodSelector
                    items={items}
                    shippingInfo={shippingInfo}
                    selectedMethodId={selectedShippingMethodId}
                    onMethodChange={handleShippingMethodChange}
                    formatPrice={formatPrice}
                    tenant={tenant}
                    tenantId={tenant.id}
                  />
                )}
                
                {/* Continue to Payment Button */}
                {selectedShippingMethodId && (
                  <div className="flex justify-end">
                    <Button onClick={handleShippingSubmit} size="lg">
                      {t('shipping.continueToPayment')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <>
                <PaymentMethodSelector
                  availablePaymentMethods={availablePaymentMethods}
                  selectedPaymentMethod={paymentInfo.paymentMethod}
                  onSelect={(method) => setPaymentInfo(prev => ({ ...prev, paymentMethod: method as any }))}
                  loading={loadingPaymentMethods}
                />
                {/* Mobile Bank Transfer Payment Form */}
                {paymentInfo.paymentMethod === 'mobile_bank_transfer' && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">Mobile Bank Transfer</h3>
                      <div className="bg-gray-100 p-4 rounded">
                        <p>Send your payment to the following mobile bank account:</p>
                        <p className="mt-2 font-mono">Account: 123456789<br />Bank: Example Mobile Bank<br />Phone: +1234567890</p>
                        <p className="mt-2 text-sm text-gray-600">After payment, reply to the confirmation email with your transaction receipt.</p>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep('shipping')} className="flex-1">Back to Shipping</Button>
                        <Button type="button" className="flex-1" onClick={() => setCurrentStep('review')}>Continue</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Regular Bank Transfer Payment Form */}
                {paymentInfo.paymentMethod === 'bank_transfer' && (
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-4">Bank Transfer</h3>
                      <div className="bg-gray-100 p-4 rounded">
                        <p>Send your payment to the following bank account:</p>
                        <p className="mt-2 font-mono">Account: 987654321<br />Bank: Example Bank<br />SWIFT: EXAMPBANK</p>
                        <p className="mt-2 text-sm text-gray-600">After payment, reply to the confirmation email with your transaction receipt.</p>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep('shipping')} className="flex-1">Back to Shipping</Button>
                        <Button type="button" className="flex-1" onClick={() => setCurrentStep('review')}>Continue</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

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
              shipping={shipping}
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
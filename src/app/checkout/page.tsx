'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/lib/contexts/cart-context'
import { useToast } from '@/lib/contexts/toast-context'
import { useTenant } from '@/lib/contexts/tenant-context'
import { PaymentMethodsService, type PaymentMethodConfig } from '@/lib/services/payment-methods'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StripePaymentWrapper } from '@/components/stripe-payment'
import { TiloPayPayment } from '@/components/tilopay-payment'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, CreditCard, Truck, Shield, ShoppingBag } from 'lucide-react'
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
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 'shipping', label: 'Shipping', icon: Truck },
              { step: 'payment', label: 'Payment', icon: CreditCard },
              { step: 'review', label: 'Review', icon: Shield }
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step 
                    ? 'border-blue-600 bg-blue-600 text-white' 
                    : index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 text-gray-500'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep === step ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    index < ['shipping', 'payment', 'review'].indexOf(currentStep)
                      ? 'bg-green-600'
                      : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Shipping Information */}
            {currentStep === 'shipping' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, firstName: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, lastName: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, city: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State *</Label>
                        <Input
                          id="state"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, state: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full mt-6">
                      Continue to Payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {currentStep === 'payment' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">Choose Payment Method</Label>
                    {loadingPaymentMethods ? (
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
                    ) : availablePaymentMethods.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <h3 className="font-medium text-gray-900 mb-1">No Payment Methods Available</h3>
                        <p className="text-sm text-gray-600">
                          Please contact the store owner to configure payment methods.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availablePaymentMethods.map((method) => (
                          <Card 
                            key={method.id}
                            className={`cursor-pointer border-2 transition-colors ${
                              paymentInfo.paymentMethod === method.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPaymentInfo(prev => ({ ...prev, paymentMethod: method.id as 'card' | 'stripe' | 'tilopay' }))}
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
                                 'Secure payment processing'}
                              </p>
                              <div className="mt-2 flex justify-center space-x-2">
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">Visa</span>
                                <span className="text-xs bg-gray-200 px-2 py-1 rounded">MC</span>
                                {method.id === 'stripe' && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Amex</span>}
                              </div>
                              {method.testMode && (
                                <Badge variant="outline" className="mt-2">Test Mode</Badge>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stripe Payment Form */}
                  {paymentInfo.paymentMethod === 'stripe' && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Stripe Payment</h3>
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
                    </div>
                  )}

                  {/* TiloPay Payment Form */}
                  {paymentInfo.paymentMethod === 'tilopay' && (
                    <div className="space-y-4">
                      <h3 className="font-medium">TiloPay Payment</h3>
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
                    </div>
                  )}                  {/* Traditional Card Form */}
                  {paymentInfo.paymentMethod === 'card' && (
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name *</Label>
                        <Input
                          id="cardholderName"
                          value={paymentInfo.cardholderName}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="cardNumber">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentInfo.cardNumber}
                          onChange={(e) => {
                            const formatted = formatCardNumber(e.target.value)
                            setPaymentInfo(prev => ({ ...prev, cardNumber: formatted }))
                          }}
                          maxLength={19}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={paymentInfo.expiryDate}
                            onChange={(e) => {
                              const formatted = formatExpiryDate(e.target.value)
                              setPaymentInfo(prev => ({ ...prev, expiryDate: formatted }))
                            }}
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 mt-6">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setCurrentStep('shipping')}
                          className="flex-1"
                        >
                          Back to Shipping
                        </Button>
                        <Button type="submit" className="flex-1">
                          Review Order
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Order Review */}
            {currentStep === 'review' && (
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
                      {paymentInfo.paymentMethod === 'stripe' && stripePaymentMethod ? (
                        <div>
                          <p className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Stripe Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            **** **** **** {stripePaymentMethod.card?.last4 || '****'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {stripePaymentMethod.card?.brand?.toUpperCase()} ending in {stripePaymentMethod.card?.last4}
                          </p>
                        </div>
                      ) : paymentInfo.paymentMethod === 'tilopay' && tiloPayPaymentMethod ? (
                        <div>
                          <p className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            TiloPay Payment
                          </p>
                          <p className="text-sm text-gray-600">
                            Payment ID: {tiloPayPaymentMethod.paymentId}
                          </p>
                          <p className="text-sm text-gray-600">
                            Secure payment processed via TiloPay
                          </p>
                        </div>
                      ) : paymentInfo.paymentMethod === 'card' ? (
                        <div>
                          <p className="flex items-center">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Credit Card
                          </p>
                          <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                          <p>{paymentInfo.cardholderName}</p>
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
                      onClick={() => setCurrentStep('payment')}
                      className="flex-1"
                    >
                      Back to Payment
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : `Place Order - ${formatPrice(total, tenant)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
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
                    <span className="text-green-600">Free</span>
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
          </div>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useToast } from '@/lib/contexts/toast-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { 
  CreditCard, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'

interface PaymentMethodConfig {
  id: string
  name: string
  enabled: boolean
  requiresKeys: boolean
  keys?: {
    publishableKey?: string
    secretKey?: string
    webhookSecret?: string
  }
  description: string
  icon: React.ComponentType<{ className?: string }>
  fees?: string
  testMode?: boolean
}

export default function PaymentMethodsPage() {
  const { tenant } = useTenant()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      enabled: true,
      requiresKeys: true,
      keys: {
        publishableKey: '',
        secretKey: '',
        webhookSecret: ''
      },
      description: 'Accept credit cards, debit cards, and digital wallets with Stripe\'s secure payment processing.',
      icon: CreditCard,
      fees: '2.9% + 30¢ per transaction',
      testMode: true
    },
    {
      id: 'traditional',
      name: 'Traditional Card Form',
      enabled: true,
      requiresKeys: false,
      description: 'Basic card form for manual payment processing. Requires manual payment handling.',
      icon: CreditCard,
      fees: 'Depends on your payment processor'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      enabled: false,
      requiresKeys: true,
      keys: {
        publishableKey: '',
        secretKey: ''
      },
      description: 'Accept PayPal payments and credit cards through PayPal\'s platform.',
      icon: CreditCard,
      fees: '2.9% + fixed fee per transaction'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      enabled: false,
      requiresKeys: false,
      description: 'Accept Apple Pay payments on Safari and iOS devices.',
      icon: CreditCard,
      fees: 'No additional fees (requires Stripe or similar)'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      enabled: false,
      requiresKeys: false,
      description: 'Accept Google Pay payments on supported browsers and Android devices.',
      icon: CreditCard,
      fees: 'No additional fees (requires Stripe or similar)'
    }
  ])

  // Load payment methods configuration
  useEffect(() => {
    const loadPaymentMethodsConfig = async () => {
      if (!tenant?.id) return
      
      try {
        // In a real app, you would load the configuration from your database
        // For now, we'll use localStorage as a demo
        const saved = localStorage.getItem(`payment-methods-${tenant.id}`)
        if (saved) {
          const savedConfig = JSON.parse(saved)
          setPaymentMethods(prev => prev.map(method => {
            const savedMethod = savedConfig.find((s: any) => s.id === method.id)
            return savedMethod ? { ...method, ...savedMethod } : method
          }))
        }
      } catch (err) {
        console.error('Error loading payment methods config:', err)
      }
    }

    loadPaymentMethodsConfig()
  }, [tenant?.id])

  const togglePaymentMethod = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, enabled: !method.enabled }
        : method
    ))
  }

  const updatePaymentMethodKeys = (methodId: string, keyType: string, value: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { 
            ...method, 
            keys: { 
              ...method.keys, 
              [keyType]: value 
            }
          }
        : method
    ))
  }

  const toggleTestMode = (methodId: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { ...method, testMode: !method.testMode }
        : method
    ))
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const validateStripeKeys = (keys: any) => {
    if (!keys.publishableKey || !keys.secretKey) {
      return { valid: false, message: 'Both publishable and secret keys are required' }
    }
    
    const isTestMode = keys.publishableKey.startsWith('pk_test_') && keys.secretKey.startsWith('sk_test_')
    const isLiveMode = keys.publishableKey.startsWith('pk_live_') && keys.secretKey.startsWith('sk_live_')
    
    if (!isTestMode && !isLiveMode) {
      return { valid: false, message: 'Invalid key format. Keys should start with pk_test_/sk_test_ or pk_live_/sk_live_' }
    }
    
    if (isTestMode && isLiveMode) {
      return { valid: false, message: 'Publishable and secret keys must be from the same mode (test or live)' }
    }
    
    return { valid: true, message: isTestMode ? 'Test mode keys detected' : 'Live mode keys detected' }
  }

  const saveConfiguration = async () => {
    setLoading(true)
    
    try {
      // Validate enabled payment methods
      const enabledMethods = paymentMethods.filter(method => method.enabled)
      
      if (enabledMethods.length === 0) {
        error('No Payment Methods', 'You must enable at least one payment method')
        setLoading(false)
        return
      }

      // Validate Stripe configuration if enabled
      const stripeMethod = paymentMethods.find(method => method.id === 'stripe' && method.enabled)
      if (stripeMethod && stripeMethod.keys) {
        const validation = validateStripeKeys(stripeMethod.keys)
        if (!validation.valid) {
          error('Stripe Configuration Error', validation.message)
          setLoading(false)
          return
        }
      }

      // Save to localStorage (in a real app, save to database)
      localStorage.setItem(`payment-methods-${tenant?.id}`, JSON.stringify(paymentMethods))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      success(
        'Payment Methods Updated',
        'Your payment configuration has been saved successfully'
      )
    } catch (err) {
      error(
        'Save Failed',
        'There was an error saving your payment configuration'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
        <p className="text-gray-600">
          Configure and manage payment methods for your store. Enable the payment options you want to offer your customers.
        </p>
      </div>

      {/* Payment Methods Configuration */}
      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          const stripeValidation = method.id === 'stripe' && method.keys ? validateStripeKeys(method.keys) : null
          
          return (
            <Card key={method.id} className={`transition-all ${method.enabled ? 'ring-2 ring-blue-200' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${method.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${method.enabled ? 'text-blue-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{method.name}</span>
                        {method.enabled && <Badge variant="default">Enabled</Badge>}
                        {method.testMode && <Badge variant="outline">Test Mode</Badge>}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      {method.fees && (
                        <p className="text-xs text-gray-500 mt-1">Fees: {method.fees}</p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={() => togglePaymentMethod(method.id)}
                  />
                </div>
              </CardHeader>

              {method.enabled && method.requiresKeys && (
                <CardContent className="border-t bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="w-4 h-4 text-gray-600" />
                      <h3 className="font-medium">Configuration</h3>
                    </div>

                    {method.id === 'stripe' && (
                      <>
                        {/* Test Mode Toggle */}
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div>
                            <Label className="font-medium">Test Mode</Label>
                            <p className="text-sm text-gray-600">Use test keys for development and testing</p>
                          </div>
                          <Switch
                            checked={method.testMode || false}
                            onCheckedChange={() => toggleTestMode(method.id)}
                          />
                        </div>

                        {/* API Keys */}
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor={`${method.id}-publishable`}>
                              Publishable Key *
                              <span className="text-xs text-gray-500 ml-1">
                                (Safe to use in frontend code)
                              </span>
                            </Label>
                            <Input
                              id={`${method.id}-publishable`}
                              type="text"
                              placeholder={method.testMode ? 'pk_test_...' : 'pk_live_...'}
                              value={method.keys?.publishableKey || ''}
                              onChange={(e) => updatePaymentMethodKeys(method.id, 'publishableKey', e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${method.id}-secret`}>
                                Secret Key *
                                <span className="text-xs text-gray-500 ml-1">
                                  (Keep this secure and private)
                                </span>
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(`${method.id}-secret`)}
                              >
                                {showSecrets[`${method.id}-secret`] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <Input
                              id={`${method.id}-secret`}
                              type={showSecrets[`${method.id}-secret`] ? 'text' : 'password'}
                              placeholder={method.testMode ? 'sk_test_...' : 'sk_live_...'}
                              value={method.keys?.secretKey || ''}
                              onChange={(e) => updatePaymentMethodKeys(method.id, 'secretKey', e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor={`${method.id}-webhook`}>
                                Webhook Secret
                                <span className="text-xs text-gray-500 ml-1">
                                  (Optional, for webhook verification)
                                </span>
                              </Label>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(`${method.id}-webhook`)}
                              >
                                {showSecrets[`${method.id}-webhook`] ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                            <Input
                              id={`${method.id}-webhook`}
                              type={showSecrets[`${method.id}-webhook`] ? 'text' : 'password'}
                              placeholder="whsec_..."
                              value={method.keys?.webhookSecret || ''}
                              onChange={(e) => updatePaymentMethodKeys(method.id, 'webhookSecret', e.target.value)}
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>

                        {/* Validation Status */}
                        {stripeValidation && method.keys?.publishableKey && method.keys?.secretKey && (
                          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                            stripeValidation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {stripeValidation.valid ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <AlertTriangle className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">{stripeValidation.message}</span>
                          </div>
                        )}

                        {/* Stripe Setup Instructions */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-blue-900 mb-2">How to get your Stripe keys:</p>
                              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                                <li>Go to your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a></li>
                                <li>Navigate to "Developers" → "API keys"</li>
                                <li>Copy your publishable and secret keys</li>
                                <li>Use test keys for development, live keys for production</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {method.id === 'paypal' && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`${method.id}-client-id`}>PayPal Client ID *</Label>
                          <Input
                            id={`${method.id}-client-id`}
                            type="text"
                            placeholder="Your PayPal Client ID"
                            value={method.keys?.publishableKey || ''}
                            onChange={(e) => updatePaymentMethodKeys(method.id, 'publishableKey', e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${method.id}-client-secret`}>PayPal Client Secret *</Label>
                          <Input
                            id={`${method.id}-client-secret`}
                            type={showSecrets[`${method.id}-secret`] ? 'text' : 'password'}
                            placeholder="Your PayPal Client Secret"
                            value={method.keys?.secretKey || ''}
                            onChange={(e) => updatePaymentMethodKeys(method.id, 'secretKey', e.target.value)}
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button
          onClick={saveConfiguration}
          disabled={loading}
          size="lg"
        >
          {loading ? 'Saving...' : 'Save Payment Configuration'}
        </Button>
      </div>

      {/* Information Card */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <h3 className="font-medium text-yellow-900 mb-1">Important Notes</h3>
              <ul className="space-y-1 text-yellow-800">
                <li>• Always use test keys during development and testing</li>
                <li>• Keep your secret keys secure and never expose them in client-side code</li>
                <li>• Customers will only see enabled payment methods during checkout</li>
                <li>• Some payment methods may require additional verification or approval</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
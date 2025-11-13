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
  bankDetails?: {
    bankName?: string
    accountNumber?: string
    accountHolder?: string
    instructions?: string
  }
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
      id: 'bank_transfer',
      name: 'Bank Transfer',
      enabled: false,
      requiresKeys: false,
      description: 'Allow customers to pay via direct bank transfer. Provide bank account details and instructions.',
      icon: Shield,
      bankDetails: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        instructions: ''
      }
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

              {/* Bank Transfer Details */}
              {method.id === 'bank_transfer' && method.enabled && (
                <CardContent className="border-t bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input
                        id="bank-name"
                        type="text"
                        placeholder="Your Bank Name"
                        value={method.bankDetails?.bankName || ''}
                        onChange={e => setPaymentMethods(prev => prev.map(m => m.id === 'bank_transfer' ? { ...m, bankDetails: { ...m.bankDetails, bankName: e.target.value } } : m))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-number">Account Number</Label>
                      <Input
                        id="account-number"
                        type="text"
                        placeholder="1234567890"
                        value={method.bankDetails?.accountNumber || ''}
                        onChange={e => setPaymentMethods(prev => prev.map(m => m.id === 'bank_transfer' ? { ...m, bankDetails: { ...m.bankDetails, accountNumber: e.target.value } } : m))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="account-holder">Account Holder</Label>
                      <Input
                        id="account-holder"
                        type="text"
                        placeholder="John Doe"
                        value={method.bankDetails?.accountHolder || ''}
                        onChange={e => setPaymentMethods(prev => prev.map(m => m.id === 'bank_transfer' ? { ...m, bankDetails: { ...m.bankDetails, accountHolder: e.target.value } } : m))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank-instructions">Instructions</Label>
                      <Textarea
                        id="bank-instructions"
                        placeholder="Please transfer the total amount and include your order number."
                        value={method.bankDetails?.instructions || ''}
                        onChange={e => setPaymentMethods(prev => prev.map(m => m.id === 'bank_transfer' ? { ...m, bankDetails: { ...m.bankDetails, instructions: e.target.value } } : m))}
                        className="text-sm"
                      />
                    </div>
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
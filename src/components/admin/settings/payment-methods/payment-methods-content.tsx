'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useSettings } from '@/lib/contexts/settings-context'
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
  AlertTriangle
} from 'lucide-react'
import { SettingsMessage } from '@/components/admin/settings/settings-message'

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
  bankDetails?: {
    bankName?: string
    accountNumber?: string
    accountHolder?: string
    instructions?: string
  }
}

export function PaymentMethodsContent() {
  const { tenant } = useTenant()
  const { state, setSaving, showSuccess, showError } = useSettings()
  
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
      fees: '2.9% + 30¢ per transaction'
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
      id: 'tilopay',
      name: 'TiloPay',
      enabled: false,
      requiresKeys: true,
      keys: {
        publishableKey: '',
        secretKey: ''
      },
      description: 'Accept payments in Costa Rica with TiloPay\'s local payment processing.',
      icon: CreditCard,
      fees: 'Varies by payment method'
    },
    {
      id: 'mobile_bank_transfer',
      name: 'Mobile Bank Transfer',
      enabled: false,
      requiresKeys: false,
      description: 'Accept mobile bank transfers like SINPE Móvil in Costa Rica.',
      icon: Shield,
      bankDetails: {
        accountHolder: '',
        instructions: ''
      }
    }
  ])

  // Load payment methods configuration
  useEffect(() => {
    const loadPaymentMethodsConfig = async () => {
      if (!tenant?.id) return
      
      try {
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

  const updateBankDetails = (methodId: string, field: string, value: string) => {
    setPaymentMethods(prev => prev.map(method => 
      method.id === methodId 
        ? { 
            ...method, 
            bankDetails: { 
              ...method.bankDetails, 
              [field]: value 
            }
          }
        : method
    ))
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
    
    return { valid: true, message: isTestMode ? 'Test mode keys detected' : 'Live mode keys detected' }
  }

  const saveConfiguration = async () => {
    setSaving(true)
    
    try {
      // Validate enabled payment methods
      const enabledMethods = paymentMethods.filter(method => method.enabled)
      
      if (enabledMethods.length === 0) {
        showError('You must enable at least one payment method')
        return
      }

      // Validate Stripe configuration if enabled
      const stripeMethod = paymentMethods.find(method => method.id === 'stripe' && method.enabled)
      if (stripeMethod && stripeMethod.keys) {
        const validation = validateStripeKeys(stripeMethod.keys)
        if (!validation.valid) {
          showError(`Stripe Configuration Error: ${validation.message}`)
          return
        }
      }

      // Save to localStorage (in a real app, save to database)
      localStorage.setItem(`payment-methods-${tenant?.id}`, JSON.stringify(paymentMethods))
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccess('Payment configuration saved successfully!')
    } catch (err) {
      showError('There was an error saving your payment configuration')
    } finally {
      setSaving(false)
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

      {/* Message */}
      <SettingsMessage />

      {/* Payment Methods Configuration */}
      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon
          
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

              {/* Stripe Configuration */}
              {method.id === 'stripe' && method.enabled && (
                <CardContent className="border-t bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stripe-publishable">Publishable Key</Label>
                      <Input
                        id="stripe-publishable"
                        type="text"
                        placeholder="pk_test_..."
                        value={method.keys?.publishableKey || ''}
                        onChange={e => updatePaymentMethodKeys('stripe', 'publishableKey', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stripe-secret">Secret Key</Label>
                      <Input
                        id="stripe-secret"
                        type="password"
                        placeholder="sk_test_..."
                        value={method.keys?.secretKey || ''}
                        onChange={e => updatePaymentMethodKeys('stripe', 'secretKey', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              )}

              {/* TiloPay Configuration */}
              {method.id === 'tilopay' && method.enabled && (
                <CardContent className="border-t bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tilopay-api">API Key</Label>
                      <Input
                        id="tilopay-api"
                        type="text"
                        placeholder="Your TiloPay API key"
                        value={method.keys?.publishableKey || ''}
                        onChange={e => updatePaymentMethodKeys('tilopay', 'publishableKey', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tilopay-secret">Secret Key</Label>
                      <Input
                        id="tilopay-secret"
                        type="password"
                        placeholder="Your TiloPay secret key"
                        value={method.keys?.secretKey || ''}
                        onChange={e => updatePaymentMethodKeys('tilopay', 'secretKey', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              )}

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
                        onChange={e => updateBankDetails('bank_transfer', 'bankName', e.target.value)}
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
                        onChange={e => updateBankDetails('bank_transfer', 'accountNumber', e.target.value)}
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
                        onChange={e => updateBankDetails('bank_transfer', 'accountHolder', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bank-instructions">Instructions</Label>
                      <Textarea
                        id="bank-instructions"
                        placeholder="Please transfer the total amount and include your order number."
                        value={method.bankDetails?.instructions || ''}
                        onChange={e => updateBankDetails('bank_transfer', 'instructions', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              )}

              {/* Mobile Bank Transfer Details */}
              {method.id === 'mobile_bank_transfer' && method.enabled && (
                <CardContent className="border-t bg-orange-50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mobile-holder">Account Holder / Phone</Label>
                      <Input
                        id="mobile-holder"
                        type="text"
                        placeholder="+506 1234-5678"
                        value={method.bankDetails?.accountHolder || ''}
                        onChange={e => updateBankDetails('mobile_bank_transfer', 'accountHolder', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile-instructions">Instructions</Label>
                      <Textarea
                        id="mobile-instructions"
                        placeholder="Please send the payment via SINPE Móvil and include your order number."
                        value={method.bankDetails?.instructions || ''}
                        onChange={e => updateBankDetails('mobile_bank_transfer', 'instructions', e.target.value)}
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
          disabled={state.saving}
          size="lg"
        >
          {state.saving ? 'Saving...' : 'Save Payment Configuration'}
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
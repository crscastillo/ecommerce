'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, EyeOff, CreditCard, Shield } from 'lucide-react'
import { PaymentSettings, PaymentMethodConfig } from './index'
import { FeatureFlagsService, PaymentMethodFlags } from '@/lib/services/feature-flags'

interface PaymentsTabProps {
  paymentMethods: PaymentSettings
  onPaymentMethodsChange: (settings: PaymentSettings) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function PaymentsTab({ 
  paymentMethods, 
  onPaymentMethodsChange, 
  onSave, 
  saving 
}: PaymentsTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})
  const [enabledFlags, setEnabledFlags] = useState<PaymentMethodFlags>({
    stripe: false,
    tilopay: false,
    bank_transfer: false,
    mobile_bank_transfer: false
  })

  useEffect(() => {
    const loadFlags = async () => {
      try {
        const flags = await FeatureFlagsService.getEnabledPaymentMethods()
        setEnabledFlags(flags)
      } catch (error) {
        console.error('Failed to load payment method flags:', error)
      }
    }
    loadFlags()
  }, [])

  const getPaymentMethod = (id: string) => {
    return paymentMethods.find(method => method.id === id)
  }

  const updatePaymentMethod = (id: string, updates: Partial<PaymentMethodConfig>) => {
    const updatedMethods = paymentMethods.map(method => 
      method.id === id ? { ...method, ...updates } : method
    )
    onPaymentMethodsChange(updatedMethods)
  }

  const updatePaymentMethodKey = (id: string, keyName: string, value: string) => {
    const method = getPaymentMethod(id)
    if (!method) return

    const updatedKeys = { ...method.keys, [keyName]: value }
    updatePaymentMethod(id, { keys: updatedKeys })
  }

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const stripeMethod = getPaymentMethod('stripe')
  const tilopayMethod = getPaymentMethod('tilopay')
  const bankTransferMethod = getPaymentMethod('bank_transfer')
  const mobileBankTransferMethod = getPaymentMethod('mobile_bank_transfer')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.paymentMethods')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('descriptions.paymentMethods')}
        </p>
      </CardHeader>
      <CardContent>
        {/* Stripe */}
        {enabledFlags.stripe && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><CreditCard /></div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  Stripe
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Pro+</Badge>
                </h3>
                <p className="text-sm text-gray-500">Accept credit cards and digital wallets via Stripe.</p>
              </div>
            </div>
            <Switch
              checked={stripeMethod?.enabled || false}
              onCheckedChange={(checked) => {
                const updatedMethods = paymentMethods.map(method => 
                  method.id === 'stripe' ? { ...method, enabled: checked } : method
                )
                onPaymentMethodsChange(updatedMethods)
              }}
            />
          </div>
          {stripeMethod?.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="stripe-publishable-key" className="text-sm">Publishable Key</Label>
                  <Input
                    id="stripe-publishable-key"
                    value={stripeMethod?.keys?.publishableKey || ''}
                    onChange={(e) => updatePaymentMethodKey('stripe', 'publishableKey', e.target.value)}
                    placeholder="pk_test_..."
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-secret-key" className="text-sm">Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    value={stripeMethod?.keys?.secretKey || ''}
                    onChange={(e) => updatePaymentMethodKey('stripe', 'secretKey', e.target.value)}
                    placeholder="sk_test_..."
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* TiloPay */}
        {enabledFlags.tilopay && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">🏦</div>
              <div>
                <h3 className="font-medium flex items-center gap-2">
                  TiloPay
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Pro+</Badge>
                </h3>
                <p className="text-sm text-gray-500">Accept payments via TiloPay.</p>
              </div>
            </div>
            <Switch
              checked={tilopayMethod?.enabled || false}
              onCheckedChange={(checked) => {
                const updatedMethods = paymentMethods.map(method => 
                  method.id === 'tilopay' ? { ...method, enabled: checked } : method
                )
                onPaymentMethodsChange(updatedMethods)
              }}
            />
          </div>
          {tilopayMethod?.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="tilopay-api-key" className="text-sm">API Key</Label>
                  <Input
                    id="tilopay-api-key"
                    value={tilopayMethod?.keys?.publishableKey || ''}
                    onChange={(e) => updatePaymentMethodKey('tilopay', 'publishableKey', e.target.value)}
                    placeholder="Your TiloPay API key"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="tilopay-secret-key" className="text-sm">Secret Key</Label>
                  <Input
                    id="tilopay-secret-key"
                    value={tilopayMethod?.keys?.secretKey || ''}
                    onChange={(e) => updatePaymentMethodKey('tilopay', 'secretKey', e.target.value)}
                    placeholder="Your TiloPay secret key"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Bank Transfer */}
        {enabledFlags.bank_transfer && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">🏦</div>
              <div>
                <h3 className="font-medium">Bank Transfer</h3>
                <p className="text-sm text-gray-500">Enable customers to pay via direct bank transfer. Provide bank details and instructions below.</p>
              </div>
            </div>
            <Switch
              checked={bankTransferMethod?.enabled || false}
              onCheckedChange={(checked) => {
                const updatedMethods = paymentMethods.map(method => 
                  method.id === 'bank_transfer' ? { ...method, enabled: checked } : method
                )
                onPaymentMethodsChange(updatedMethods)
              }}
            />
          </div>
          {bankTransferMethod?.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="bank-name" className="text-sm">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={bankTransferMethod?.bankDetails?.bankName || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, bankName: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="Your Bank Name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="account-number" className="text-sm">Account Number</Label>
                  <Input
                    id="account-number"
                    value={bankTransferMethod?.bankDetails?.accountNumber || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, accountNumber: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="1234567890"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="account-holder" className="text-sm">Account Holder</Label>
                  <Input
                    id="account-holder"
                    value={bankTransferMethod?.bankDetails?.accountHolder || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, accountHolder: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="John Doe"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-instructions" className="text-sm">Instructions</Label>
                  <Input
                    id="bank-instructions"
                    value={bankTransferMethod?.bankDetails?.instructions || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, instructions: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="Please transfer the total amount and include your order number."
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Mobile Bank Transfer (SINPE Movil) */}
        {enabledFlags.mobile_bank_transfer && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">📱</div>
              <div>
                <h3 className="font-medium">Mobile Bank Transfer</h3>
                <p className="text-sm text-gray-500">Enable customers to pay via mobile bank transfer (e.g., SINPE Movil in Costa Rica). Specify your phone number and instructions below.</p>
              </div>
            </div>
            <Switch
              checked={mobileBankTransferMethod?.enabled || false}
              onCheckedChange={(checked) => {
                const updatedMethods = paymentMethods.map(method => 
                  method.id === 'mobile_bank_transfer' ? { ...method, enabled: checked } : method
                )
                onPaymentMethodsChange(updatedMethods)
              }}
            />
          </div>
          {mobileBankTransferMethod?.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-orange-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="mobile-phone-number" className="text-sm">Phone Number</Label>
                  <Input
                    id="mobile-phone-number"
                    value={mobileBankTransferMethod?.bankDetails?.phoneNumber || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'mobile_bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, phoneNumber: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="+506XXXXXXXX"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile-instructions" className="text-sm">Instructions</Label>
                  <Input
                    id="mobile-instructions"
                    value={mobileBankTransferMethod?.bankDetails?.instructions || ''}
                    onChange={(e) => {
                      const updatedMethods = paymentMethods.map(method => 
                        method.id === 'mobile_bank_transfer' 
                          ? { ...method, bankDetails: { ...method.bankDetails, instructions: e.target.value } }
                          : method
                      )
                      onPaymentMethodsChange(updatedMethods)
                    }}
                    placeholder="Please transfer the total amount and include your order number."
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        <div className="flex justify-end mt-6">
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? tCommon('saving') : tCommon('savePaymentSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

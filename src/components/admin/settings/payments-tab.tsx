'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, EyeOff, CreditCard } from 'lucide-react'
import { PaymentSettings } from './index'
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
  const [enabledFlags, setEnabledFlags] = useState<PaymentMethodFlags>({
    cash_on_delivery: true,
    stripe: true,
    tilopay: true,
    bank_transfer: true,
    mobile_bank_transfer: true
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeatureFlags()
  }, [])

  const loadFeatureFlags = async () => {
    try {
      setLoading(true)
      const flags = await FeatureFlagsService.getEnabledPaymentMethods()
      setEnabledFlags(flags)
    } catch (error) {
      console.error('Error loading feature flags:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.paymentMethods')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading payment methods...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.paymentMethods')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('descriptions.paymentMethods')}
        </p>
      </CardHeader>
      <CardContent>
        {/* Cash on Delivery */}
        {enabledFlags.cash_on_delivery && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">💵</div>
              <div>
                <h3 className="font-medium">Cash on Delivery</h3>
                <p className="text-sm text-gray-500">Allow customers to pay with cash upon delivery.</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.cash_on_delivery.enabled}
              onCheckedChange={(checked) => onPaymentMethodsChange({
                ...paymentMethods,
                cash_on_delivery: { ...paymentMethods.cash_on_delivery, enabled: checked }
              })}
            />
          </div>
        </div>
        )}

        {/* Stripe */}
        {enabledFlags.stripe && (
        <div className="border rounded-lg mb-6">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><CreditCard /></div>
              <div>
                <h3 className="font-medium">Stripe</h3>
                <p className="text-sm text-gray-500">Accept credit cards and digital wallets via Stripe.</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.stripe.enabled}
              onCheckedChange={(checked) => onPaymentMethodsChange({
                ...paymentMethods,
                stripe: { ...paymentMethods.stripe, enabled: checked }
              })}
            />
          </div>
          {paymentMethods.stripe.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="stripe-publishable-key" className="text-sm">Publishable Key</Label>
                  <Input
                    id="stripe-publishable-key"
                    value={paymentMethods.stripe.stripe_publishable_key || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      stripe: { ...paymentMethods.stripe, stripe_publishable_key: e.target.value }
                    })}
                    placeholder="pk_test_..."
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="stripe-secret-key" className="text-sm">Secret Key</Label>
                  <Input
                    id="stripe-secret-key"
                    value={paymentMethods.stripe.stripe_secret_key || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      stripe: { ...paymentMethods.stripe, stripe_secret_key: e.target.value }
                    })}
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
                <h3 className="font-medium">TiloPay</h3>
                <p className="text-sm text-gray-500">Accept payments via TiloPay.</p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.tilopay.enabled}
              onCheckedChange={(checked) => onPaymentMethodsChange({
                ...paymentMethods,
                tilopay: { ...paymentMethods.tilopay, enabled: checked }
              })}
            />
          </div>
          {paymentMethods.tilopay.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="tilopay-api-key" className="text-sm">API Key</Label>
                  <Input
                    id="tilopay-api-key"
                    value={paymentMethods.tilopay.tilopay_api_key || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      tilopay: { ...paymentMethods.tilopay, tilopay_api_key: e.target.value }
                    })}
                    placeholder="Your TiloPay API key"
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="tilopay-secret-key" className="text-sm">Secret Key</Label>
                  <Input
                    id="tilopay-secret-key"
                    value={paymentMethods.tilopay.tilopay_secret_key || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      tilopay: { ...paymentMethods.tilopay, tilopay_secret_key: e.target.value }
                    })}
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
              checked={paymentMethods.bank_transfer.enabled}
              onCheckedChange={(checked) => onPaymentMethodsChange({
                ...paymentMethods,
                bank_transfer: { ...paymentMethods.bank_transfer, enabled: checked }
              })}
            />
          </div>
          {paymentMethods.bank_transfer.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="bank-name" className="text-sm">Bank Name</Label>
                  <Input
                    id="bank-name"
                    value={paymentMethods.bank_transfer.bank_name || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      bank_transfer: { ...paymentMethods.bank_transfer, bank_name: e.target.value }
                    })}
                    placeholder="Your Bank Name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="account-number" className="text-sm">Account Number</Label>
                  <Input
                    id="account-number"
                    value={paymentMethods.bank_transfer.account_number || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      bank_transfer: { ...paymentMethods.bank_transfer, account_number: e.target.value }
                    })}
                    placeholder="1234567890"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="account-holder" className="text-sm">Account Holder</Label>
                  <Input
                    id="account-holder"
                    value={paymentMethods.bank_transfer.account_holder || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      bank_transfer: { ...paymentMethods.bank_transfer, account_holder: e.target.value }
                    })}
                    placeholder="John Doe"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="bank-instructions" className="text-sm">Instructions</Label>
                  <Input
                    id="bank-instructions"
                    value={paymentMethods.bank_transfer.instructions || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      bank_transfer: { ...paymentMethods.bank_transfer, instructions: e.target.value }
                    })}
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
              checked={paymentMethods.mobile_bank_transfer.enabled}
              onCheckedChange={(checked) => onPaymentMethodsChange({
                ...paymentMethods,
                mobile_bank_transfer: { ...paymentMethods.mobile_bank_transfer, enabled: checked }
              })}
            />
          </div>
          {paymentMethods.mobile_bank_transfer.enabled && (
            <div className="px-4 pb-4 space-y-4 border-t bg-orange-50">
              <div className="space-y-3 pt-4">
                <div>
                  <Label htmlFor="mobile-phone-number" className="text-sm">Phone Number</Label>
                  <Input
                    id="mobile-phone-number"
                    value={paymentMethods.mobile_bank_transfer.phone_number || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      mobile_bank_transfer: { ...paymentMethods.mobile_bank_transfer, phone_number: e.target.value }
                    })}
                    placeholder="+506XXXXXXXX"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="mobile-instructions" className="text-sm">Instructions</Label>
                  <Input
                    id="mobile-instructions"
                    value={paymentMethods.mobile_bank_transfer.instructions || ''}
                    onChange={(e) => onPaymentMethodsChange({
                      ...paymentMethods,
                      mobile_bank_transfer: { ...paymentMethods.mobile_bank_transfer, instructions: e.target.value }
                    })}
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

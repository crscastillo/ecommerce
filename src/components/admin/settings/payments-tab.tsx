'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Eye, EyeOff, CreditCard } from 'lucide-react'
import { PaymentSettings } from './index'

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
  const [showStripeKeys, setShowStripeKeys] = useState(false)
  const [showTiloPayKeys, setShowTiloPayKeys] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.paymentMethods')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('descriptions.paymentMethods')}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cash on Delivery */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              💵
            </div>
            <div>
              <h3 className="font-medium">{t('paymentMethods.cashOnDelivery.name')}</h3>
              <p className="text-sm text-gray-500">
                {t('paymentMethods.cashOnDelivery.description')}
              </p>
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

        {/* Stripe */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{t('paymentMethods.stripe.name')}</h3>
                <p className="text-sm text-gray-500">
                  {t('paymentMethods.stripe.description')}
                </p>
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
              <div className="flex items-center justify-between pt-4">
                <Label className="text-sm font-medium">API Keys</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStripeKeys(!showStripeKeys)}
                >
                  {showStripeKeys ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      {t('paymentMethods.hideKeys')}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('paymentMethods.showKeys')}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="stripe-publishable-key" className="text-sm">
                    {t('paymentMethods.publishableKey')}
                  </Label>
                  <Input
                    id="stripe-publishable-key"
                    type={showStripeKeys ? "text" : "password"}
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
                  <Label htmlFor="stripe-secret-key" className="text-sm">
                    {t('paymentMethods.secretKey')}
                  </Label>
                  <Input
                    id="stripe-secret-key"
                    type={showStripeKeys ? "text" : "password"}
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

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Stripe API Keys</p>
                    <p className="text-blue-700">
                      Get your API keys from the{' '}
                      <a 
                        href="https://dashboard.stripe.com/apikeys" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Stripe Dashboard
                      </a>
                      . Use test keys for testing and live keys for production.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TiloPay */}
        <div className="border rounded-lg">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                🏦
              </div>
              <div>
                <h3 className="font-medium">{t('paymentMethods.tilopay.name')}</h3>
                <p className="text-sm text-gray-500">
                  {t('paymentMethods.tilopay.description')}
                </p>
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
              <div className="flex items-center justify-between pt-4">
                <Label className="text-sm font-medium">API Keys</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTiloPayKeys(!showTiloPayKeys)}
                >
                  {showTiloPayKeys ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      {t('paymentMethods.hideKeys')}
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      {t('paymentMethods.showKeys')}
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="tilopay-api-key" className="text-sm">
                    {t('paymentMethods.apiKey')}
                  </Label>
                  <Input
                    id="tilopay-api-key"
                    type={showTiloPayKeys ? "text" : "password"}
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
                  <Label htmlFor="tilopay-secret-key" className="text-sm">
                    {t('paymentMethods.secretKey')}
                  </Label>
                  <Input
                    id="tilopay-secret-key"
                    type={showTiloPayKeys ? "text" : "password"}
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

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-green-900">TiloPay API Keys</p>
                    <p className="text-green-700">
                      Get your API keys from the{' '}
                      <a 
                        href="https://portal.tilopay.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        TiloPay Portal
                      </a>
                      . {t('paymentMethods.tilopaySupports')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? tCommon('saving') : tCommon('savePaymentSettings')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

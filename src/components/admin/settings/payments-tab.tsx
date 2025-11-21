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
import { PaymentSettings, PaymentMethodConfig } from './index'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.paymentMethods')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('descriptions.paymentMethods')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const getIcon = (methodId: string) => {
              switch (methodId) {
                case 'stripe': return <CreditCard className="h-6 w-6" />
                case 'traditional': return <div className="text-xl">💰</div>
                case 'tilopay': return <div className="text-xl">🇨🇷</div>
                case 'paypal': return <CreditCard className="h-6 w-6" />
                case 'apple_pay': return <div className="text-xl">🍎</div>
                case 'google_pay': return <div className="text-xl">🎯</div>
                case 'bank_transfer': return <div className="text-xl">🏦</div>
                case 'mobile_bank_transfer': return <div className="text-xl">📱</div>
                default: return <CreditCard className="h-6 w-6" />
              }
            }

            const getBadgeColor = (methodId: string) => {
              switch (methodId) {
                case 'stripe': return 'bg-blue-100 text-blue-800'
                case 'tilopay': return 'bg-orange-100 text-orange-800'
                case 'paypal': return 'bg-purple-100 text-purple-800'
                default: return 'bg-gray-100 text-gray-800'
              }
            }

            const getDescription = (methodId: string) => {
              switch (methodId) {
                case 'traditional': return 'Accept traditional card payments and cash on delivery'
                case 'stripe': return 'Accept credit cards and digital wallets via Stripe'
                case 'tilopay': return 'Accept payments via TiloPay gateway (Costa Rica)'
                case 'paypal': return 'Accept PayPal payments and credit cards'
                case 'apple_pay': return 'Accept Apple Pay payments on Safari and iOS devices'
                case 'google_pay': return 'Accept Google Pay payments on supported browsers'
                case 'bank_transfer': return 'Allow customers to pay via direct bank transfer'
                case 'mobile_bank_transfer': return 'Allow customers to pay via mobile bank transfer'
                default: return 'Payment method configuration'
              }
            }

            return (
              <div key={method.id} className={`border rounded-lg transition-all ${method.enabled ? 'ring-2 ring-blue-200' : ''}`}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      method.enabled ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getIcon(method.id)}
                    </div>
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {method.name}
                        {method.enabled && <Badge variant="default">Enabled</Badge>}
                        {method.testMode && <Badge variant="outline">Test Mode</Badge>}
                        {(method.id === 'stripe' || method.id === 'tilopay') && (
                          <Badge className={`text-xs ${getBadgeColor(method.id)}`}>Pro+</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getDescription(method.id)}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={(checked) => updatePaymentMethod(method.id, { enabled: checked })}
                  />
                </div>

                {/* Payment Method Configuration */}
                {method.enabled && method.requiresKeys && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                    <div className="space-y-3 pt-4">
                      {method.id === 'stripe' && (
                        <>
                          <div>
                            <Label htmlFor={`${method.id}-pk`} className="text-sm">Publishable Key</Label>
                            <Input
                              id={`${method.id}-pk`}
                              value={method.keys?.publishableKey || ''}
                              onChange={(e) => updatePaymentMethodKey(method.id, 'publishableKey', e.target.value)}
                              placeholder="pk_test_..."
                              className="font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${method.id}-sk`} className="text-sm">Secret Key</Label>
                            <div className="relative">
                              <Input
                                id={`${method.id}-sk`}
                                type={showSecrets[`${method.id}-sk`] ? 'text' : 'password'}
                                value={method.keys?.secretKey || ''}
                                onChange={(e) => updatePaymentMethodKey(method.id, 'secretKey', e.target.value)}
                                placeholder="sk_test_..."
                                className="font-mono text-sm pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleSecretVisibility(`${method.id}-sk`)}
                              >
                                {showSecrets[`${method.id}-sk`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {method.id === 'tilopay' && (
                        <>
                          <div>
                            <Label htmlFor={`${method.id}-api`} className="text-sm">API Key</Label>
                            <Input
                              id={`${method.id}-api`}
                              value={method.keys?.publishableKey || ''}
                              onChange={(e) => updatePaymentMethodKey(method.id, 'publishableKey', e.target.value)}
                              placeholder="TiloPay API Key"
                              className="font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${method.id}-secret`} className="text-sm">Secret Key</Label>
                            <div className="relative">
                              <Input
                                id={`${method.id}-secret`}
                                type={showSecrets[`${method.id}-secret`] ? 'text' : 'password'}
                                value={method.keys?.secretKey || ''}
                                onChange={(e) => updatePaymentMethodKey(method.id, 'secretKey', e.target.value)}
                                placeholder="TiloPay Secret Key"
                                className="font-mono text-sm pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleSecretVisibility(`${method.id}-secret`)}
                              >
                                {showSecrets[`${method.id}-secret`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {method.id === 'paypal' && (
                        <>
                          <div>
                            <Label htmlFor={`${method.id}-client`} className="text-sm">Client ID</Label>
                            <Input
                              id={`${method.id}-client`}
                              value={method.keys?.publishableKey || ''}
                              onChange={(e) => updatePaymentMethodKey(method.id, 'publishableKey', e.target.value)}
                              placeholder="PayPal Client ID"
                              className="font-mono text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${method.id}-secret`} className="text-sm">Client Secret</Label>
                            <div className="relative">
                              <Input
                                id={`${method.id}-secret`}
                                type={showSecrets[`${method.id}-secret`] ? 'text' : 'password'}
                                value={method.keys?.secretKey || ''}
                                onChange={(e) => updatePaymentMethodKey(method.id, 'secretKey', e.target.value)}
                                placeholder="PayPal Client Secret"
                                className="font-mono text-sm pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => toggleSecretVisibility(`${method.id}-secret`)}
                              >
                                {showSecrets[`${method.id}-secret`] ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Transfer Details */}
                {method.enabled && method.id === 'bank_transfer' && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                    <div className="space-y-3 pt-4">
                      <div>
                        <Label htmlFor="bank-name" className="text-sm">Bank Name</Label>
                        <Input
                          id="bank-name"
                          value={method.bankDetails?.bankName || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, bankName: e.target.value }
                          })}
                          placeholder="Your Bank Name"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-number" className="text-sm">Account Number</Label>
                        <Input
                          id="account-number"
                          value={method.bankDetails?.accountNumber || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, accountNumber: e.target.value }
                          })}
                          placeholder="1234567890"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-holder" className="text-sm">Account Holder</Label>
                        <Input
                          id="account-holder"
                          value={method.bankDetails?.accountHolder || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, accountHolder: e.target.value }
                          })}
                          placeholder="Account Holder Name"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bank-instructions" className="text-sm">Instructions</Label>
                        <Input
                          id="bank-instructions"
                          value={method.bankDetails?.instructions || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, instructions: e.target.value }
                          })}
                          placeholder="Please transfer the total amount and include your order number."
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Bank Transfer Details */}
                {method.enabled && method.id === 'mobile_bank_transfer' && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                    <div className="space-y-3 pt-4">
                      <div>
                        <Label htmlFor="mobile-bank-phone" className="text-sm">Mobile Bank Phone Number</Label>
                        <Input
                          id="mobile-bank-phone"
                          value={method.bankDetails?.phoneNumber || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, phoneNumber: e.target.value }
                          })}
                          placeholder="+1234567890"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="mobile-bank-instructions" className="text-sm">Instructions</Label>
                        <Input
                          id="mobile-bank-instructions"
                          value={method.bankDetails?.instructions || ''}
                          onChange={(e) => updatePaymentMethod(method.id, {
                            bankDetails: { ...method.bankDetails, instructions: e.target.value }
                          })}
                          placeholder="Please transfer via mobile banking and include your order number."
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

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
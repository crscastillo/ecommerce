'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Save, Truck, Package, Settings as SettingsIcon } from 'lucide-react'

interface ShippingMethod {
  id: string
  name: string
  description: string
  enabled: boolean
  type: 'weight_based' | 'flat_rate' | 'free'
  config: {
    base_rate?: number
    per_kg_rate?: number
    free_threshold?: number
    max_weight?: number
  }
}

interface ShippingTabProps {
  shippingMethods: ShippingMethod[]
  onShippingMethodsChange: (methods: ShippingMethod[]) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function ShippingTab({ 
  shippingMethods, 
  onShippingMethodsChange, 
  onSave, 
  saving 
}: ShippingTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  // Initialize with default weight-based method if no methods exist
  const [methods, setMethods] = useState<ShippingMethod[]>(() => {
    if (shippingMethods.length === 0) {
      return [
        {
          id: 'weight_based',
          name: 'Weight Based Shipping',
          description: 'Calculate shipping costs based on package weight',
          enabled: false,
          type: 'weight_based',
          config: {
            base_rate: 5.00,
            per_kg_rate: 2.50,
            free_threshold: 100.00,
            max_weight: 50
          }
        }
      ]
    }
    return shippingMethods
  })

  const updateMethod = (id: string, updates: Partial<ShippingMethod>) => {
    const updatedMethods = methods.map(method => 
      method.id === id ? { ...method, ...updates } : method
    )
    setMethods(updatedMethods)
    onShippingMethodsChange(updatedMethods)
  }

  const updateMethodConfig = (id: string, configKey: string, value: number) => {
    const method = methods.find(m => m.id === id)
    if (!method) return

    const updatedConfig = { ...method.config, [configKey]: value }
    updateMethod(id, { config: updatedConfig })
  }

  const handleSave = async () => {
    await onSave()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('shipping.title')}</h2>
          <p className="text-muted-foreground">{t('shipping.description')}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('save')}
        </Button>
      </div>

      {/* Shipping Methods */}
      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={method.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={method.enabled ? 'default' : 'secondary'}>
                    {method.enabled ? t('common.enabled') : t('common.disabled')}
                  </Badge>
                  <Switch
                    checked={method.enabled}
                    onCheckedChange={(checked) => updateMethod(method.id, { enabled: checked })}
                  />
                </div>
              </div>
            </CardHeader>
            
            {method.enabled && method.type === 'weight_based' && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`base-rate-${method.id}`}>
                      {t('shipping.baseRate')} ($)
                    </Label>
                    <Input
                      id={`base-rate-${method.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={method.config.base_rate || 0}
                      onChange={(e) => updateMethodConfig(method.id, 'base_rate', parseFloat(e.target.value) || 0)}
                      placeholder="5.00"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('shipping.baseRateDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`per-kg-rate-${method.id}`}>
                      {t('shipping.perKgRate')} ($)
                    </Label>
                    <Input
                      id={`per-kg-rate-${method.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={method.config.per_kg_rate || 0}
                      onChange={(e) => updateMethodConfig(method.id, 'per_kg_rate', parseFloat(e.target.value) || 0)}
                      placeholder="2.50"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('shipping.perKgRateDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`free-threshold-${method.id}`}>
                      {t('shipping.freeThreshold')} ($)
                    </Label>
                    <Input
                      id={`free-threshold-${method.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      value={method.config.free_threshold || 0}
                      onChange={(e) => updateMethodConfig(method.id, 'free_threshold', parseFloat(e.target.value) || 0)}
                      placeholder="100.00"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('shipping.freeThresholdDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`max-weight-${method.id}`}>
                      {t('shipping.maxWeight')} (kg)
                    </Label>
                    <Input
                      id={`max-weight-${method.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      value={method.config.max_weight || 0}
                      onChange={(e) => updateMethodConfig(method.id, 'max_weight', parseFloat(e.target.value) || 0)}
                      placeholder="50"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('shipping.maxWeightDescription')}
                    </p>
                  </div>
                </div>

                {/* Example calculation */}
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <h4 className="text-sm font-medium mb-2">{t('shipping.exampleCalculation')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('shipping.exampleText', {
                      baseRate: (method.config.base_rate || 0).toFixed(2),
                      perKgRate: (method.config.per_kg_rate || 0).toFixed(2),
                      freeThreshold: (method.config.free_threshold || 0).toFixed(2)
                    })}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Save Button - Footer */}
      <div className="flex justify-end pt-6 border-t">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('saveChanges')}
        </Button>
      </div>
    </div>
  )
}
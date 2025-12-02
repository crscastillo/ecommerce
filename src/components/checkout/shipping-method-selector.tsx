'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Truck, Package, Clock } from 'lucide-react'
import { 
  calculateShipping, 
  getShippingMethods, 
  formatShippingMethodDisplay,
  type ShippingCalculationResult,
  type ShippingCalculationRequest 
} from '@/lib/utils/shipping'
import type { CartItem } from '@/lib/contexts/cart-context'
import type { ShippingMethod } from '@/components/admin/settings/shipping-tab'

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

interface ShippingMethodSelectorProps {
  items: CartItem[]
  shippingInfo?: ShippingInfo
  selectedMethodId?: string
  onMethodChange: (methodId: string, price: number) => void
  formatPrice: (price: number, tenant?: any) => string
  tenant?: any
  tenantId: string
}

export function ShippingMethodSelector({
  items,
  shippingInfo,
  selectedMethodId,
  onMethodChange,
  formatPrice,
  tenant,
  tenantId
}: ShippingMethodSelectorProps) {
  const t = useTranslations('checkout')
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [calculationResult, setCalculationResult] = useState<ShippingCalculationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load shipping methods and calculate options
  useEffect(() => {
    const loadAndCalculateShipping = async () => {
      if (!tenantId || items.length === 0) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Fetch tenant's shipping methods
        const methods = await getShippingMethods(tenantId)
        setShippingMethods(methods)

        // Calculate shipping options
        const request: ShippingCalculationRequest = {
          items,
          shippingMethods: methods,
          shippingAddress: shippingInfo ? {
            country: shippingInfo.country,
            state: shippingInfo.state,
            zipCode: shippingInfo.zipCode
          } : undefined
        }

        const result = calculateShipping(request)
        setCalculationResult(result)

        // Auto-select recommended method if none selected
        if (!selectedMethodId && result.recommendedMethodId) {
          const recommendedMethod = result.availableMethods.find(
            m => m.id === result.recommendedMethodId
          )
          if (recommendedMethod) {
            onMethodChange(recommendedMethod.id, recommendedMethod.price)
          }
        }

      } catch (err) {
        console.error('Error calculating shipping:', err)
        setError('Failed to load shipping options')
      } finally {
        setLoading(false)
      }
    }

    loadAndCalculateShipping()
  }, [tenantId, items, shippingInfo, selectedMethodId, onMethodChange])

  const handleMethodSelect = (methodId: string) => {
    const method = calculationResult?.availableMethods.find(m => m.id === methodId)
    if (method) {
      onMethodChange(methodId, method.price)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            {t('shippingMethod.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600">{t('shippingMethod.calculating')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !calculationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            {t('shippingMethod.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600">{error || t('shippingMethod.noMethods')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          {t('shippingMethod.title')}
        </CardTitle>
        {calculationResult.totalWeight > 0 && (
          <p className="text-sm text-gray-600 flex items-center">
            <Package className="w-4 h-4 mr-1" />
            {t('shippingMethod.packageWeight', { weight: calculationResult.totalWeight.toFixed(1) })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {calculationResult.availableMethods.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-600">{t('shippingMethod.noMethods')}</p>
          </div>
        ) : (
          <RadioGroup 
            value={selectedMethodId} 
            onValueChange={handleMethodSelect}
            className="space-y-3"
          >
            {calculationResult.availableMethods.map((method) => {
              const isRecommended = method.id === calculationResult.recommendedMethodId
              
              return (
                <div key={method.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={method.id} 
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{method.name}</span>
                          {isRecommended && (
                            <Badge variant="secondary" className="text-xs">
                              {t('shippingMethod.recommended')}
                            </Badge>
                          )}
                          {method.price === 0 && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              {t('shippingMethod.free')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        {method.estimatedDays && (
                          <p className="text-xs text-gray-500 flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            {method.estimatedDays}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {method.price === 0 ? t('shippingMethod.free') : formatPrice(method.price, tenant)}
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              )
            })}
          </RadioGroup>
        )}
      </CardContent>
    </Card>
  )
}
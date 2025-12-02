'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, Truck, Package, Settings as SettingsIcon, Globe, MapPin, X } from 'lucide-react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'

export interface ShippingMethod {
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
  shipping_zones?: {
    allowed_countries?: string[]
    restricted_countries?: string[]
    allowed_states?: { [country: string]: string[] }
    restricted_states?: { [country: string]: string[] }
  }
}

interface ShippingTabProps {
  shippingMethods: ShippingMethod[]
  onShippingMethodsChange: (methods: ShippingMethod[]) => void
  onSave: () => Promise<void>
  saving: boolean
}

// Americas countries list (North, Central, and South America)
const COUNTRIES = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'GL', name: 'Greenland' },
  { code: 'PM', name: 'Saint Pierre and Miquelon' },
  
  // Central America
  { code: 'BZ', name: 'Belize' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'PA', name: 'Panama' },
  
  // Caribbean
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BB', name: 'Barbados' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'GD', name: 'Grenada' },
  { code: 'HT', name: 'Haiti' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  
  // Caribbean Dependencies
  { code: 'AI', name: 'Anguilla' },
  { code: 'AW', name: 'Aruba' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BQ', name: 'Caribbean Netherlands' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CW', name: 'Curaçao' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'BL', name: 'Saint Barthélemy' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'TC', name: 'Turks and Caicos Islands' },
  { code: 'VG', name: 'British Virgin Islands' },
  { code: 'VI', name: 'U.S. Virgin Islands' },
  
  // South America
  { code: 'AR', name: 'Argentina' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BR', name: 'Brazil' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'GY', name: 'Guyana' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'SR', name: 'Suriname' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'VE', name: 'Venezuela' }
]

// US States list (common ones)
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
]

export function ShippingTab({ 
  shippingMethods, 
  onShippingMethodsChange, 
  onSave, 
  saving 
}: ShippingTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const { tenant } = useTenant()

  // Initialize with default weight-based method if no methods exist
  const [methods, setMethods] = useState<ShippingMethod[]>(() => {
    if (shippingMethods.length === 0) {
      return [
        {
          id: 'weight_based',
          name: 'Weight Based Shipping',
          description: 'Calculate shipping costs based on package weight',
          enabled: true,
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

  // Sync local state with props when shippingMethods changes
  useEffect(() => {
    if (shippingMethods.length > 0) {
      setMethods(shippingMethods)
    } else {
      // If no methods from props, ensure we have default method
      setMethods([
        {
          id: 'weight_based',
          name: 'Weight Based Shipping',
          description: 'Calculate shipping costs based on package weight',
          enabled: true,
          type: 'weight_based',
          config: {
            base_rate: 5.00,
            per_kg_rate: 2.50,
            free_threshold: 100.00,
            max_weight: 50
          }
        }
      ])
    }
  }, [shippingMethods])

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

  // Get currency symbol for display
  const getCurrencySymbol = () => {
    const currency = tenant?.settings?.currency || 'USD'
    return currency === 'USD' ? '$' : currency
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
                      {t('shipping.baseRate')} ({getCurrencySymbol()})
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
                      {t('shipping.perKgRate')} ({getCurrencySymbol()})
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
                      {t('shipping.freeThreshold')} ({getCurrencySymbol()})
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
                      baseRate: formatPrice(method.config.base_rate || 0, tenant),
                      perKgRate: formatPrice(method.config.per_kg_rate || 0, tenant),
                      freeThreshold: formatPrice(method.config.free_threshold || 0, tenant)
                    })}
                  </p>
                </div>
              </CardContent>
            )}
            
            {/* Shipping Zones Configuration */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <CardTitle className="text-base">Shipping Zones</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  Configure which countries and states this shipping method is available for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Allowed Countries */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Allowed Countries</Label>
                  <Select
                    value=""
                    onValueChange={(countryCode) => {
                      const zones = method.shipping_zones || { allowed_countries: [], restricted_countries: [], allowed_states: {}, restricted_states: {} }
                      if (!zones.allowed_countries?.includes(countryCode)) {
                        const newZones = {
                          ...zones,
                          allowed_countries: [...(zones.allowed_countries || []), countryCode]
                        }
                        updateMethod(method.id, { shipping_zones: newZones })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Add a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.filter(country => 
                        !method.shipping_zones?.allowed_countries?.includes(country.code)
                      ).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Display selected countries */}
                  <div className="flex flex-wrap gap-2">
                    {(method.shipping_zones?.allowed_countries || []).map((countryCode) => {
                      const country = COUNTRIES.find(c => c.code === countryCode)
                      return (
                        <Badge key={countryCode} variant="secondary" className="flex items-center gap-1">
                          {country?.name || countryCode}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              const zones = method.shipping_zones || { allowed_countries: [], restricted_countries: [], allowed_states: {}, restricted_states: {} }
                              const newZones = {
                                ...zones,
                                allowed_countries: zones.allowed_countries?.filter(c => c !== countryCode) || []
                              }
                              updateMethod(method.id, { shipping_zones: newZones })
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      )
                    })}
                  </div>
                  {(method.shipping_zones?.allowed_countries || []).length === 0 && (
                    <p className="text-xs text-muted-foreground">No countries selected. This method will be available worldwide.</p>
                  )}
                </div>

                {/* US States Configuration (if US is selected) */}
                {method.shipping_zones?.allowed_countries?.includes('US') && (
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <Label className="text-sm font-medium">US States Restrictions</Label>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`us-all-states-${method.id}`}
                          checked={!method.shipping_zones?.allowed_states?.['US'] || method.shipping_zones?.allowed_states?.['US']?.length === 0}
                          onCheckedChange={(checked) => {
                            const zones = method.shipping_zones || { allowed_countries: [], restricted_countries: [], allowed_states: {}, restricted_states: {} }
                            const newZones = {
                              ...zones,
                              allowed_states: {
                                ...zones.allowed_states,
                                'US': checked ? [] : ['CA', 'NY', 'TX', 'FL'] // Default to some states if unchecking
                              }
                            }
                            updateMethod(method.id, { shipping_zones: newZones })
                          }}
                        />
                        <Label htmlFor={`us-all-states-${method.id}`} className="text-sm">Available in all US states</Label>
                      </div>
                      
                      {method.shipping_zones?.allowed_states?.['US'] && method.shipping_zones?.allowed_states?.['US']?.length > 0 && (
                        <div className="space-y-2">
                          <Select
                            value=""
                            onValueChange={(stateCode) => {
                              const zones = method.shipping_zones || { allowed_countries: [], restricted_countries: [], allowed_states: {}, restricted_states: {} }
                              const currentStates = zones.allowed_states?.['US'] || []
                              if (!currentStates.includes(stateCode)) {
                                const newZones = {
                                  ...zones,
                                  allowed_states: {
                                    ...zones.allowed_states,
                                    'US': [...currentStates, stateCode]
                                  }
                                }
                                updateMethod(method.id, { shipping_zones: newZones })
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Add a US state" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.filter(state => 
                                !method.shipping_zones?.allowed_states?.['US']?.includes(state.code)
                              ).map((state) => (
                                <SelectItem key={state.code} value={state.code}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <div className="flex flex-wrap gap-1">
                            {(method.shipping_zones?.allowed_states?.['US'] || []).map((stateCode) => {
                              const state = US_STATES.find(s => s.code === stateCode)
                              return (
                                <Badge key={stateCode} variant="outline" className="text-xs flex items-center gap-1">
                                  {state?.name || stateCode}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-3 w-3 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={() => {
                                      const zones = method.shipping_zones || { allowed_countries: [], restricted_countries: [], allowed_states: {}, restricted_states: {} }
                                      const newZones = {
                                        ...zones,
                                        allowed_states: {
                                          ...zones.allowed_states,
                                          'US': zones.allowed_states?.['US']?.filter(s => s !== stateCode) || []
                                        }
                                      }
                                      updateMethod(method.id, { shipping_zones: newZones })
                                    }}
                                  >
                                    <X className="w-2 h-2" />
                                  </Button>
                                </Badge>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </Card>
        ))}
      </div>
    </div>
  )
}
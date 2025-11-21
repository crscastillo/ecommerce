'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Save, AlertCircle } from 'lucide-react'
import { fieldValidators } from '@/lib/utils/validation'
import { ValidationError } from '@/lib/types/settings'

interface ConfigurationTabProps {
  settings: any
  onSettingsChange: (settings: any) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function ConfigurationTab({ settings, onSettingsChange, onSave, saving }: ConfigurationTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({})
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())

  const updateSetting = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      settings: { ...settings.settings, [field]: value }
    })
    
    // Clear validation errors for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const updateDirectSetting = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value
    })
    
    // Clear validation errors for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateField = useCallback((fieldName: string, value: any) => {
    const fieldErrors: ValidationError[] = []
    
    switch (fieldName) {
      case 'currency':
        if (!value || value.trim() === '') {
          fieldErrors.push({
            field: fieldName,
            message: t('validation.currencyRequired')
          })
        }
        break
        
      case 'timezone':
        if (!value || value.trim() === '') {
          fieldErrors.push({
            field: fieldName,
            message: t('validation.timezoneRequired')
          })
        }
        break
        
      case 'tax_rate':
        if (value === '' || value === null || value === undefined) {
          fieldErrors.push({
            field: fieldName,
            message: t('validation.taxRateRequired')
          })
        } else {
          const numValue = parseFloat(value)
          if (isNaN(numValue)) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.taxRateInvalid')
            })
          } else if (numValue < 0) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.taxRateNegative')
            })
          } else if (numValue > 99.99) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.taxRateMax')
            })
          }
        }
        break
        
      case 'low_stock_threshold':
        if (value === '' || value === null || value === undefined) {
          fieldErrors.push({
            field: fieldName,
            message: t('validation.lowStockThresholdRequired')
          })
        } else {
          const numValue = parseInt(value)
          if (isNaN(numValue)) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.lowStockThresholdInvalid')
            })
          } else if (numValue < 0) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.lowStockThresholdNegative')
            })
          } else if (numValue > 100) {
            fieldErrors.push({
              field: fieldName,
              message: t('validation.lowStockThresholdMax')
            })
          }
        }
        break
    }
    
    return fieldErrors
  }, [t])

  const handleFieldBlur = (fieldName: string, value: any) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    
    const fieldErrors = validateField(fieldName, value)
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldErrors
    }))
  }

  const validateAllFields = () => {
    const allErrors: Record<string, ValidationError[]> = {}
    const fieldsToValidate = ['currency', 'timezone', 'tax_rate', 'low_stock_threshold']
    
    fieldsToValidate.forEach(fieldName => {
      let value
      if (fieldName === 'currency' || fieldName === 'timezone' || fieldName === 'tax_rate' || fieldName === 'low_stock_threshold') {
        value = settings.settings[fieldName]
      }
      
      const fieldErrors = validateField(fieldName, value)
      if (fieldErrors.length > 0) {
        allErrors[fieldName] = fieldErrors
      }
    })
    
    setErrors(allErrors)
    setTouchedFields(new Set(fieldsToValidate))
    
    return Object.keys(allErrors).length === 0
  }

  const handleSave = async () => {
    if (validateAllFields()) {
      await onSave()
    }
  }

  const getFieldError = (fieldName: string) => {
    if (!touchedFields.has(fieldName) || !errors[fieldName]) return null
    return errors[fieldName][0]?.message
  }

  const hasFieldError = (fieldName: string) => {
    return touchedFields.has(fieldName) && errors[fieldName] && errors[fieldName].length > 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.storeConfiguration')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency" className={hasFieldError('currency') ? 'text-destructive' : ''}>
              {t('labels.defaultCurrency')}
            </Label>
            <Select 
              value={settings.settings.currency} 
              onValueChange={(value) => {
                updateSetting('currency', value)
                handleFieldBlur('currency', value)
              }}
            >
              <SelectTrigger className={hasFieldError('currency') ? 'border-destructive focus:ring-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">💵 USD - US Dollar</SelectItem>
                <SelectItem value="EUR">💶 EUR - Euro</SelectItem>
                <SelectItem value="GBP">💷 GBP - British Pound</SelectItem>
                <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                <SelectItem value="CRC">🇨🇷 CRC - Costa Rican Colón</SelectItem>
                <SelectItem value="MXN">🇲🇽 MXN - Mexican Peso</SelectItem>
                <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc</SelectItem>
                <SelectItem value="SEK">🇸🇪 SEK - Swedish Krona</SelectItem>
                <SelectItem value="NOK">🇳🇴 NOK - Norwegian Krone</SelectItem>
                <SelectItem value="DKK">🇩🇰 DKK - Danish Krone</SelectItem>
                <SelectItem value="BRL">🇧🇷 BRL - Brazilian Real</SelectItem>
                <SelectItem value="ARS">🇦🇷 ARS - Argentine Peso</SelectItem>
                <SelectItem value="CLP">🇨🇱 CLP - Chilean Peso</SelectItem>
                <SelectItem value="COP">🇨🇴 COP - Colombian Peso</SelectItem>
                <SelectItem value="PEN">🇵🇪 PEN - Peruvian Sol</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('currency') && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('currency')}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="timezone" className={hasFieldError('timezone') ? 'text-destructive' : ''}>
              {t('labels.timezone')}
            </Label>
            <Select 
              value={settings.settings.timezone} 
              onValueChange={(value) => {
                updateSetting('timezone', value)
                handleFieldBlur('timezone', value)
              }}
            >
              <SelectTrigger className={hasFieldError('timezone') ? 'border-destructive focus:ring-destructive' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">{t('timezoneOptions.America/New_York')}</SelectItem>
                <SelectItem value="America/Chicago">{t('timezoneOptions.America/Chicago')}</SelectItem>
                <SelectItem value="America/Denver">{t('timezoneOptions.America/Denver')}</SelectItem>
                <SelectItem value="America/Los_Angeles">{t('timezoneOptions.America/Los_Angeles')}</SelectItem>
                <SelectItem value="UTC">{t('timezoneOptions.UTC')}</SelectItem>
                <SelectItem value="America/Costa_Rica">{t('timezoneOptions.America/Costa_Rica')}</SelectItem>
                <SelectItem value="America/Mexico_City">{t('timezoneOptions.America/Mexico_City')}</SelectItem>
                <SelectItem value="Europe/London">{t('timezoneOptions.Europe/London')}</SelectItem>
                <SelectItem value="Europe/Madrid">{t('timezoneOptions.Europe/Madrid')}</SelectItem>
                <SelectItem value="Asia/Tokyo">{t('timezoneOptions.Asia/Tokyo')}</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('timezone') && (
              <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {getFieldError('timezone')}
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('languageSettings.title')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin-language">{t('languageSettings.adminLanguage')}</Label>
              <Select 
                value={settings.admin_language || 'en'} 
                onValueChange={(value) => updateDirectSetting('admin_language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('languageSettings.adminLanguagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{t('languageSettings.adminLanguageHelp')}</p>
            </div>
            <div>
              <Label htmlFor="store-language">{t('languageSettings.storeLanguage')}</Label>
              <Select 
                value={settings.store_language || 'en'} 
                onValueChange={(value) => updateDirectSetting('store_language', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('languageSettings.storeLanguagePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">🇺🇸 English</SelectItem>
                  <SelectItem value="es">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">{t('languageSettings.storeLanguageHelp')}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t('storeFeatures.title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tax-rate" className={hasFieldError('tax_rate') ? 'text-destructive' : ''}>
                {t('labels.taxRate')}
              </Label>
              <div className="relative">
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99.99"
                  value={settings.settings.tax_rate || 0}
                  onChange={(e) => updateSetting('tax_rate', e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                  onBlur={(e) => handleFieldBlur('tax_rate', e.target.value)}
                  placeholder="8.25"
                  className={`pr-8 ${hasFieldError('tax_rate') ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">%</span>
              </div>
              {getFieldError('tax_rate') && (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('tax_rate')}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="low-stock-threshold" className={hasFieldError('low_stock_threshold') ? 'text-destructive' : ''}>
                {t('labels.lowStockThreshold')}
              </Label>
              <Input
                id="low-stock-threshold"
                type="number"
                min="0"
                max="100"
                value={settings.settings.low_stock_threshold || 5}
                onChange={(e) => updateSetting('low_stock_threshold', e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                onBlur={(e) => handleFieldBlur('low_stock_threshold', e.target.value)}
                placeholder="5"
                className={hasFieldError('low_stock_threshold') ? 'border-destructive focus-visible:ring-destructive' : ''}
              />
              {getFieldError('low_stock_threshold') ? (
                <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {getFieldError('low_stock_threshold')}
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  {t('storeFeatures.lowStockThresholdHelp')}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label>{t('storeFeatures.inventoryTracking')}</Label>
                <p className="text-sm text-gray-500">{t('storeFeatures.inventoryTrackingHelp')}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Switch
                  checked={settings.settings.inventory_tracking || false}
                  onCheckedChange={(checked) => updateSetting('inventory_tracking', checked)}
                />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label>{t('storeFeatures.allowBackorders')}</Label>
                <p className="text-sm text-gray-500">{t('storeFeatures.allowBackordersHelp')}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Switch
                  checked={settings.settings.allow_backorders || false}
                  onCheckedChange={(checked) => updateSetting('allow_backorders', checked)}
                />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label>{t('storeFeatures.autoFulfillOrders')}</Label>
                <p className="text-sm text-gray-500">{t('storeFeatures.autoFulfillOrdersHelp')}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Switch
                  checked={settings.settings.auto_fulfill_orders || false}
                  onCheckedChange={(checked) => updateSetting('auto_fulfill_orders', checked)}
                />
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Label>{t('storeFeatures.emailNotifications')}</Label>
                <p className="text-sm text-gray-500">{t('storeFeatures.emailNotificationsHelp')}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Switch
                  checked={settings.settings.email_notifications !== false}
                  onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Show validation errors summary if there are any */}
        {Object.keys(errors).some(key => errors[key] && errors[key].length > 0) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('validation.fixErrorsBeforeSaving', { 
                default: 'Please fix the validation errors before saving' 
              })}
            </AlertDescription>
          </Alert>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('saveConfiguration')}
        </Button>
      </CardContent>
    </Card>
  )
}

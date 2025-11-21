'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, AlertCircle } from 'lucide-react'
import { Tenant } from '@/lib/contexts/tenant-context'
import { validateStoreSettings, fieldValidators } from '@/lib/utils/validation'
import { ValidationError } from '@/lib/types/settings'

interface StoreSettings {
  name: string
  description: string
  contact_email: string
  contact_phone: string
  country: string
  admin_language: string
  store_language: string
  address: Record<string, any>
  settings: Record<string, any>
}

interface StoreInformationTabProps {
  tenant: Tenant
  settings: StoreSettings
  onSettingsChange: (settings: StoreSettings) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function StoreInformationTab({ 
  tenant, 
  settings, 
  onSettingsChange,
  onSave,
  saving 
}: StoreInformationTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Domain validation helper
  const isValidDomain = (domain: string): boolean => {
    if (!domain) return true // Optional field
    
    // Remove protocol if present
    const cleanDomain = domain.replace(/^https?:\/\//, '')
    
    // Basic domain regex - allows subdomains and common TLDs
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(com|org|net|edu|gov|mil|int|co|io|me|app|dev|shop|store|online|website|site|biz|info|name|pro|mobi|tel|travel|museum|aero|coop|jobs|xxx|[a-z]{2})$/i
    
    return domainRegex.test(cleanDomain)
  }

  // Basic validation for store information fields
  const validateStoreInfo = (data: StoreSettings) => {
    const validationErrors: ValidationError[] = []

    // Required field: Store name
    if (!data.name?.trim()) {
      validationErrors.push({ field: 'name', message: t('validation.storeNameRequired') })
    } else if (data.name.length < 2) {
      validationErrors.push({ field: 'name', message: t('validation.storeNameMinLength') })
    } else if (data.name.length > 100) {
      validationErrors.push({ field: 'name', message: t('validation.storeNameMaxLength') })
    }

    // Required field: Contact email
    if (!data.contact_email?.trim()) {
      validationErrors.push({ field: 'contact_email', message: t('validation.contactEmailRequired') })
    } else {
      // Enhanced email validation
      const email = data.contact_email.trim().toLowerCase()
      
      // Basic format check
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        validationErrors.push({ field: 'contact_email', message: t('validation.invalidEmailFormat') })
      } else {
        // Additional checks
        if (email.length > 254) {
          validationErrors.push({ field: 'contact_email', message: t('validation.emailTooLong') })
        }
        
        // Check for common invalid patterns
        if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
          validationErrors.push({ field: 'contact_email', message: t('validation.emailInvalidCharacters') })
        }
        
        // Check for valid domain part
        const domainPart = email.split('@')[1]
        if (domainPart && (domainPart.includes('..') || domainPart.startsWith('.') || domainPart.endsWith('.'))) {
          validationErrors.push({ field: 'contact_email', message: t('validation.emailInvalidDomain') })
        }
      }
    }

    // Optional field: Contact phone
    if (data.contact_phone && fieldValidators.phone(data.contact_phone)) {
      const phoneError = fieldValidators.phone(data.contact_phone)
      if (phoneError) {
        validationErrors.push({ field: 'contact_phone', message: t('validation.invalidPhoneFormat') })
      }
    }

    // Optional field: Description max length
    if (data.description && data.description.length > 500) {
      validationErrors.push({ field: 'description', message: t('validation.descriptionMaxLength') })
    }

    // Optional field: Custom domain validation
    const customDomain = data.settings?.custom_domain
    if (customDomain && customDomain.trim()) {
      if (!isValidDomain(customDomain.trim())) {
        validationErrors.push({ field: 'custom_domain', message: t('validation.invalidDomainFormat') })
      } else {
        // Additional domain checks
        const cleanDomain = customDomain.replace(/^https?:\/\//, '').trim()
        if (cleanDomain.length > 253) {
          validationErrors.push({ field: 'custom_domain', message: t('validation.domainTooLong') })
        }
        if (cleanDomain.includes('localhost') || cleanDomain.includes('127.0.0.1')) {
          validationErrors.push({ field: 'custom_domain', message: t('validation.localhostNotAllowed') })
        }
      }
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors
    }
  }

  const updateSettings = (updates: Partial<StoreSettings>) => {
    const newSettings = { ...settings, ...updates }
    onSettingsChange(newSettings)
    
    // Validate on change if field has been touched
    const validation = validateStoreInfo(newSettings)
    setErrors(validation.errors)
  }

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const validation = validateStoreInfo(settings)
    setErrors(validation.errors)
  }

  const getFieldError = (fieldName: string) => {
    return errors.find(error => error.field === fieldName)?.message
  }

  const isFieldTouched = (fieldName: string) => {
    return touched[fieldName]
  }

  const hasFieldError = (fieldName: string) => {
    return isFieldTouched(fieldName) && !!getFieldError(fieldName)
  }

  const handleSave = async () => {
    // Mark all fields as touched
    const allFields = ['name', 'description', 'contact_email', 'contact_phone', 'custom_domain']
    const newTouched = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    setTouched(newTouched)

    // Validate before saving
    const validation = validateStoreInfo(settings)
    setErrors(validation.errors)
    
    if (validation.isValid) {
      await onSave()
    }
  }

  const updateAddress = (field: string, value: string) => {
    onSettingsChange({
      ...settings,
      address: { ...settings.address, [field]: value }
    })
  }

  const updateSetting = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      settings: { ...settings.settings, [field]: value }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.storeInformation')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="store-name">{t('labels.storeName')} *</Label>
          <Input
            id="store-name"
            value={settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
            onBlur={() => handleFieldBlur('name')}
            placeholder={t('placeholders.storeName')}
            className={hasFieldError('name') ? 'border-red-500' : ''}
          />
          {hasFieldError('name') && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('name')}</span>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">{t('labels.description')}</Label>
          <Textarea
            id="description"
            value={settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            onBlur={() => handleFieldBlur('description')}
            placeholder={t('placeholders.storeDescription')}
            rows={3}
            className={hasFieldError('description') ? 'border-red-500' : ''}
          />
          {hasFieldError('description') && (
            <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('description')}</span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            {settings.description?.length || 0}/500 {tCommon('characters')}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subdomain">{t('labels.subdomain')}</Label>
            <Input
              id="subdomain"
              value={tenant.subdomain}
              disabled
              placeholder={t('placeholders.subdomain')}
            />
            <p className="text-xs text-gray-500 mt-1">{t('help.subdomainImmutable')}</p>
          </div>
          <div>
            <Label htmlFor="custom-domain">{t('labels.customDomain')}</Label>
            <Input
              id="custom-domain"
              value={settings.settings.custom_domain || ''}
              onChange={(e) => updateSetting('custom_domain', e.target.value)}
              onBlur={() => handleFieldBlur('custom_domain')}
              placeholder={t('placeholders.customDomain')}
              className={hasFieldError('custom_domain') ? 'border-red-500' : ''}
            />
            {hasFieldError('custom_domain') && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError('custom_domain')}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{t('help.customDomain')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-email">{t('labels.contactEmail')} *</Label>
            <Input
              id="contact-email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => updateSettings({ contact_email: e.target.value })}
              onBlur={() => handleFieldBlur('contact_email')}
              placeholder={t('placeholders.contactEmail')}
              className={hasFieldError('contact_email') ? 'border-red-500' : ''}
            />
            {hasFieldError('contact_email') && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError('contact_email')}</span>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="contact-phone">{t('labels.contactPhone')}</Label>
            <Input
              id="contact-phone"
              value={settings.contact_phone}
              onChange={(e) => updateSettings({ contact_phone: e.target.value })}
              onBlur={() => handleFieldBlur('contact_phone')}
              placeholder={t('placeholders.contactPhone')}
              className={hasFieldError('contact_phone') ? 'border-red-500' : ''}
            />
            {hasFieldError('contact_phone') && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{getFieldError('contact_phone')}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-3">{t('labels.address')}</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="street">{t('labels.streetAddress')}</Label>
              <Input
                id="street"
                value={settings.address.street || ''}
                onChange={(e) => updateAddress('street', e.target.value)}
                placeholder={t('placeholders.streetAddress')}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">{t('labels.city')}</Label>
                <Input
                  id="city"
                  value={settings.address.city || ''}
                  onChange={(e) => updateAddress('city', e.target.value)}
                  placeholder={t('placeholders.city')}
                />
              </div>
              <div>
                <Label htmlFor="state">{t('labels.state')}</Label>
                <Input
                  id="state"
                  value={settings.address.state || ''}
                  onChange={(e) => updateAddress('state', e.target.value)}
                  placeholder={t('placeholders.state')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zip">{t('labels.zipCode')}</Label>
                <Input
                  id="zip"
                  value={settings.address.zip || ''}
                  onChange={(e) => updateAddress('zip', e.target.value)}
                  placeholder={t('placeholders.postalCode')}
                />
              </div>
              <div>
                <Label htmlFor="country">{t('labels.country')}</Label>
                <Select 
                  value={settings.country} 
                  onValueChange={(value) => updateSettings({ country: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('placeholders.selectCountry')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                    <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                    <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                    <SelectItem value="CR">🇨🇷 Costa Rica</SelectItem>
                    <SelectItem value="MX">🇲🇽 Mexico</SelectItem>
                    <SelectItem value="ES">🇪🇸 Spain</SelectItem>
                    <SelectItem value="FR">🇫🇷 France</SelectItem>
                    <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                    <SelectItem value="IT">🇮🇹 Italy</SelectItem>
                    <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                    <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                    <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                    <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                    <SelectItem value="PE">🇵🇪 Peru</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('saveStoreInformation')}
        </Button>
      </CardContent>
    </Card>
  )
}

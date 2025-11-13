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
import { Save } from 'lucide-react'
import { Tenant } from '@/lib/contexts/tenant-context'

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

  const updateSettings = (updates: Partial<StoreSettings>) => {
    onSettingsChange({ ...settings, ...updates })
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="store-name">{t('labels.storeName')}</Label>
            <Input
              id="store-name"
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              placeholder="My Awesome Store"
            />
          </div>
          <div>
            <Label htmlFor="subdomain">{t('labels.subdomain')}</Label>
            <Input
              id="subdomain"
              value={tenant.subdomain}
              disabled
              placeholder="mystore"
            />
            <p className="text-xs text-gray-500 mt-1">Subdomain cannot be changed after creation</p>
          </div>
          <div>
            <Label htmlFor="country">{t('labels.country')}</Label>
            <Select 
              value={settings.country} 
              onValueChange={(value) => updateSettings({ country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="admin-language">{t('adminLanguage')}</Label>
            <Select 
              value={settings.admin_language || 'en'} 
              onValueChange={(value) => updateSettings({ admin_language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select admin language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('languageOptions.en')}</SelectItem>
                <SelectItem value="es">{t('languageOptions.es')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Language for admin interface</p>
          </div>
          <div>
            <Label htmlFor="store-language">{t('storeLanguage')}</Label>
            <Select 
              value={settings.store_language || 'en'} 
              onValueChange={(value) => updateSettings({ store_language: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select store language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('languageOptions.en')}</SelectItem>
                <SelectItem value="es">{t('languageOptions.es')}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Language for public store</p>
          </div>
          <div>
            <Label htmlFor="timezone">{t('labels.timezone')}</Label>
            <Select 
              value={settings.settings.timezone} 
              onValueChange={(value) => updateSetting('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="America/Costa_Rica">Costa Rica Time</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">{t('labels.description')}</Label>
          <Textarea
            id="description"
            value={settings.description}
            onChange={(e) => updateSettings({ description: e.target.value })}
            placeholder="Brief description of your store..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact-email">{t('labels.contactEmail')}</Label>
            <Input
              id="contact-email"
              type="email"
              value={settings.contact_email}
              onChange={(e) => updateSettings({ contact_email: e.target.value })}
              placeholder="contact@mystore.com"
            />
          </div>
          <div>
            <Label htmlFor="contact-phone">{t('labels.contactPhone')}</Label>
            <Input
              id="contact-phone"
              value={settings.contact_phone}
              onChange={(e) => updateSettings({ contact_phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-3">{t('labels.address')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="street">{t('labels.streetAddress')}</Label>
              <Input
                id="street"
                value={settings.address.street || ''}
                onChange={(e) => updateAddress('street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Label htmlFor="city">{t('labels.city')}</Label>
              <Input
                id="city"
                value={settings.address.city || ''}
                onChange={(e) => updateAddress('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="state">{t('labels.state')}</Label>
              <Input
                id="state"
                value={settings.address.state || ''}
                onChange={(e) => updateAddress('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            <div>
              <Label htmlFor="zip">{t('labels.zipCode')}</Label>
              <Input
                id="zip"
                value={settings.address.zip || ''}
                onChange={(e) => updateAddress('zip', e.target.value)}
                placeholder="10001"
              />
            </div>
            <div>
              <Label htmlFor="country-addr">{t('labels.country')}</Label>
              <Input
                id="country-addr"
                value={settings.address.country || ''}
                onChange={(e) => updateAddress('country', e.target.value)}
                placeholder="United States"
              />
            </div>
          </div>
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('saveStoreInformation')}
        </Button>
      </CardContent>
    </Card>
  )
}

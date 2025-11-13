'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

interface ConfigurationTabProps {
  settings: any
  onSettingsChange: (settings: any) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function ConfigurationTab({ settings, onSettingsChange, onSave, saving }: ConfigurationTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const updateSetting = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      settings: { ...settings.settings, [field]: value }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sections.storeConfiguration')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">{t('labels.defaultCurrency')}</Label>
            <Select 
              value={settings.settings.currency} 
              onValueChange={(value) => updateSetting('currency', value)}
            >
              <SelectTrigger>
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
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="tax-rate">{t('labels.taxRate')}</Label>
          <Input
            id="tax-rate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={settings.settings.tax_rate || 0}
            onChange={(e) => updateSetting('tax_rate', parseFloat(e.target.value) || 0)}
            placeholder="8.25"
          />
        </div>

        <div>
          <Label htmlFor="low-stock-threshold">{t('labels.lowStockThreshold')}</Label>
          <Input
            id="low-stock-threshold"
            type="number"
            min="0"
            value={settings.settings.low_stock_threshold || 5}
            onChange={(e) => updateSetting('low_stock_threshold', parseInt(e.target.value) || 0)}
            placeholder="5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Show low stock warnings when product quantity is below this number
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Store Features</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>{t('labels.inventoryTracking')}</Label>
              <p className="text-sm text-gray-500">Track product quantities and stock levels</p>
            </div>
            <Switch
              checked={settings.settings.inventory_tracking || false}
              onCheckedChange={(checked) => updateSetting('inventory_tracking', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('labels.allowBackorders')}</Label>
              <p className="text-sm text-gray-500">Allow customers to order out-of-stock items</p>
            </div>
            <Switch
              checked={settings.settings.allow_backorders || false}
              onCheckedChange={(checked) => updateSetting('allow_backorders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('labels.autoFulfillOrders')}</Label>
              <p className="text-sm text-gray-500">Automatically mark orders as fulfilled</p>
            </div>
            <Switch
              checked={settings.settings.auto_fulfill_orders || false}
              onCheckedChange={(checked) => updateSetting('auto_fulfill_orders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('labels.emailNotifications')}</Label>
              <p className="text-sm text-gray-500">Send email notifications for order updates</p>
            </div>
            <Switch
              checked={settings.settings.email_notifications !== false}
              onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            />
          </div>
        </div>

        <Button onClick={onSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? tCommon('saving') : tCommon('saveConfiguration')}
        </Button>
      </CardContent>
    </Card>
  )
}

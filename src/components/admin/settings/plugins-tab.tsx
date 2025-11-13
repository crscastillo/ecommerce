'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Globe, Mail, Puzzle } from 'lucide-react'

export function PluginsTab() {
  const t = useTranslations('settings')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Puzzle className="h-5 w-5 mr-2" />
          {t('sections.availablePlugins')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Analytics Plugin */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('plugins.googleAnalytics.name')}</h3>
                    <p className="text-sm text-gray-600">{t('plugins.googleAnalytics.description')}</p>
                  </div>
                </div>
                <Switch 
                  checked={false}
                  onCheckedChange={(checked) => {
                    // TODO: Handle plugin toggle
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="ga-tracking-id">Tracking ID</Label>
                  <Input
                    id="ga-tracking-id"
                    placeholder="G-XXXXXXXXXX"
                    disabled
                  />
                </div>
                <Badge variant="outline">{t('plugins.proFeature')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Pixel Plugin */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('plugins.facebookPixel.name')}</h3>
                    <p className="text-sm text-gray-600">{t('plugins.facebookPixel.description')}</p>
                  </div>
                </div>
                <Switch 
                  checked={false}
                  onCheckedChange={(checked) => {
                    // TODO: Handle plugin toggle
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="fb-pixel-id">Pixel ID</Label>
                  <Input
                    id="fb-pixel-id"
                    placeholder="1234567890123456"
                    disabled
                  />
                </div>
                <Badge variant="outline">{t('plugins.proFeature')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Email Marketing Plugin */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('plugins.mailchimp.name')}</h3>
                    <p className="text-sm text-gray-600">{t('plugins.mailchimp.description')}</p>
                  </div>
                </div>
                <Switch 
                  checked={false}
                  onCheckedChange={(checked) => {
                    // TODO: Handle plugin toggle
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="mailchimp-api-key">API Key</Label>
                  <Input
                    id="mailchimp-api-key"
                    placeholder="API Key"
                    type="password"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="mailchimp-list-id">List ID</Label>
                  <Input
                    id="mailchimp-list-id"
                    placeholder="List ID"
                    disabled
                  />
                </div>
                <Badge variant="outline">{t('plugins.proFeature')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Plugin */}
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('plugins.whatsapp.name')}</h3>
                    <p className="text-sm text-gray-600">{t('plugins.whatsapp.description')}</p>
                  </div>
                </div>
                <Switch 
                  checked={true}
                  onCheckedChange={(checked) => {
                    // TODO: Handle plugin toggle
                  }}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp-number"
                    placeholder="+1234567890"
                    defaultValue="+50688888888"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp-message">Default Message</Label>
                  <Input
                    id="whatsapp-message"
                    placeholder="Hello, I need help with..."
                    defaultValue="Hola, necesito ayuda con..."
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {t('plugins.whatsapp.note')}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </CardContent>
    </Card>
  )
}

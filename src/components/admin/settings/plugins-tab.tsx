'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { FeatureFlagsService, PluginFeatureFlags } from '@/lib/services/feature-flags'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Globe, Mail, Puzzle } from 'lucide-react'

interface PluginsTabProps {
  tenant: {
    subscription_tier: string
  }
}

export function PluginsTab({ tenant }: PluginsTabProps) {
  const t = useTranslations('settings')
  const [pluginFeatures, setPluginFeatures] = useState<PluginFeatureFlags>({
    plugin_google_analytics: false,
    plugin_facebook_pixel: false,
    plugin_mailchimp: false,
    plugin_whatsapp: false
  })
  const [featuresLoading, setFeaturesLoading] = useState(true)

  useEffect(() => {
    const loadPluginFeatures = async () => {
      try {
        const features = await FeatureFlagsService.getEnabledPluginFeaturesForTier(
          tenant.subscription_tier as 'basic' | 'pro' | 'enterprise'
        )
        setPluginFeatures(features)
      } catch (error) {
        console.error('Failed to load plugin features:', error)
        // Keep default disabled state on error
      } finally {
        setFeaturesLoading(false)
      }
    }

    loadPluginFeatures()
  }, [tenant.subscription_tier])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Puzzle className="h-5 w-5 mr-2" />
          {t('sections.availablePlugins')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {featuresLoading ? (
          <div className="text-center py-8">
            <div className="text-sm text-gray-500">Loading available plugins...</div>
          </div>
        ) : (!pluginFeatures.plugin_google_analytics && !pluginFeatures.plugin_facebook_pixel && !pluginFeatures.plugin_mailchimp && !pluginFeatures.plugin_whatsapp) ? (
          <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center">
              <Puzzle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-1">No plugins available</p>
              <p className="text-xs text-gray-400">Contact your platform administrator to enable plugin features</p>
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Analytics Plugin */}
          {pluginFeatures.plugin_google_analytics && (
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
          )}

          {/* Facebook Pixel Plugin */}
          {pluginFeatures.plugin_facebook_pixel && (
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
          )}

          {/* Email Marketing Plugin */}
          {pluginFeatures.plugin_mailchimp && (
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
          )}

          {/* WhatsApp Plugin */}
          {pluginFeatures.plugin_whatsapp && (
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
          )}

        </div>
        )}
      </CardContent>
    </Card>
  )
}

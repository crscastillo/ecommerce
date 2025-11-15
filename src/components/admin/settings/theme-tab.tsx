'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  logo_url: string
  favicon_url: string
  custom_css: string
  hero_background_type?: 'color' | 'image'
  hero_background_value?: string
}

interface ThemeTabProps {
  settings: ThemeSettings
  onSettingsChange: (settings: ThemeSettings) => void
  onSave: () => Promise<void>
  saving: boolean
}

export function ThemeTab({ settings, onSettingsChange, onSave, saving }: ThemeTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  // Default to color if not set
  const heroType = settings.hero_background_type || 'color';
  const heroValue = settings.hero_background_value || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Section Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-background-type">Background Type</Label>
            <Select
              value={heroType}
              onValueChange={(value) => updateSettings({ hero_background_type: value as 'color' | 'image', hero_background_value: '' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="color">Color</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {heroType === 'color' ? (
            <div>
              <Label htmlFor="hero-background-color">Hero Background Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="hero-background-color"
                  type="color"
                  value={heroValue}
                  onChange={(e) => updateSettings({ hero_background_value: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={heroValue}
                  onChange={(e) => updateSettings({ hero_background_value: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
          ) : (
            <div>
              <Label htmlFor="hero-background-image">Hero Background Image URL</Label>
              <Input
                id="hero-background-image"
                value={heroValue}
                onChange={(e) => updateSettings({ hero_background_value: e.target.value })}
                placeholder="https://example.com/hero.jpg"
              />
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.brandAssets')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo-url">{t('labels.logoUrl')}</Label>
            <Input
              id="logo-url"
              value={settings.logo_url}
              onChange={(e) => updateSettings({ logo_url: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <Label htmlFor="favicon-url">{t('labels.faviconUrl')}</Label>
            <Input
              id="favicon-url"
              value={settings.favicon_url}
              onChange={(e) => updateSettings({ favicon_url: e.target.value })}
              placeholder="https://example.com/favicon.ico"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.colorScheme')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="primary-color">{t('labels.primaryColor')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => updateSettings({ primary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => updateSettings({ primary_color: e.target.value })}
                  placeholder="#3B82F6"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary-color">{t('labels.secondaryColor')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => updateSettings({ secondary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.secondary_color}
                  onChange={(e) => updateSettings({ secondary_color: e.target.value })}
                  placeholder="#6B7280"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="accent-color">{t('labels.accentColor')}</Label>
              <div className="flex space-x-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={settings.accent_color}
                  onChange={(e) => updateSettings({ accent_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.accent_color}
                  onChange={(e) => updateSettings({ accent_color: e.target.value })}
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.typography')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="font-family">{t('labels.fontFamily')}</Label>
            <Select 
              value={settings.font_family} 
              onValueChange={(value) => updateSettings({ font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Poppins">Poppins</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.customCss')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="custom-css">{t('labels.customCss')}</Label>
            <Textarea
              id="custom-css"
              value={settings.custom_css}
              onChange={(e) => updateSettings({ custom_css: e.target.value })}
              placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #333;&#10;}"
              rows={8}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={onSave} disabled={saving} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? tCommon('saving') : tCommon('saveThemeSettings')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

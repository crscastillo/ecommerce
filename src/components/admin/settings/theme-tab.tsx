
import React from 'react';

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
  tenantId: string
}

// Duplicate removed. Only the correct ThemeTab function remains below.
export function ThemeTab({ settings, onSettingsChange, onSave, saving, tenantId }: ThemeTabProps) {
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false);
  const [uploadingHero, setUploadingHero] = React.useState(false);

  async function handleAssetUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') {
    const file = e.target.files?.[0];
    if (!file) return;
    const setUploading = field === 'logo_url' ? setUploadingLogo : setUploadingFavicon;
    setUploading(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      const guid = uuidv4();
      const extension = file.name.split('.').pop();
      const filePath = `${field}/${guid}.${extension}`;
      console.log('[DEBUG] Asset Upload:', { userId: user.data?.user?.id, filePath });
      const { data, error } = await supabase.storage.from('public-assets').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        updateSettings({ [field]: urlData.publicUrl });
      }
    } catch (err) {
      alert('File upload failed: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  }
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  // Default to color if not set
  const heroType = settings.hero_background_type || 'color';
  const heroValue = settings.hero_background_value || '';

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      const guid = uuidv4();
      const extension = file.name.split('.').pop();
      const filePath = `hero-background/${guid}.${extension}`;
      console.log('[DEBUG] Hero Image Upload:', { userId: user.data?.user?.id, filePath });
      const { data, error } = await supabase.storage.from('public-assets').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('public-assets').getPublicUrl(filePath);
      if (urlData?.publicUrl) {
        updateSettings({ hero_background_value: urlData.publicUrl });
      }
    } catch (err) {
      alert('Image upload failed: ' + (err as Error).message);
    } finally {
      setUploadingHero(false);
    }
  }

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
            <div className="space-y-2">
              <Label htmlFor="hero-background-image">Hero Background Image</Label>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={uploadingHero}
                  onClick={() => document.getElementById('hero-bg-file')?.click()}
                >
                  {uploadingHero ? (
                    <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>Uploading...</span>
                  ) : (
                    'Choose Image'
                  )}
                </Button>
                <input
                  id="hero-bg-file"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                  disabled={uploadingHero}
                />
                {heroValue && (
                  <img src={heroValue} alt="Hero preview" className="rounded shadow max-h-20 border" />
                )}
              </div>
              {uploadingHero && <div className="text-sm text-gray-500 mt-2">Uploading image, please wait...</div>}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.brandAssets')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">{t('labels.logoUrl')}</Label>
            <Button
              type="button"
              variant="secondary"
              disabled={uploadingLogo}
              onClick={() => document.getElementById('logo-file')?.click()}
            >
              {uploadingLogo ? (
                <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>Uploading...</span>
              ) : (
                'Upload Logo'
              )}
            </Button>
            <input
              id="logo-file"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleAssetUpload(e, 'logo_url')}
              disabled={uploadingLogo}
            />
            {uploadingLogo && <div className="text-sm text-gray-500">Uploading...</div>}
            {settings.logo_url && (
              <img src={settings.logo_url} alt="Logo preview" className="mt-2 rounded shadow max-h-20" />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon-upload">{t('labels.faviconUrl')}</Label>
            <Button
              type="button"
              variant="secondary"
              disabled={uploadingFavicon}
              onClick={() => document.getElementById('favicon-file')?.click()}
            >
              {uploadingFavicon ? (
                <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>Uploading...</span>
              ) : (
                'Upload Favicon'
              )}
            </Button>
            <input
              id="favicon-file"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => handleAssetUpload(e, 'favicon_url')}
              disabled={uploadingFavicon}
            />
            {uploadingFavicon && <div className="text-sm text-gray-500">Uploading...</div>}
            {settings.favicon_url && (
              <img src={settings.favicon_url} alt="Favicon preview" className="mt-2 rounded shadow max-h-10" />
            )}
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

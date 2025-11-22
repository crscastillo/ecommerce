import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Save, Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  logo_url: string
  favicon_url: string
  hero_background_type?: 'color' | 'image'
  hero_background_value?: string
  admin_theme?: string
  store_theme?: string
}

interface ShadcnTheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  preview: {
    light: string
    dark: string
  }
}

const SHADCN_THEMES: ShadcnTheme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Classic shadcn/ui zinc theme',
    colors: { primary: '#18181b', secondary: '#71717a', accent: '#3b82f6', background: '#ffffff', text: '#09090b' },
    preview: { light: 'bg-zinc-900', dark: 'bg-zinc-50' }
  },
  {
    id: 'violet',
    name: 'Violet',
    description: 'Modern purple and violet tones',
    colors: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#8b5cf6', background: '#ffffff', text: '#1e1b4b' },
    preview: { light: 'bg-violet-600', dark: 'bg-violet-100' }
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Elegant rose and pink palette',
    colors: { primary: '#e11d48', secondary: '#fb7185', accent: '#f43f5e', background: '#ffffff', text: '#881337' },
    preview: { light: 'bg-rose-600', dark: 'bg-rose-100' }
  },
  {
    id: 'blue',
    name: 'Blue',
    description: 'Professional blue theme',
    colors: { primary: '#2563eb', secondary: '#60a5fa', accent: '#3b82f6', background: '#ffffff', text: '#1e3a8a' },
    preview: { light: 'bg-blue-600', dark: 'bg-blue-100' }
  },
  {
    id: 'green',
    name: 'Green',
    description: 'Fresh green and emerald colors',
    colors: { primary: '#059669', secondary: '#34d399', accent: '#10b981', background: '#ffffff', text: '#064e3b' },
    preview: { light: 'bg-emerald-600', dark: 'bg-emerald-100' }
  },
  {
    id: 'orange',
    name: 'Orange',
    description: 'Vibrant orange and amber theme',
    colors: { primary: '#ea580c', secondary: '#fb923c', accent: '#f97316', background: '#ffffff', text: '#7c2d12' },
    preview: { light: 'bg-orange-600', dark: 'bg-orange-100' }
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Cool slate and gray tones',
    colors: { primary: '#0f172a', secondary: '#64748b', accent: '#475569', background: '#ffffff', text: '#020617' },
    preview: { light: 'bg-slate-700', dark: 'bg-slate-200' }
  },
  {
    id: 'neutral',
    name: 'Neutral',
    description: 'Balanced neutral palette',
    colors: { primary: '#262626', secondary: '#737373', accent: '#404040', background: '#ffffff', text: '#0a0a0a' },
    preview: { light: 'bg-neutral-800', dark: 'bg-neutral-100' }
  },
  {
    id: 'yellow',
    name: 'Yellow',
    description: 'Bright and energetic yellow theme',
    colors: { primary: '#ca8a04', secondary: '#facc15', accent: '#eab308', background: '#ffffff', text: '#713f12' },
    preview: { light: 'bg-yellow-600', dark: 'bg-yellow-100' }
  },
  {
    id: 'red',
    name: 'Red',
    description: 'Bold red accent theme',
    colors: { primary: '#dc2626', secondary: '#f87171', accent: '#ef4444', background: '#ffffff', text: '#7f1d1d' },
    preview: { light: 'bg-red-600', dark: 'bg-red-100' }
  }
]

interface ThemeTabProps {
  settings: ThemeSettings
  onSettingsChange: (settings: ThemeSettings) => void
  onSave: () => Promise<void>
  saving: boolean
  tenantId: string
}

export function ThemeTab({ settings, onSettingsChange, onSave, saving, tenantId }: ThemeTabProps) {
  const [uploadingLogo, setUploadingLogo] = React.useState(false)
  const [uploadingFavicon, setUploadingFavicon] = React.useState(false)
  const [uploadingHero, setUploadingHero] = React.useState(false)
  
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const updateSettings = (updates: Partial<ThemeSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  const applyTheme = (theme: ShadcnTheme, target: 'admin' | 'store') => {
    if (target === 'admin') {
      updateSettings({ admin_theme: theme.id })
    } else {
      updateSettings({
        store_theme: theme.id,
        primary_color: theme.colors.primary,
        secondary_color: theme.colors.secondary,
        accent_color: theme.colors.accent,
        background_color: theme.colors.background,
        text_color: theme.colors.text
      })
    }
  }

  const selectedAdminTheme = SHADCN_THEMES.find(theme => theme.id === settings.admin_theme) || SHADCN_THEMES[0]
  const selectedStoreTheme = SHADCN_THEMES.find(theme => theme.id === settings.store_theme) || SHADCN_THEMES[0]

  const heroType = settings.hero_background_type || 'color'
  const heroValue = settings.hero_background_value || ''

  async function handleAssetUpload(e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') {
    const file = e.target.files?.[0]
    if (!file) return
    
    const setUploading = field === 'logo_url' ? setUploadingLogo : setUploadingFavicon
    setUploading(true)
    
    try {
      if (!tenantId) {
        throw new Error('Tenant ID not found. Please refresh the page and try again.')
      }
      
      // Use API route for upload to avoid RLS issues
      const assetType = field === 'logo_url' ? 'logo' : 'favicon'
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenantId', tenantId)
      formData.append('assetType', assetType)
      
      const response = await fetch('/api/theme-assets', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }
      
      if (result.success && result.url) {
        updateSettings({ [field]: result.url })
      }
    } catch (err) {
      console.error(`${field} upload error:`, err)
      alert('File upload failed: ' + (err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploadingHero(true)
    try {
      if (!tenantId) {
        throw new Error('Tenant ID not found. Please refresh the page and try again.')
      }
      
      // Use API route for upload to avoid RLS issues
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenantId', tenantId)
      formData.append('assetType', 'hero')
      
      const response = await fetch('/api/theme-assets', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }
      
      if (result.success && result.url) {
        updateSettings({ hero_background_value: result.url })
      }
    } catch (err) {
      console.error('Hero image upload error:', err)
      alert('Image upload failed: ' + (err as Error).message)
    } finally {
      setUploadingHero(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>{t('sections.adminTheme')}</CardTitle>
          </div>
          <CardDescription>{t('descriptions.adminTheme')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SHADCN_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme, 'admin')}
                className={cn(
                  "relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md",
                  selectedAdminTheme.id === theme.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{theme.name}</span>
                  {selectedAdminTheme.id === theme.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex gap-1 mb-2">
                  <div className={cn("h-6 w-6 rounded", theme.preview.light)} />
                  <div className={cn("h-6 w-6 rounded", theme.preview.dark)} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>{t('sections.storeTheme')}</CardTitle>
          </div>
          <CardDescription>{t('descriptions.storeTheme')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {SHADCN_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => applyTheme(theme, 'store')}
                className={cn(
                  "relative rounded-lg border-2 p-3 text-left transition-all hover:shadow-md",
                  selectedStoreTheme.id === theme.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{theme.name}</span>
                  {selectedStoreTheme.id === theme.id && <Check className="h-4 w-4 text-primary" />}
                </div>
                <div className="flex gap-1 mb-2">
                  <div className={cn("h-6 w-6 rounded", theme.preview.light)} />
                  <div className={cn("h-6 w-6 rounded", theme.preview.dark)} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t('sections.heroBackground')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-background-type">{t('labels.backgroundType')}</Label>
            <Select value={heroType} onValueChange={(value) => updateSettings({ hero_background_type: value as 'color' | 'image', hero_background_value: '' })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="color">{t('options.color')}</SelectItem>
                <SelectItem value="image">{t('options.image')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {heroType === 'color' ? (
            <div>
              <Label htmlFor="hero-background-color">{t('labels.heroBackgroundColor')}</Label>
              <div className="flex space-x-2">
                <Input id="hero-background-color" type="color" value={heroValue} onChange={(e) => updateSettings({ hero_background_value: e.target.value })} className="w-20" />
                <Input value={heroValue} onChange={(e) => updateSettings({ hero_background_value: e.target.value })} placeholder={t('placeholders.colorValue')} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="hero-background-image">{t('labels.heroBackgroundImage')}</Label>
              <div className="flex items-center space-x-4">
                <Button type="button" variant="secondary" disabled={uploadingHero} onClick={() => document.getElementById('hero-bg-file')?.click()}>
                  {uploadingHero ? <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>{tCommon('uploading')}</span> : t('buttons.chooseImage')}
                </Button>
                <input id="hero-bg-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploadingHero} />
                {heroValue && <img src={heroValue} alt="Hero preview" className="rounded shadow max-h-20 border" />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t('sections.brandAssets')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logo-upload">{t('labels.logoUrl')}</Label>
            <Button type="button" variant="secondary" disabled={uploadingLogo} onClick={() => document.getElementById('logo-file')?.click()}>
              {uploadingLogo ? <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>{tCommon('uploading')}</span> : t('buttons.uploadLogo')}
            </Button>
            <input id="logo-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleAssetUpload(e, 'logo_url')} disabled={uploadingLogo} />
            {settings.logo_url && <img src={settings.logo_url} alt="Logo preview" className="mt-2 rounded shadow max-h-20" />}
          </div>
          <div className="space-y-2">
            <Label htmlFor="favicon-upload">{t('labels.faviconUrl')}</Label>
            <Button type="button" variant="secondary" disabled={uploadingFavicon} onClick={() => document.getElementById('favicon-file')?.click()}>
              {uploadingFavicon ? <span className="flex items-center"><span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></span>{tCommon('uploading')}</span> : t('buttons.uploadFavicon')}
            </Button>
            <input id="favicon-file" type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleAssetUpload(e, 'favicon_url')} disabled={uploadingFavicon} />
            {settings.favicon_url && <img src={settings.favicon_url} alt="Favicon preview" className="mt-2 rounded shadow max-h-10" />}
          </div>
        </CardContent>
      </Card>
          <Button onClick={onSave} disabled={saving} className="mt-4">
            <Save className="h-4 w-4 mr-2" />
            {saving ? tCommon('saving') : tCommon('saveThemeSettings')}
          </Button>
    </div>
  )
}

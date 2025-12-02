'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Save, ArrowLeft, Package, ExternalLink } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ImageUpload } from '@/components/admin/image-upload'
import { useBrandActions } from '@/lib/hooks/use-brands'
import { BrandFormData, defaultBrandFormData, Brand } from '@/lib/types/brand'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

interface BrandFormProps {
  initialData?: Brand
  mode: 'create' | 'edit'
}

export function BrandForm({ initialData, mode }: BrandFormProps) {
  const router = useRouter()
  const { tenant } = useTenant()
  const { createBrand, updateBrand, loading } = useBrandActions()
  const t = useTranslations('brands')

  const [formData, setFormData] = useState<BrandFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        logo_url: initialData.logo_url || '',
        website_url: initialData.website_url || '',
        sort_order: initialData.sort_order.toString(),
        is_active: initialData.is_active,
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || ''
      }
    }
    return { ...defaultBrandFormData }
  })

  const [brandImages, setBrandImages] = useState<string[]>(
    initialData?.logo_url ? [initialData.logo_url] : []
  )
  const [errors, setErrors] = useState<Partial<BrandFormData>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug)
  const [slugValidating, setSlugValidating] = useState(false)
  const [slugValidationTimeout, setSlugValidationTimeout] = useState<NodeJS.Timeout | null>(null)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleNameChange = (name: string) => {
    const newSlug = slugManuallyEdited ? formData.slug : generateSlug(name)
    setFormData(prev => ({
      ...prev,
      name,
      slug: newSlug
    }))
    
    // Validate slug uniqueness if it was auto-generated
    if (!slugManuallyEdited && newSlug.trim()) {
      validateSlugUniqueness(newSlug.trim())
    }
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setFormData(prev => ({
      ...prev,
      slug
    }))
    
    // Validate slug uniqueness with debounce
    if (slug.trim()) {
      validateSlugUniqueness(slug.trim())
    }
  }

  const validateSlugUniqueness = async (slug: string) => {
    if (!tenant?.id || !slug) return

    // Clear existing timeout
    if (slugValidationTimeout) {
      clearTimeout(slugValidationTimeout)
    }

    // Set new timeout for debounced validation
    const timeout = setTimeout(async () => {
      setSlugValidating(true)
      
      try {
        const supabase = createClient()
        
        // Query directly for the slug
        const { data: existingBrands } = await supabase
          .from('brands')
          .select('id, slug')
          .eq('tenant_id', tenant.id)
          .eq('slug', slug)
        
        // Check if slug exists and it's not the current brand being edited
        const isDuplicate = existingBrands && existingBrands.length > 0 && 
          (!initialData || existingBrands[0].id !== initialData.id)
        
        setErrors(prev => ({
          ...prev,
          slug: isDuplicate ? t('slugAlreadyInUse') : undefined
        }))
      } catch (error) {
        console.error('Error validating slug:', error)
      } finally {
        setSlugValidating(false)
      }
    }, 500) // 500ms debounce

    setSlugValidationTimeout(timeout)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<BrandFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('nameIsRequired')
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('slugIsRequired')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('slugInvalidFormat')
    }

    const sortOrder = parseInt(formData.sort_order)
    if (isNaN(sortOrder) || sortOrder < 0) {
      newErrors.sort_order = t('sortOrderMustBeValid')
    }

    if (formData.website_url && !formData.website_url.match(/^https?:\/\/.+/)) {
      newErrors.website_url = t('websiteUrlMustBeValid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      const brandData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        logo_url: brandImages.length > 0 ? brandImages[0] : null,
        website_url: formData.website_url || null,
        sort_order: parseInt(formData.sort_order),
        is_active: formData.is_active,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null
      }

      if (mode === 'create') {
        await createBrand(brandData)
        router.push('/admin/brands')
      } else if (initialData) {
        await updateBrand(initialData.id, brandData)
        router.push('/admin/brands')
      }
    } catch (error) {
      console.error('Failed to save brand:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back button - Mobile first */}
        <div className="flex items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('back')}</span>
          </Button>
        </div>
        
        {/* Title section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {mode === 'create' ? t('createBrand') : t('editBrand')}
          </h1>
          {initialData && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t('editingBrand', { name: initialData.name })}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nameRequired')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={t('enterBrandName')}
                  />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">{t('slugRequired')}</Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder={t('brandSlugPlaceholder')}
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                    {slugValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {errors.slug && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.slug}</AlertDescription>
                    </Alert>
                  )}
                  {!errors.slug && formData.slug && !slugValidating && (
                    <p className="text-sm text-green-600">{t('slugIsAvailable')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('enterBrandDescription')}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website_url">{t('websiteUrl')}</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                  placeholder={t('websiteUrlPlaceholder')}
                />
                {errors.website_url && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.website_url}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Brand Logo */}
          <Card>
            <CardHeader>
              <CardTitle>{t('brandLogo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                tenantId={tenant?.id || ''}
                productId={mode === 'edit' ? initialData?.id : undefined}
                initialImages={brandImages}
                maxImages={1}
                onImagesChange={setBrandImages}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* SEO Information - Hidden on mobile */}
          <Card className="hidden sm:block">
            <CardHeader>
              <CardTitle>{t('seoInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">{t('seoTitle')}</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                  placeholder={t('seoTitlePlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">{t('seoDescription')}</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                  placeholder={t('seoDescriptionPlaceholder')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>{t('preview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {brandImages.length > 0 ? (
                    <img
                      src={brandImages[0]}
                      alt="Brand logo"
                      className="w-12 h-12 object-contain bg-white rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{formData.name || t('brandNamePlaceholder')}</h3>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </div>

                {formData.website_url && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ExternalLink className="h-4 w-4" />
                    <span className="truncate">{formData.website_url}</span>
                  </div>
                )}

                {formData.slug && (
                  <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    /{formData.slug}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('brandStatus')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('brandStatusDescription', { status: formData.is_active ? t('visible') : t('hidden') })}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sort_order">{t('sortOrder')}</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: e.target.value }))}
                  placeholder={t('sortOrderPlaceholder')}
                />
                {errors.sort_order && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.sort_order}</AlertDescription>
                  </Alert>
                )}
                <p className="text-sm text-muted-foreground">
                  {t('sortOrderDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Save Button - Bottom Right */}
      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? t('savingBrand') : t('saveBrand')}
        </Button>
      </div>
    </form>
  )
}
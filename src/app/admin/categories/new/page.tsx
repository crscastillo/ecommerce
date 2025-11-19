'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  FolderOpen,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  CategoryCreateData,
  defaultCategoryFormData 
} from '@/lib/types/category'

export default function NewCategoryPage() {
  const t = useTranslations('categories')
  const router = useRouter()
  const { tenant } = useTenant()
  
  // State
  const [formData, setFormData] = useState(defaultCategoryFormData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugValidation, setSlugValidation] = useState<{
    isValidating: boolean;
    isValid: boolean;
    message: string;
  }>({
    isValidating: false,
    isValid: true,
    message: ''
  })

  const normalizeSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const validateSlugUniqueness = async (slug: string) => {
    if (!tenant?.id || !slug) return

    setSlugValidation(prev => ({ ...prev, isValidating: true }))

    try {
      const supabase = createClient()
      
      // Query directly for the slug
      const { data: existingCategories, error } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('tenant_id', tenant.id)
        .eq('slug', slug)
      
      if (error) {
        setSlugValidation({
          isValidating: false,
          isValid: false,
          message: t('errorCheckingSlugAvailability')
        })
        return
      }

      // Check if slug exists
      const isDuplicate = existingCategories && existingCategories.length > 0
      
      setSlugValidation({
        isValidating: false,
        isValid: !isDuplicate,
        message: isDuplicate ? t('slugAlreadyExists') : ''
      })
    } catch (err) {
      setSlugValidation({
        isValidating: false,
        isValid: false,
        message: t('errorCheckingSlugAvailability')
      })
    }
  }

  useEffect(() => {
    if (!formData.slug) return

    const timeoutId = setTimeout(() => {
      validateSlugUniqueness(formData.slug)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [formData.slug, tenant?.id])

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value
    }))

    // Auto-generate slug when name changes and slug hasn't been manually edited
    if (!slugManuallyEdited) {
      const normalizedSlug = normalizeSlug(value)
      setFormData(prev => ({
        ...prev,
        slug: normalizedSlug
      }))
    }
  }

  const handleSlugChange = (value: string) => {
    const normalizedSlug = normalizeSlug(value)
    setSlugManuallyEdited(true)
    setFormData(prev => ({
      ...prev,
      slug: normalizedSlug
    }))
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t('categoryNameIsRequired')
    }
    if (!formData.slug.trim()) {
      return t('categorySlugIsRequired')
    }
    if (formData.slug.trim() !== formData.slug.trim().toLowerCase()) {
      return t('slugMustBeLowercase')
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      return t('slugInvalidCharacters')
    }
    return null
  }

  const handleSave = async () => {
    if (!tenant?.id) return
    
    setError('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

      if (!slugValidation.isValid) {
        setError(t('fixSlugValidationErrors'))
        return
      }    setSaving(true)

    try {
      const categoryData: CategoryCreateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image_url: formData.image_url.trim() || null,
        parent_id: formData.parent_id || null,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null
      }

      const tenantDb = new TenantDatabase(tenant.id)
      const { data, error: createError } = await tenantDb.createCategory(categoryData)
      
      if (createError) {
        setError(`Failed to create category: ${createError.message}`)
        return
      }

      setShowSuccessDialog(true)
      
      // Redirect to categories list after a short delay
      setTimeout(() => {
        router.push('/admin/categories')
      }, 1500)

    } catch (err: any) {
      console.error('Error creating category:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToCategories')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('createCategory')}</h1>
            <p className="text-muted-foreground">
              {t('addNewCategory')}
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('creating')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('createCategory')}
            </>
          )}
        </Button>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInformation')}</CardTitle>
              <CardDescription>
                {t('essentialCategoryDetails')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">{t('categoryNameRequired')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={t('enterCategoryName')}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">{t('urlSlugRequired')}</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder={t('categoryUrlSlug')}
                    disabled={saving}
                    className={!slugValidation.isValid ? 'border-red-500' : ''}
                  />
                  <div className="flex items-center gap-2 mt-1">
                    {slugValidation.isValidating && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {!slugValidation.isValid && (
                      <AlertCircle className="h-3 w-3 text-red-500" />
                    )}
                    <p className={`text-xs ${slugValidation.isValid ? 'text-muted-foreground' : 'text-red-500'}`}>
                      {slugValidation.message || t('onlyLowercaseAllowed')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('categoryDescription')}
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="image_url">{t('imageUrl')}</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder={t('imageUrlPlaceholder')}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">{t('sortOrder')}</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange('sort_order', e.target.value)}
                    placeholder="0"
                    min="0"
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('seoSettings')}</CardTitle>
              <CardDescription>
                {t('optimizeCategoryForSEO')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">{t('seoTitle')}</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder={t('seoOptimizedTitle')}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('recommended50to60Characters')}
                </p>
              </div>

              <div>
                <Label htmlFor="seo_description">{t('seoDescription')}</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder={t('seoMetaDescription')}
                  rows={2}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('recommended150to160Characters')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Status */}
          <Card>
            <CardHeader>
              <CardTitle>{t('categoryStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={saving}
                />
                <Label htmlFor="is_active">{t('categoryIsActive')}</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('activeCategoriesVisible')}
              </p>
            </CardContent>
          </Card>

          {/* Category Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>{t('guidelines')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">{t('categoryNameRequired')}</h4>
                <p className="text-muted-foreground">
                  {t('categoryNameGuideline')}
                </p>
              </div>
              <div>
                <h4 className="font-medium">{t('urlSlugRequired')}</h4>
                <p className="text-muted-foreground">
                  {t('urlSlugGuideline')}
                </p>
              </div>
              <div>
                <h4 className="font-medium">{t('description')}</h4>
                <p className="text-muted-foreground">
                  {t('descriptionGuideline')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={() => {}}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center">{t('categoryCreated')}</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('categoryCreatedSuccess')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
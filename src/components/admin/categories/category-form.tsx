'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ImageUpload } from '@/components/admin/image-upload'
import { AlertCircle, Save, ArrowLeft, FolderOpen, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { 
  CategoryFormData, 
  defaultCategoryFormData,
  CategoryCreateData,
  Category
} from '@/lib/types/category'
import Link from 'next/link'

interface CategoryFormProps {
  initialData?: Category
  mode: 'create' | 'edit'
}

export function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('category.form')
  const tCommon = useTranslations('common')

  const [formData, setFormData] = useState<CategoryFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        image_url: initialData.image_url || '',
        parent_id: initialData.parent_id || '',
        sort_order: initialData.sort_order.toString(),
        is_active: initialData.is_active,
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || ''
      }
    }
    return { ...defaultCategoryFormData }
  })

  const [categoryImages, setCategoryImages] = useState<string[]>(
    initialData?.image_url ? [initialData.image_url] : []
  )
  const [errors, setErrors] = useState<Partial<CategoryFormData>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug)
  const [slugValidating, setSlugValidating] = useState(false)
  const [slugValidationTimeout, setSlugValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
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
        let query = supabase
          .from('categories')
          .select('id, slug')
          .eq('tenant_id', tenant.id)
          .eq('slug', slug)

        // In edit mode, exclude the current category
        if (mode === 'edit' && initialData?.id) {
          query = query.neq('id', initialData.id)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error checking slug uniqueness:', error)
          setErrors(prev => ({ ...prev, slug: 'Error checking slug availability' }))
          return
        }

        const isDuplicate = data && data.length > 0
        setErrors(prev => ({
          ...prev,
          slug: isDuplicate ? 'This slug is already in use' : undefined
        }))
      } catch (err) {
        console.error('Error validating slug:', err)
        setErrors(prev => ({ ...prev, slug: 'Error checking slug availability' }))
      } finally {
        setSlugValidating(false)
      }
    }, 500)

    setSlugValidationTimeout(timeout)
  }

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CategoryFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('fields.name.required')
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Category slug is required'
    } else if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens'
    }

    if (formData.sort_order && isNaN(parseInt(formData.sort_order))) {
      newErrors.sort_order = 'Sort order must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (errors.slug) return // Don't submit if slug validation failed

    if (!tenant?.id) {
      setError('Tenant not found')
      return
    }

    try {
      setLoading(true)
      setError('')

      const categoryData: CategoryCreateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        image_url: categoryImages.length > 0 ? categoryImages[0] : null,
        parent_id: formData.parent_id || null,
        sort_order: parseInt(formData.sort_order) || 0,
        is_active: formData.is_active,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null
      }

      const tenantDb = new TenantDatabase(tenant.id)

      if (mode === 'create') {
        const { data, error: createError } = await tenantDb.createCategory(categoryData)
        
        if (createError) {
          throw new Error(createError.message || 'Failed to create category')
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/categories')
        }, 1500)
      } else if (initialData) {
        const { error: updateError } = await tenantDb.updateCategory(initialData.id, categoryData)
        
        if (updateError) {
          throw new Error(updateError.message || 'Failed to update category')
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/categories')
        }, 1500)
      }
    } catch (err: any) {
      console.error('Error saving category:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? t('title.new') : t('title.edit')}
            </h1>
            {initialData && (
              <p className="text-muted-foreground">
                {t('editingCategory', { name: initialData.name })}
              </p>
            )}
          </div>
        </div>
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? (mode === 'create' ? t('buttons.creating') : t('buttons.updating')) : (mode === 'create' ? t('buttons.create') : t('buttons.update'))}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <FolderOpen className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {mode === 'create' ? tCommon('categoryCreated') : tCommon('categoryUpdated')}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.basic')}</CardTitle>
              <CardDescription>Enter the basic information for this category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('fields.name.label')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={t('fields.name.placeholder')}
                    disabled={loading}
                  />
                  {errors.name && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.name}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">{t('fields.slug.label')}</Label>
                  <div className="relative">
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder={t('fields.slug.placeholder')}
                      className={errors.slug ? 'border-red-500' : ''}
                      disabled={loading}
                    />
                    {slugValidating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
                    <p className="text-sm text-green-600">Slug is available</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('fields.description.label')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('fields.description.placeholder')}
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', e.target.value)}
                  placeholder="0"
                  disabled={loading}
                />
                {errors.sort_order && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.sort_order}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Image */}
          <Card>
            <CardHeader>
              <CardTitle>{t('fields.image.label')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                tenantId={tenant?.id || ''}
                productId={mode === 'edit' ? initialData?.id : undefined}
                initialImages={categoryImages}
                maxImages={1}
                onImagesChange={setCategoryImages}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* SEO Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('sections.seo')}</CardTitle>
              <CardDescription>Optimize this category for search engines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">{t('fields.seo.title.label')}</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder={t('fields.seo.title.placeholder')}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">{t('fields.seo.description.label')}</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder={t('fields.seo.description.placeholder')}
                  rows={3}
                  disabled={loading}
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
                  {categoryImages.length > 0 ? (
                    <img
                      src={categoryImages[0]}
                      alt="Category image"
                      className="w-12 h-12 object-cover bg-white rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <FolderOpen className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{formData.name || t('categoryNamePlaceholder')}</h3>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {formData.description}
                      </p>
                    )}
                  </div>
                </div>

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
              <CardTitle>{t('sections.advanced')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('fields.status.label')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('fields.status.description')}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={loading}
                />
              </div>

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Categories with lower sort order appear first in listings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
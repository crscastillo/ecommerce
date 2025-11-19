'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  AlertCircle,
  Loader2,
  FolderOpen,
  Package
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Category, 
  CategoryCreateData,
  defaultCategoryFormData 
} from '@/lib/types/category'

interface CategoryWithProductCount extends Category {
  product_count?: number
}

export default function CategoryPage() {
  const t = useTranslations('categories')
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  
  const categoryId = params.id as string
  
  // State
  const [category, setCategory] = useState<CategoryWithProductCount | null>(null)
  const [formData, setFormData] = useState(defaultCategoryFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      if (!tenant?.id || !categoryId) return

      try {
        setLoading(true)
        setError('')
        
        const tenantDb = new TenantDatabase(tenant.id)
        const { data, error: fetchError } = await tenantDb.getCategory(categoryId)
        
        if (fetchError) {
          setError(`Failed to load category: ${fetchError.message}`)
          return
        }
        
        if (!data) {
          setError('Category not found')
          return
        }
        
        setCategory(data)
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || '',
          image_url: data.image_url || '',
          parent_id: data.parent_id || '',
          sort_order: data.sort_order.toString(),
          is_active: data.is_active,
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || ''
        })
      } catch (err: any) {
        console.error('Error loading category:', err)
        setError('Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [tenant?.id, categoryId])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes
    if (field === 'name' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Category name is required'
    }
    if (!formData.slug.trim()) {
      return 'Category slug is required'
    }
    if (formData.slug.trim() !== formData.slug.trim().toLowerCase()) {
      return 'Slug must be lowercase'
    }
    if (!/^[a-z0-9-]+$/.test(formData.slug.trim())) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens'
    }
    return null
  }

  const handleSave = async () => {
    if (!tenant?.id || !categoryId) return
    
    setError('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

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
      const { error: updateError } = await tenantDb.updateCategory(categoryId, categoryData)
      
      if (updateError) {
        setError(`Failed to update category: ${updateError.message}`)
        return
      }

      setSuccess(true)
      
      // Reload category data
      const { data: updatedCategory } = await tenantDb.getCategory(categoryId)
      if (updatedCategory) {
        setCategory(updatedCategory)
      }

      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Error updating category:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tenant?.id || !categoryId) return

    setDeleting(true)

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: deleteError } = await tenantDb.deleteCategory(categoryId)
      
      if (deleteError) {
        setError(`Failed to delete category: ${deleteError.message}`)
        return
      }

      // Navigate back to categories list
      router.push('/admin/categories')
    } catch (err: any) {
      console.error('Error deleting category:', err)
      setError('Failed to delete category')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
          <p className="text-muted-foreground">Loading category...</p>
        </div>
      </div>
    )
  }

  if (error && !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Category Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToCategories')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!category) return null

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
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">{t('editCategoryDetails')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave} 
            disabled={saving || deleting}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('saveChanges')}
              </>
            )}
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            disabled={saving || deleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t('deleteCategory')}
          </Button>
        </div>
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

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-600">
              <FolderOpen className="w-4 h-4" />
              {t('categoryUpdatedSuccessfully')}
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
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('enterCategoryName')}
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">{t('urlSlugRequired')}</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder={t('categoryUrlSlug')}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('onlyLowercaseAllowed')}
                  </p>
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
                {t('seoOptimizeDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">{t('seoTitle')}</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder={t('seoTitlePlaceholder')}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('seoTitleGuideline')}
                </p>
              </div>

              <div>
                <Label htmlFor="seo_description">{t('seoDescription')}</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder={t('seoDescriptionPlaceholder')}
                  rows={2}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('seoDescriptionGuideline')}
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
            </CardContent>
          </Card>

          {/* Category Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('categoryInformation')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('created')}</span>
                <p className="font-medium">
                  {new Date(category.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('lastUpdated')}</span>
                <p className="font-medium">
                  {new Date(category.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">{t('categoryId')}</span>
                <p className="font-mono text-xs">{category.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCategoryConfirmation', { name: category?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('deleting')}
                </>
              ) : (
                t('deleteCategory')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { tenant, isLoading: tenantLoading } = useTenant()
  
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
          message: 'Error checking slug availability'
        })
        return
      }

      // Check if slug exists
      const isDuplicate = existingCategories && existingCategories.length > 0
      
      setSlugValidation({
        isValidating: false,
        isValid: !isDuplicate,
        message: isDuplicate ? 'A category with this slug already exists' : ''
      })
    } catch (err) {
      setSlugValidation({
        isValidating: false,
        isValid: false,
        message: 'Error checking slug availability'
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
    if (!tenant?.id) return
    
    setError('')
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    if (!slugValidation.isValid) {
      setError('Please fix the slug validation errors before saving')
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

  // Show loading state while tenant is loading
  if (tenantLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Category</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show tenant access required message if no tenant after loading
  if (!tenantLoading && !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create Category</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Access Required</h3>
            <p className="text-gray-600 mb-4">
              Category creation requires access via your store subdomain.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Don't render until we have a tenant
  if (!tenant) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
            <p className="text-muted-foreground">
              Add a new category to organize your products
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
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Create Category
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
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential category details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter category name"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="category-url-slug"
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
                      {slugValidation.message || 'Only lowercase letters, numbers, and hyphens allowed'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Category description"
                  rows={3}
                  disabled={saving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
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
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your category for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder="SEO optimized title"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 50-60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder="SEO meta description"
                  rows={2}
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 150-160 characters
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
              <CardTitle>Category Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  disabled={saving}
                />
                <Label htmlFor="is_active">Category is active</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Active categories will be visible to customers in your store
              </p>
            </CardContent>
          </Card>

          {/* Category Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium">Category Name</h4>
                <p className="text-muted-foreground">
                  Use clear, descriptive names that customers will easily understand
                </p>
              </div>
              <div>
                <h4 className="font-medium">URL Slug</h4>
                <p className="text-muted-foreground">
                  Keep it short and relevant for better SEO. Auto-generated from name.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Description</h4>
                <p className="text-muted-foreground">
                  Help customers understand what products they'll find in this category
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
            <AlertDialogTitle className="text-center">Category Created!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Your category has been created successfully. Redirecting to categories list...
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
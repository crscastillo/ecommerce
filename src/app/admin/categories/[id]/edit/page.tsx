'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  Trash2,
  AlertCircle,
  Loader2,
  FolderOpen
} from 'lucide-react'
import Link from 'next/link'
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

export default function CategoryEditPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  
  const categoryId = params.id as string
  
  // State
  const [category, setCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState(defaultCategoryFormData)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
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

      // Navigate back to categories list
      router.push('/admin/categories')
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Error Loading Category</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
            <p className="text-muted-foreground">
              Update category information and settings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)}
            disabled={saving || deleting}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || deleting}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
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
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter category name"
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="category-url-slug"
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
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
            </CardContent>
          </Card>

          {/* Category Info */}
          {category && (
            <Card>
              <CardHeader>
                <CardTitle>Category Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <p className="font-medium">
                    {new Date(category.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <p className="font-medium">
                    {new Date(category.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category ID:</span>
                  <p className="font-mono text-xs">{category.id}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{category?.name}"? This action cannot be undone and will remove the category from all products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Category'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
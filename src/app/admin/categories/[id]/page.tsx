'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
  Edit,
  Eye,
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
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tenant } = useTenant()
  
  const categoryId = params.id as string
  
  // Determine initial mode from URL params or default to view
  const [mode, setMode] = useState<'view' | 'edit'>(
    searchParams.get('mode') === 'edit' ? 'edit' : 'view'
  )
  
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

    // Auto-generate slug when name changes (only in edit mode)
    if (field === 'name' && mode === 'edit' && !formData.slug) {
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
      setMode('view')
      
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
                Back to Categories
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
              Back to Categories
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground">
              {mode === 'view' ? 'View category details' : 'Edit category details'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {mode === 'view' ? (
            <>
              <Button 
                variant="outline" 
                asChild
              >
                <Link href={`/products/category/${category.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  View in Store
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setMode('edit')}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                disabled={saving || deleting}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setMode('view')
                  setError('')
                }}
              >
                Cancel
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
            </>
          )}
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
              Category updated successfully!
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
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm font-medium">{category.name}</p>
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter category name"
                      disabled={saving}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm font-mono">{category.slug}</p>
                  ) : (
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="category-url-slug"
                      disabled={saving}
                    />
                  )}
                  {mode === 'edit' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Only lowercase letters, numbers, and hyphens allowed
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm whitespace-pre-wrap">{category.description || 'No description'}</p>
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Category description"
                    rows={3}
                    disabled={saving}
                  />
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  {mode === 'view' ? (
                    category.image_url ? (
                      <div className="mt-1">
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-all">{category.image_url}</p>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">No image</p>
                    )
                  ) : (
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => handleInputChange('image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={saving}
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm">{category.sort_order}</p>
                  ) : (
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => handleInputChange('sort_order', e.target.value)}
                      placeholder="0"
                      min="0"
                      disabled={saving}
                    />
                  )}
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
                {mode === 'view' ? (
                  <p className="mt-1 text-sm text-muted-foreground">{category.seo_title || 'Not set'}</p>
                ) : (
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO optimized title"
                    disabled={saving}
                  />
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 50-60 characters
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{category.seo_description || 'Not set'}</p>
                ) : (
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                    disabled={saving}
                  />
                )}
                {mode === 'edit' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: 150-160 characters
                  </p>
                )}
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
              {mode === 'view' ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    disabled={saving}
                  />
                  <Label htmlFor="is_active">Category is active</Label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Statistics */}
          {mode === 'view' && (
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Products:</span>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{category.product_count || 0}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">URL Path:</span>
                  <span className="text-sm font-mono">/products/{category.slug}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Information */}
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
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, Save } from 'lucide-react'
import { 
  Category, 
  CategoryFormData, 
  CategoryCreateData, 
  defaultCategoryFormData 
} from '@/lib/types/category'

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: CategoryCreateData) => Promise<void>
  category?: Category | null
  loading?: boolean
}

export function CategoryForm({ 
  open, 
  onOpenChange, 
  onSave, 
  category, 
  loading = false 
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(defaultCategoryFormData)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isEditing = !!category

  // Reset form when dialog opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          image_url: category.image_url || '',
          parent_id: category.parent_id || '',
          sort_order: category.sort_order.toString(),
          is_active: category.is_active,
          seo_title: category.seo_title || '',
          seo_description: category.seo_description || ''
        })
      } else {
        setFormData(defaultCategoryFormData)
      }
      setError('')
    }
  }, [open, category])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate slug when name changes (only for new categories)
    if (field === 'name' && !isEditing) {
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

      await onSave(categoryData)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update category information and settings'
              : 'Add a new category to organize your products'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
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

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                disabled={saving}
              />
              <Label htmlFor="is_active">Category is active</Label>
            </div>
          </div>

          {/* SEO Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SEO Settings</h3>
            
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
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={saving || loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
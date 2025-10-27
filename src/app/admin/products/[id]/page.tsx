'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/admin/image-upload'
import { 
  ArrowLeft, 
  Save, 
  Package,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Edit
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  sku: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  track_inventory: boolean
  inventory_quantity: number
  allow_backorder: boolean
  weight: number | null
  category_id: string | null
  is_active: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  images: string[]
  variants: any
  created_at: string
  updated_at: string
}

export default function ProductViewPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tenant } = useTenant()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>(
    searchParams.get('mode') === 'edit' ? 'edit' : 'view'
  )

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    track_inventory: true,
    inventory_quantity: '',
    allow_backorder: false,
    weight: '',
    category_id: '',
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  })

  const [productImages, setProductImages] = useState<string[]>([])

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!tenant?.id || !productId) {
        console.log('Missing tenant ID or product ID')
        return
      }

      try {
        setLoading(true)
        const tenantDb = new TenantDatabase(tenant.id)
        
        // Load product
        const { data: productData, error: productError } = await tenantDb.getProduct(productId)
        
        if (productError || !productData) {
          setError('Product not found')
          return
        }

        setProduct(productData)
        setProductImages(Array.isArray(productData.images) ? productData.images : [])
        
        // Initialize form data
        setFormData({
          name: productData.name,
          slug: productData.slug,
          description: productData.description || '',
          short_description: productData.short_description || '',
          sku: productData.sku || '',
          price: productData.price.toString(),
          compare_price: productData.compare_price?.toString() || '',
          cost_price: productData.cost_price?.toString() || '',
          track_inventory: productData.track_inventory,
          inventory_quantity: productData.inventory_quantity.toString(),
          allow_backorder: productData.allow_backorder,
          weight: productData.weight?.toString() || '',
          category_id: productData.category_id || '',
          is_active: productData.is_active,
          is_featured: productData.is_featured,
          seo_title: productData.seo_title || '',
          seo_description: productData.seo_description || '',
        })

        // Load categories
        const { data: categoriesData } = await tenantDb.getCategories({ is_active: true })
        setCategories(categoriesData || [])

      } catch (err) {
        console.error('Error loading product:', err)
        setError('Failed to load product')
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [tenant?.id, productId])

  const handleInputChange = (field: string, value: any) => {
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

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSave = async () => {
    if (!tenant?.id || !product) return

    setError('')
    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        setError('Product name is required')
        return
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Valid price is required')
        return
      }

      const tenantDb = new TenantDatabase(tenant.id)
      
      const updateData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        sku: formData.sku.trim() || null,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        track_inventory: formData.track_inventory,
        inventory_quantity: formData.track_inventory ? parseInt(formData.inventory_quantity) : 0,
        allow_backorder: formData.allow_backorder,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        images: productImages,
      }

      const { error: updateError } = await tenantDb.updateProduct(product.id, updateData)

      if (updateError) {
        setError(`Failed to update product: ${updateError.message}`)
        return
      }

      setSuccess(true)
      setMode('view')
      
      // Reload product data
      const { data: updatedProduct } = await tenantDb.getProduct(productId)
      if (updatedProduct) {
        setProduct(updatedProduct)
      }

      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      console.error('Error updating product:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!tenant?.id || !product) return
    
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      setSaving(true)
      const tenantDb = new TenantDatabase(tenant.id)
      
      const { error: deleteError } = await tenantDb.deleteProduct(product.id)
      
      if (deleteError) {
        setError(`Failed to delete product: ${deleteError.message}`)
        return
      }

      // Redirect to products list
      router.push('/admin/products')

    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product')
    } finally {
      setSaving(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading product...</span>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              {mode === 'view' ? 'View product details' : 'Edit product details'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {mode === 'view' ? (
            <>
              <Button 
                variant="outline" 
                asChild
              >
                <Link href={`/products/${product.slug}`} target="_blank">
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
                onClick={handleDelete}
                disabled={saving}
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
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
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
              <Package className="w-4 h-4" />
              Product updated successfully!
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential product details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm">{product.name}</p>
                  ) : (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm font-mono">{product.slug}</p>
                  ) : (
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="product-url-slug"
                    />
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm whitespace-pre-wrap">{product.description || 'No description'}</p>
                ) : (
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter product description"
                    rows={4}
                  />
                )}
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm">{product.short_description || 'No short description'}</p>
                ) : (
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief product summary"
                    rows={2}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Product pricing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm font-semibold">{formatPrice(product.price)}</p>
                  ) : (
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="compare_price">Compare Price</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm">{product.compare_price ? formatPrice(product.compare_price) : 'Not set'}</p>
                  ) : (
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compare_price}
                      onChange={(e) => handleInputChange('compare_price', e.target.value)}
                      placeholder="0.00"
                    />
                  )}
                </div>
                <div>
                  <Label htmlFor="cost_price">Cost per Item</Label>
                  {mode === 'view' ? (
                    <p className="mt-1 text-sm">{product.cost_price ? formatPrice(product.cost_price) : 'Not set'}</p>
                  ) : (
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={(e) => handleInputChange('cost_price', e.target.value)}
                      placeholder="0.00"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
              <CardDescription>
                Track and manage product inventory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'view' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Track quantity:</span>
                    <Badge variant={product.track_inventory ? "default" : "secondary"}>
                      {product.track_inventory ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {product.track_inventory && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quantity:</span>
                        <span className="text-sm font-medium">{product.inventory_quantity}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Allow backorder:</span>
                        <Badge variant={product.allow_backorder ? "default" : "secondary"}>
                          {product.allow_backorder ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SKU:</span>
                    <span className="text-sm font-mono">{product.sku || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Weight:</span>
                    <span className="text-sm">{product.weight ? `${product.weight} lbs` : 'Not set'}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="track_inventory"
                      checked={formData.track_inventory}
                      onCheckedChange={(checked: any) => handleInputChange('track_inventory', checked)}
                    />
                    <Label htmlFor="track_inventory">Track quantity</Label>
                  </div>

                  {formData.track_inventory && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="inventory_quantity">Quantity</Label>
                        <Input
                          id="inventory_quantity"
                          type="number"
                          min="0"
                          value={formData.inventory_quantity}
                          onChange={(e) => handleInputChange('inventory_quantity', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="allow_backorder"
                          checked={formData.allow_backorder}
                          onCheckedChange={(checked: any) => handleInputChange('allow_backorder', checked)}
                        />
                        <Label htmlFor="allow_backorder">Continue selling when out of stock</Label>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => handleInputChange('sku', e.target.value)}
                        placeholder="Product SKU"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (lbs)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.weight}
                        onChange={(e) => handleInputChange('weight', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                {mode === 'view' ? 'Product image gallery' : 'Upload and manage product images'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === 'view' ? (
                productImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {productImages.map((imageUrl, index) => (
                      <div key={imageUrl} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${product.name} image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {index === 0 && (
                          <Badge className="absolute top-2 left-2 text-xs">
                            Main
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No images uploaded</p>
                )
              ) : (
                tenant?.id && (
                  <ImageUpload
                    tenantId={tenant.id}
                    productId={product.slug}
                    initialImages={productImages}
                    maxImages={10}
                    onImagesChange={setProductImages}
                    disabled={saving}
                  />
                )
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>Search Engine Optimization</CardTitle>
              <CardDescription>
                Optimize your product for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm">{product.seo_title || 'Not set'}</p>
                ) : (
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO optimized title"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                {mode === 'view' ? (
                  <p className="mt-1 text-sm">{product.seo_description || 'Not set'}</p>
                ) : (
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mode === 'view' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Featured:</span>
                    <Badge variant={product.is_featured ? "default" : "secondary"}>
                      {product.is_featured ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked: any) => handleInputChange('is_active', checked)}
                    />
                    <Label htmlFor="is_active">Product is active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked: any) => handleInputChange('is_featured', checked)}
                    />
                    <Label htmlFor="is_featured">Featured product</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              {mode === 'view' ? (
                <p className="text-sm">
                  {categories.find(c => c.id === product.category_id)?.name || 'No category assigned'}
                </p>
              ) : (
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(product.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{new Date(product.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Product ID:</span>
                <span className="font-mono text-xs">{product.id}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
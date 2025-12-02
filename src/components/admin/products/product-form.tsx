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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DetailedSelect } from '@/components/ui/detailed-select'
import { ImageUpload } from '@/components/admin/image-upload'
import { AlertCircle, Save, ArrowLeft, Package, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { 
  ProductFormData, 
  defaultProductFormData,
  ProductType
} from '@/lib/types/product'
import { prepareImagesForStorage } from '@/lib/utils/image-utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface Brand {
  id: string
  name: string
  slug: string
  is_active: boolean
}

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  product_type: ProductType
  sku: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  track_inventory: boolean
  inventory_quantity: number
  allow_backorder: boolean
  weight: number | null
  category_id: string | null
  brand_id: string | null
  is_active: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  images: any
}

interface ProductFormProps {
  initialData?: Product
  mode: 'create' | 'edit'
}

export function ProductForm({ initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('products')
  
  // Get weight unit from tenant settings, default to 'kg'
  const weightUnit = tenant?.settings?.weight_unit || 'kg'

  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        short_description: initialData.short_description || '',
        product_type: initialData.product_type,
        sku: initialData.sku || '',
        price: initialData.price.toString(),
        compare_price: initialData.compare_price?.toString() || '',
        cost_price: initialData.cost_price?.toString() || '',
        track_inventory: initialData.track_inventory,
        inventory_quantity: initialData.inventory_quantity.toString(),
        allow_backorder: initialData.allow_backorder,
        weight: initialData.weight?.toString() || '',
        category_id: initialData.category_id || '',
        brand_id: initialData.brand_id || '',
        is_active: initialData.is_active,
        is_featured: initialData.is_featured,
        seo_title: initialData.seo_title || '',
        seo_description: initialData.seo_description || ''
      }
    }
    return { ...defaultProductFormData }
  })

  const [productImages, setProductImages] = useState<string[]>(
    initialData?.images ? (Array.isArray(initialData.images) ? initialData.images : []) : []
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [errors, setErrors] = useState<Partial<ProductFormData>>({})
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!initialData?.slug)
  const [slugValidating, setSlugValidating] = useState(false)
  const [slugValidationTimeout, setSlugValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Load categories and brands
  useEffect(() => {
    const loadData = async () => {
      if (!tenant?.id) return

      try {
        const tenantDb = new TenantDatabase(tenant.id)
        
        const { data: categoriesData } = await tenantDb.getCategories({ is_active: true })
        setCategories(categoriesData || [])

        const { data: brandsData } = await tenantDb.getBrands({ is_active: true })
        setBrands(brandsData || [])
      } catch (err) {
        console.error('Error loading categories and brands:', err)
      }
    }

    loadData()
  }, [tenant?.id])

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, name: value }))

    // Auto-generate slug if it hasn't been manually edited
    if (!slugManuallyEdited && value) {
      const newSlug = generateSlug(value)
      setFormData(prev => ({ ...prev, slug: newSlug }))
      validateSlug(newSlug)
    }

    // Clear name error
    setErrors(prev => ({ ...prev, name: undefined }))
  }

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true)
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    setFormData(prev => ({ ...prev, slug: cleanSlug }))
    validateSlug(cleanSlug)
    setErrors(prev => ({ ...prev, slug: undefined }))
  }

  const validateSlug = (slug: string) => {
    if (!slug || !tenant?.id) return

    // Clear existing timeout
    if (slugValidationTimeout) {
      clearTimeout(slugValidationTimeout)
    }

    // Set loading state immediately
    setSlugValidating(true)

    const timeout = setTimeout(async () => {
      try {
        const supabase = createClient()
        
        // Query directly for the slug
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id, slug')
          .eq('tenant_id', tenant.id)
          .eq('slug', slug)
        
        // Check if slug exists and it's not the current product being edited
        const isDuplicate = existingProducts && existingProducts.length > 0 && 
          (!initialData || existingProducts[0].id !== initialData.id)
        
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

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear specific field errors
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ProductFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('nameIsRequired')
    }

    if (!formData.slug.trim()) {
      newErrors.slug = t('slugIsRequired')
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = t('slugInvalidFormat')
    }

    if (formData.product_type !== 'variable' && formData.product_type !== 'digital') {
      if (!formData.price || parseFloat(formData.price) < 0) {
        newErrors.price = t('priceIsRequired')
      }

      if (formData.track_inventory && (!formData.inventory_quantity || parseInt(formData.inventory_quantity) < 0)) {
        newErrors.inventory_quantity = t('inventoryQuantityRequired')
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    
    if (!validateForm()) {
      return
    }

    if (!tenant?.id) {
      setError(t('noTenantFound'))
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        product_type: formData.product_type,
        sku: formData.sku.trim() || null,
        price: formData.product_type === 'variable' ? 0 : parseFloat(formData.price),
        compare_price: formData.product_type === 'variable' ? null : (formData.compare_price ? parseFloat(formData.compare_price) : null),
        cost_price: formData.product_type === 'variable' ? null : (formData.cost_price ? parseFloat(formData.cost_price) : null),
        track_inventory: formData.product_type === 'digital' ? false : formData.track_inventory,
        inventory_quantity: formData.product_type === 'digital' || formData.product_type === 'variable' ? 0 : (formData.track_inventory ? parseInt(formData.inventory_quantity) : 0),
        allow_backorder: formData.product_type === 'digital' ? false : formData.allow_backorder,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        images: prepareImagesForStorage(productImages),
        tenant_id: tenant.id,
      }

      if (mode === 'create') {
        const { error: insertError } = await supabase
          .from('products')
          .insert(productData)

        if (insertError) {
          throw new Error(insertError.message)
        }

        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      } else {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', initialData!.id)
          .eq('tenant_id', tenant.id)

        if (updateError) {
          throw new Error(updateError.message)
        }

        setSuccess(true)
      }

    } catch (err: any) {
      console.error('Error saving product:', err)
      setError(err.message || t('failedToSaveProduct'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back button - Mobile first */}
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">{t('backToProducts')}</span>
          </Button>
        </div>
        
        {/* Title section */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {mode === 'create' ? t('createProduct') : t('editProduct')}
          </h1>
          {initialData && (
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t('editingProduct', { name: initialData.name })}
            </p>
          )}
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {mode === 'create' ? t('productCreatedSuccessfully') : t('productUpdatedSuccessfully')}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('basicInformation')}</CardTitle>
              <CardDescription>{t('essentialProductDetails')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Type */}
              <div>
                <Label htmlFor="product_type">{t('productTypeRequired')}</Label>
                <DetailedSelect
                  id="product_type"
                  value={formData.product_type}
                  onValueChange={(value) => handleInputChange('product_type', value as ProductType)}
                  placeholder={t('selectProductType')}
                  options={[
                    {
                      value: 'single',
                      label: t('singleProduct'),
                      description: t('singleProductDescription')
                    },
                    {
                      value: 'variable',
                      label: t('variableProduct'),
                      description: t('variableProductDescription')
                    },
                    {
                      value: 'digital',
                      label: t('digitalProduct'),
                      description: t('digitalProductDescription')
                    }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('nameRequired')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={t('enterProductName')}
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
                      placeholder={t('productSlugPlaceholder')}
                      className={errors.slug ? 'border-red-500' : ''}
                    />
                    {slugValidating && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
                  {formData.slug && !errors.slug && !slugValidating && (
                    <p className="text-sm text-green-600 mt-1">✓ {t('slugIsAvailable')}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">{t('sku')}</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  placeholder={t('skuPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">{t('shortDescription')}</Label>
                <Input
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder={t('briefProductDescription')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('detailedProductDescription')}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          {formData.product_type !== 'variable' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('pricing')}</CardTitle>
                <CardDescription>{t('productPricingAndCost')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t('priceRequired')}</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.price}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="compare_price">{t('comparePrice')}</Label>
                    <Input
                      id="compare_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compare_price}
                      onChange={(e) => handleInputChange('compare_price', e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('comparePriceDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_price">{t('costPrice')}</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={(e) => handleInputChange('cost_price', e.target.value)}
                      placeholder="0.00"
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('costPriceDescription')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inventory */}
          {formData.product_type !== 'digital' && formData.product_type !== 'variable' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('inventory')}</CardTitle>
                <CardDescription>{t('inventoryManagement')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t('trackInventory')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('trackInventoryDescription')}
                    </p>
                  </div>
                  <Switch
                    checked={formData.track_inventory}
                    onCheckedChange={(checked) => handleInputChange('track_inventory', checked)}
                  />
                </div>

                {formData.track_inventory && (
                  <>
                    <Separator />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="inventory_quantity">{t('inventoryQuantity')}</Label>
                        <Input
                          id="inventory_quantity"
                          type="number"
                          min="0"
                          value={formData.inventory_quantity}
                          onChange={(e) => handleInputChange('inventory_quantity', e.target.value)}
                          placeholder="0"
                        />
                        {errors.inventory_quantity && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{errors.inventory_quantity}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">{t('weight')} ({weightUnit})</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.weight}
                          onChange={(e) => handleInputChange('weight', e.target.value)}
                          placeholder={`0.00 ${weightUnit}`}
                        />
                        <p className="text-sm text-muted-foreground">
                          {t('weightDescription')} {t('weightUnitNote', { unit: weightUnit === 'kg' ? t('weightUnitKg') : t('weightUnitLbs') })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('allowBackorder')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('allowBackorderDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={formData.allow_backorder}
                        onCheckedChange={(checked) => handleInputChange('allow_backorder', checked)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* SEO - Hidden on mobile */}
          <Card className="hidden sm:block">
            <CardHeader>
              <CardTitle>{t('seo')}</CardTitle>
              <CardDescription>{t('searchEngineOptimization')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">{t('seoTitle')}</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder={t('seoTitlePlaceholder')}
                />
                <p className="text-sm text-muted-foreground">
                  {t('seoTitleDescription')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo_description">{t('seoDescription')}</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder={t('seoDescriptionPlaceholder')}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  {t('seoDescriptionDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories & Brands */}
          <Card>
            <CardHeader>
              <CardTitle>{t('organization')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <Select
                  value={formData.category_id || 'none'}
                  onValueChange={(value) => handleInputChange('category_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noCategory')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('brand')}</Label>
                <Select
                  value={formData.brand_id || 'none'}
                  onValueChange={(value) => handleInputChange('brand_id', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectBrand')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('noBrand')}</SelectItem>
                    {brands.filter(brand => brand.is_active).map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>{t('productImages')}</CardTitle>
              <CardDescription>{t('uploadProductImages')}</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                tenantId={tenant?.id || ''}
                productId={mode === 'edit' ? initialData?.id : undefined}
                initialImages={productImages}
                maxImages={10}
                onImagesChange={setProductImages}
                disabled={loading}
              />
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
                  <Label>{t('productStatus')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('productStatusDescription', { status: formData.is_active ? t('visible') : t('hidden') })}
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('featuredProduct')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('featuredProductDescription')}
                  </p>
                </div>
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {formData.slug && (
            <Card>
              <CardHeader>
                <CardTitle>{t('preview')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  /{formData.slug}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Save Button - Bottom Right */}
      <div className="flex justify-end pt-6 border-t">
        <Button type="submit" disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? t('savingProduct') : t('saveProduct')}
        </Button>
      </div>
    </form>
  )
}
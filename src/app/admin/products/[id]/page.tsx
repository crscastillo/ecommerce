'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { formatPrice } from '@/lib/utils/currency'
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
import { DetailedSelect } from '@/components/ui/detailed-select'
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
  Edit,
  Plus,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { parseProductImages, prepareImagesForStorage, createImagePlaceholder, isSupabaseStorageUrl } from '@/lib/utils/image-utils'
import { createClient } from '@/lib/supabase/client'

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
  product_type: 'single' | 'variable' | 'digital'
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
  const t = useTranslations('products')
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [product, setProduct] = useState<Product | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    product_type: 'single' as 'single' | 'variable' | 'digital',
    sku: '',
    price: '',
    compare_price: '',
    cost_price: '',
    track_inventory: true,
    inventory_quantity: '',
    allow_backorder: false,
    weight: '',
    category_id: 'none',
    brand_id: 'none',
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  })

  const [productImages, setProductImages] = useState<string[]>([])
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [slugValidating, setSlugValidating] = useState(false)
  const [slugValidationTimeout, setSlugValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [slugError, setSlugError] = useState('')

  // Variations state for variable products
  const [variationOptions, setVariationOptions] = useState<Array<{
    name: string
    values: string[]
  }>>([{ name: '', values: [] }])
  
  // Local input state for values to prevent immediate comma processing
  const [valueInputs, setValueInputs] = useState<string[]>([''])
  
  const [variations, setVariations] = useState<Array<{
    id: string
    title: string
    attributes: Array<{ name: string; value: string }>
    sku: string
    price: string
    compare_price: string
    cost_price: string
    stock_quantity: string
    weight: string
    is_active: boolean
  }>>([])

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
        
        // Parse images using the utility function
        const parsedResult = parseProductImages(productData.images)
        console.log('Raw product images data:', productData.images)
        console.log('Parsed images result:', parsedResult)
        
        if (parsedResult.errors.length > 0) {
          console.warn('Image parsing errors:', parsedResult.errors)
        }
        
        setProductImages(parsedResult.images)
        
        // Parse variations for variable products
        if (productData.product_type === 'variable' && productData.variants) {
          console.log('Product type is variable, raw variants data:', productData.variants)
          console.log('Variants type:', typeof productData.variants)
          
          // Variants should now be an array from product_variants table
          const variants = Array.isArray(productData.variants) ? productData.variants : []
          
          console.log('Processing variants from product_variants table:', variants.length)
          
          if (variants.length > 0) {
            // Extract unique options from variations
            const optionsMap = new Map<string, Set<string>>()
            
            variants.forEach((variant: any, idx: number) => {
              console.log(`Variant ${idx}:`, variant)
              
              // Check for option1, option2, option3 fields
              if (variant.option1) {
                if (!optionsMap.has('option1')) {
                  optionsMap.set('option1', new Set())
                }
                optionsMap.get('option1')?.add(variant.option1)
              }
              if (variant.option2) {
                if (!optionsMap.has('option2')) {
                  optionsMap.set('option2', new Set())
                }
                optionsMap.get('option2')?.add(variant.option2)
              }
              if (variant.option3) {
                if (!optionsMap.has('option3')) {
                  optionsMap.set('option3', new Set())
                }
                optionsMap.get('option3')?.add(variant.option3)
              }
            })
            
            console.log('Extracted options map:', Array.from(optionsMap.entries()))
            
            // Set variation options
            const options = Array.from(optionsMap.entries()).map(([name, values]) => ({
              name: name === 'option1' ? 'Size' : name === 'option2' ? 'Color' : name === 'option3' ? 'Material' : name,
              values: Array.from(values)
            }))
            
            if (options.length > 0) {
              console.log('Setting variation options:', options)
              setVariationOptions(options)
              setValueInputs(options.map(opt => opt.values.join(', ')))
            }
            
            // Set variations
            const formattedVariations = variants.map((variant: any, index: number) => {
              const formatted = {
                id: variant.id || `var-${Date.now()}-${index}`,
                title: variant.title || '',
                attributes: [
                  ...(variant.option1 ? [{ name: 'Size', value: variant.option1 }] : []),
                  ...(variant.option2 ? [{ name: 'Color', value: variant.option2 }] : []),
                  ...(variant.option3 ? [{ name: 'Material', value: variant.option3 }] : [])
                ],
                sku: variant.sku || '',
                price: variant.price?.toString() || '',
                compare_price: variant.compare_price?.toString() || '',
                cost_price: variant.cost_price?.toString() || '',
                stock_quantity: variant.inventory_quantity?.toString() || '0',
                weight: variant.weight?.toString() || '',
                is_active: variant.is_active !== false,
              }
              console.log(`Formatted variation ${index}:`, formatted)
              return formatted
            })
            
            console.log('Setting formatted variations:', formattedVariations)
            setVariations(formattedVariations)
          } else {
            console.log('No variations to process or variants is not an array')
          }
        }
        
        // Initialize form data
        setFormData({
          name: productData.name,
          slug: productData.slug,
          description: productData.description || '',
          short_description: productData.short_description || '',
          product_type: productData.product_type || 'single',
          sku: productData.sku || '',
          price: productData.price.toString(),
          compare_price: productData.compare_price?.toString() || '',
          cost_price: productData.cost_price?.toString() || '',
          track_inventory: productData.track_inventory,
          inventory_quantity: productData.inventory_quantity.toString(),
          allow_backorder: productData.allow_backorder,
          weight: productData.weight?.toString() || '',
          category_id: productData.category_id || 'none',
          brand_id: productData.brand_id || 'none',
          is_active: productData.is_active,
          is_featured: productData.is_featured,
          seo_title: productData.seo_title || '',
          seo_description: productData.seo_description || '',
        })

        // Mark slug as manually edited if product has existing slug
        setSlugManuallyEdited(!!productData.slug)

        // Load categories and brands
        const { data: categoriesData } = await tenantDb.getCategories({ is_active: true })
        setCategories(categoriesData || [])

        const { data: brandsData } = await tenantDb.getBrands({ is_active: true })
        setBrands(brandsData || [])

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

    // Auto-generate slug when name changes (only if slug hasn't been manually edited)
    if (field === 'name' && !slugManuallyEdited) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }

    // Mark slug as manually edited when user changes it
    if (field === 'slug') {
      setSlugManuallyEdited(true)
      // Validate slug uniqueness
      if (value.trim()) {
        validateSlugUniqueness(value.trim())
      }
    }
    
    // Clear variations when switching away from variable product type
    if (field === 'product_type' && value !== 'variable') {
      setVariations([])
      setVariationOptions([{ name: '', values: [] }])
      setValueInputs([''])
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
        const { data: existingProducts } = await supabase
          .from('products')
          .select('id, slug')
          .eq('tenant_id', tenant.id)
          .eq('slug', slug)
        
        // Check if slug exists and it's not the current product being edited
        const isDuplicate = existingProducts && existingProducts.length > 0 && 
          (!product || existingProducts[0].id !== product.id)
        
        setSlugError(isDuplicate ? 'This slug is already in use by another product' : '')
      } catch (error) {
        console.error('Error validating slug:', error)
      } finally {
        setSlugValidating(false)
      }
    }, 500) // 500ms debounce

    setSlugValidationTimeout(timeout)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Variation management functions
  const addVariationOption = () => {
    setVariationOptions([...variationOptions, { name: '', values: [] }])
    setValueInputs([...valueInputs, ''])
  }

  const removeVariationOption = (index: number) => {
    if (variationOptions.length > 1) {
      const newOptions = variationOptions.filter((_, i) => i !== index)
      const newInputs = valueInputs.filter((_, i) => i !== index)
      setVariationOptions(newOptions)
      setValueInputs(newInputs)
      // Clear variations when options change
      setVariations([])
    }
  }

  const updateVariationOption = (index: number, field: 'name' | 'values', value: string | string[]) => {
    const newOptions = [...variationOptions]
    if (field === 'name' && typeof value === 'string') {
      newOptions[index].name = value
      setVariationOptions(newOptions)
    } else if (field === 'values' && Array.isArray(value)) {
      newOptions[index].values = value
      setVariationOptions(newOptions)
    }
    // Clear variations when options change
    setVariations([])
  }

  const updateValueInput = (index: number, value: string) => {
    const newInputs = [...valueInputs]
    newInputs[index] = value
    setValueInputs(newInputs)
  }

  const processValueInput = (index: number) => {
    const input = valueInputs[index]
    const values = input.split(',').map(v => v.trim()).filter(Boolean)
    updateVariationOption(index, 'values', values)
  }

  const getVariationCombinations = () => {
    const validOptions = variationOptions.filter(opt => opt.name && opt.values.length > 0)
    if (validOptions.length === 0) return []

    const combinations: Array<Array<{ name: string; value: string }>> = []
    
    const generateCombinations = (index: number, current: Array<{ name: string; value: string }>) => {
      if (index === validOptions.length) {
        combinations.push([...current])
        return
      }

      const option = validOptions[index]
      for (const value of option.values) {
        current.push({ name: option.name, value })
        generateCombinations(index + 1, current)
        current.pop()
      }
    }

    generateCombinations(0, [])
    return combinations
  }

  const generateVariations = () => {
    const combinations = getVariationCombinations()
    const newVariations = combinations.map((combo, index) => ({
      id: `var-${Date.now()}-${index}`,
      title: combo.map(attr => attr.value).join(' / '),
      attributes: combo,
      sku: '',
      price: formData.price || '',
      compare_price: '',
      cost_price: '',
      stock_quantity: '0',
      weight: '',
      is_active: true,
    }))
    setVariations(newVariations)
  }

  const updateVariation = (id: string, field: string, value: any) => {
    setVariations(prev => 
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    )
  }

  const deleteVariation = (id: string) => {
    setVariations(prev => prev.filter(v => v.id !== id))
  }

  const applyBulkPrice = () => {
    const price = prompt('Enter price for all variations:')
    if (price && !isNaN(parseFloat(price))) {
      setVariations(prev => prev.map(v => ({ ...v, price })))
    }
  }

  const applyBulkSKU = () => {
    const prefix = prompt('Enter SKU prefix (will add -1, -2, etc.):')
    if (prefix) {
      setVariations(prev => prev.map((v, i) => ({ ...v, sku: `${prefix}-${i + 1}` })))
    }
  }

  const applyBulkStock = () => {
    const stock = prompt('Enter stock quantity for all variations:')
    if (stock && !isNaN(parseInt(stock))) {
      setVariations(prev => prev.map(v => ({ ...v, stock_quantity: stock })))
    }
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
      
      // For single and digital products, price is required
      if (formData.product_type !== 'variable' && (!formData.price || parseFloat(formData.price) <= 0)) {
        setError('Valid price is required')
        return
      }
      
      // For variable products, validate variations
      if (formData.product_type === 'variable') {
        if (variations.length === 0) {
          setError('Variable products must have at least one variation')
          return
        }
        
        const activeVariations = variations.filter(v => v.is_active)
        if (activeVariations.length === 0) {
          setError('At least one variation must be active')
          return
        }
        
        const missingPrices = activeVariations.filter(v => !v.price || parseFloat(v.price) <= 0)
        if (missingPrices.length > 0) {
          setError(`${missingPrices.length} active variation(s) missing valid prices`)
          return
        }
      }

      const tenantDb = new TenantDatabase(tenant.id)
      
      const updateData = {
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
        category_id: formData.category_id === 'none' ? null : formData.category_id,
        brand_id: formData.brand_id === 'none' ? null : formData.brand_id,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        images: prepareImagesForStorage(productImages),
      }

      console.log('Saving product with images:', productImages)
      console.log('Prepared images for storage:', prepareImagesForStorage(productImages))

      // Use the new API endpoint for updates
      const transformedVariants = formData.product_type === 'variable' 
        ? variations.filter(v => v.is_active).map(v => ({
            title: v.title,
            option1: v.attributes.find(attr => attr.name === 'Size')?.value || null,
            option2: v.attributes.find(attr => attr.name === 'Color')?.value || null,
            option3: v.attributes.find(attr => attr.name === 'Material')?.value || null,
            sku: v.sku,
            price: parseFloat(v.price) || 0,
            compare_price: v.compare_price ? parseFloat(v.compare_price) : null,
            cost_price: v.cost_price ? parseFloat(v.cost_price) : null,
            inventory_quantity: parseInt(v.stock_quantity) || 0,
            weight: v.weight ? parseFloat(v.weight) : null,
            is_active: v.is_active
          }))
        : []

      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenant.id,
          product_id: product.id,
          variants: transformedVariants,
          ...updateData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(`Failed to update product: ${result.error || 'Unknown error'}`)
        return
      }

      setSuccess(true)
      
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

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!tenant?.id || !product) return

    try {
      setSaving(true)
      const tenantDb = new TenantDatabase(tenant.id)
      
      const { error: deleteError } = await tenantDb.deleteProduct(product.id)
      
      if (deleteError) {
        setError(`Failed to delete product: ${deleteError.message}`)
        setShowDeleteModal(false)
        return
      }

      // Redirect to products list
      router.push('/admin/products')

    } catch (err) {
      console.error('Error deleting product:', err)
      setError('Failed to delete product')
    } finally {
      setSaving(false)
      setShowDeleteModal(false)
    }
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
                {t('backToProducts')}
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
              {t('backToProducts')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-muted-foreground">
              Edit product details
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
          <Button 
            variant="outline"
            onClick={handleDeleteClick}
            disabled={saving}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
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
              <div>
                <Label htmlFor="product_type">Product Type *</Label>
                <DetailedSelect
                  id="product_type"
                  value={formData.product_type}
                  onValueChange={(value) => handleInputChange('product_type', value as 'single' | 'variable' | 'digital')}
                  placeholder="Select product type"
                  options={[
                    {
                      value: 'single',
                      label: 'Single Product',
                      description: 'Standard product with one variant'
                    },
                    {
                      value: 'variable',
                      label: 'Variable Product',
                      description: 'Product with multiple variants (size, color, etc.)'
                    },
                    {
                      value: 'digital',
                      label: 'Digital Product',
                      description: 'Downloadable product (software, ebooks, etc.)'
                    }
                  ]}
                />
              </div>              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                    />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="product-url-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                    rows={4}
                  />
              </div>

              <div>
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  value={formData.short_description}
                  onChange={(e) => handleInputChange('short_description', e.target.value)}
                  placeholder="Brief product summary"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          {formData.product_type !== 'variable' && (
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
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="compare_price">Compare Price</Label>
                  <Input
                    id="compare_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compare_price}
                    onChange={(e) => handleInputChange('compare_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="cost_price">Cost per Item</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cost_price}
                    onChange={(e) => handleInputChange('cost_price', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Variations Display (for variable products in view mode) */}
          {formData.product_type === 'variable' && false && variations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Variations</CardTitle>
                <CardDescription>
                  {variations.length} variation(s) configured
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {variations.map((variation) => (
                    <div key={variation.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-sm">{variation.title}</h4>
                          <p className="text-xs text-gray-500">
                            {variation.attributes.map(attr => `${attr.name}: ${attr.value}`).join(' • ')}
                          </p>
                        </div>
                        <Badge variant={variation.is_active ? "default" : "secondary"}>
                          {variation.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="font-medium">{formatPrice(parseFloat(variation.price || '0'), tenant)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <p className="font-medium">{variation.sku || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <p className="font-medium">{variation.stock_quantity || '0'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Weight:</span>
                          <p className="font-medium">{variation.weight || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Variations (for variable products) */}
          {formData.product_type === 'variable' && true && (
            <Card>
              <CardHeader>
                <CardTitle>Product Variations</CardTitle>
                <CardDescription>
                  Define product options (like Size, Color) and generate all possible combinations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Define Options */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">1</div>
                    <h3 className="font-medium">Define Product Options</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-medium">Product Options</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addVariationOption}
                        disabled={variationOptions.length >= 3}
                      >
                        + Add Option
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {variationOptions.map((option, index) => (
                        <div key={index} className="bg-white border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded bg-blue-500 text-white text-xs flex items-center justify-center font-medium">
                                {String.fromCharCode(65 + index)}
                              </div>
                              <Label className="text-sm font-medium">Option {index + 1}</Label>
                            </div>
                            {variationOptions.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVariationOption(index)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`option-name-${index}`} className="text-sm">Option Name</Label>
                              <Select 
                                value={option.name} 
                                onValueChange={(value) => updateVariationOption(index, 'name', value)}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Choose option type..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Size">Size</SelectItem>
                                  <SelectItem value="Color">Color</SelectItem>
                                  <SelectItem value="Material">Material</SelectItem>
                                  <SelectItem value="Style">Style</SelectItem>
                                  <SelectItem value="Pattern">Pattern</SelectItem>
                                  <SelectItem value="Finish">Finish</SelectItem>
                                  <SelectItem value="custom">Custom...</SelectItem>
                                </SelectContent>
                              </Select>
                              {option.name === 'custom' && (
                                <Input
                                  className="mt-2"
                                  placeholder="Enter custom option name"
                                  onChange={(e) => updateVariationOption(index, 'name', e.target.value)}
                                />
                              )}
                            </div>
                            
                            <div>
                              <Label htmlFor={`option-values-${index}`} className="text-sm">Values</Label>
                              <div className="mt-1 space-y-2">
                                <Input
                                  id={`option-values-${index}`}
                                  value={valueInputs[index]}
                                  onChange={(e) => updateValueInput(index, e.target.value)}
                                  onBlur={() => processValueInput(index)}
                                  placeholder="Enter values separated by commas (e.g., Small, Medium, Large)"
                                  className="w-full"
                                />
                                <p className="text-xs text-gray-500">
                                  Type values and separate with commas. Press Tab or click outside to apply.
                                </p>
                              </div>
                              {option.values.length > 0 && (
                                <div className="mt-2">
                                  <Label className="text-xs text-gray-600">Preview ({option.values.length} values):</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {option.values.map((value, vIndex) => (
                                      <Badge key={vIndex} variant="secondary" className="text-xs">
                                        {value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 text-sm text-gray-600">
                      💡 <strong>Tip:</strong> Options are like "Size" or "Color". Values are like "Small, Medium, Large" or "Red, Blue, Green".
                    </div>
                  </div>
                </div>

                {/* Step 2: Generate Combinations */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">2</div>
                    <h3 className="font-medium">Generate Variations</h3>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          {getVariationCombinations().length} possible combination(s)
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Click the button to create variations for all combinations
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={generateVariations}
                        disabled={getVariationCombinations().length === 0}
                        size="sm"
                      >
                        Generate Variations
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Step 3: Configure Variations */}
                {variations.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">3</div>
                      <h3 className="font-medium">Configure Variations ({variations.length})</h3>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
                        <Label className="text-sm font-medium">Bulk Actions</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={applyBulkPrice}>
                            Set All Prices
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={applyBulkSKU}>
                            Generate SKUs
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={applyBulkStock}>
                            Set All Stock
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {variations.map((variation, index) => (
                          <div key={variation.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Switch
                                  checked={variation.is_active}
                                  onCheckedChange={(checked) => updateVariation(variation.id, 'is_active', checked)}
                                />
                                <div>
                                  <h4 className="font-medium text-sm">{variation.title}</h4>
                                  <p className="text-xs text-gray-500">
                                    {variation.attributes.map(attr => `${attr.name}: ${attr.value}`).join(' • ')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteVariation(variation.id)}
                                className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div>
                                <Label htmlFor={`var-price-${index}`} className="text-xs">Price *</Label>
                                <Input
                                  id={`var-price-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variation.price}
                                  onChange={(e) => updateVariation(variation.id, 'price', e.target.value)}
                                  placeholder="0.00"
                                  className="mt-1"
                                  disabled={!variation.is_active}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`var-sku-${index}`} className="text-xs">SKU</Label>
                                <Input
                                  id={`var-sku-${index}`}
                                  value={variation.sku}
                                  onChange={(e) => updateVariation(variation.id, 'sku', e.target.value)}
                                  placeholder="SKU"
                                  className="mt-1"
                                  disabled={!variation.is_active}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`var-stock-${index}`} className="text-xs">Stock</Label>
                                <Input
                                  id={`var-stock-${index}`}
                                  type="number"
                                  min="0"
                                  value={variation.stock_quantity}
                                  onChange={(e) => updateVariation(variation.id, 'stock_quantity', e.target.value)}
                                  placeholder="0"
                                  className="mt-1"
                                  disabled={!variation.is_active}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`var-weight-${index}`} className="text-xs">Weight</Label>
                                <Input
                                  id={`var-weight-${index}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={variation.weight}
                                  onChange={(e) => updateVariation(variation.id, 'weight', e.target.value)}
                                  placeholder="0.00"
                                  className="mt-1"
                                  disabled={!variation.is_active}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Inventory - Only show for single and digital products */}
          {formData.product_type !== 'variable' && (
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Track and manage product inventory
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>
          )}

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
              <CardDescription>
                Upload and manage product images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center transition-colors"
                  onDrop={(e) => {
                    e.preventDefault()
                    const files = e.dataTransfer.files
                    if (files && files.length > 0) {
                      const fileInput = document.createElement('input')
                      fileInput.type = 'file'
                      fileInput.multiple = true
                      fileInput.accept = 'image/*'
                      fileInput.files = files
                      fileInput.dispatchEvent(new Event('change'))
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">Drop images here</p>
                  <p className="text-sm text-gray-500 mb-4">or click to browse files</p>
                  <Button 
                    type="button" 
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.multiple = true
                      input.accept = 'image/*'
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement
                        if (target.files) {
                          // Process files similar to ImageUpload component
                          Array.from(target.files).forEach(async (file) => {
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              if (e.target?.result) {
                                setProductImages(prev => [...prev, e.target!.result as string])
                              }
                            }
                            reader.readAsDataURL(file)
                          })
                        }
                      }
                        input.click()
                      }}
                    >
                      Choose Files
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      JPEG, PNG, WebP • Max {10 - productImages.length} more images
                    </p>
                  </div>

                  {/* Image Grid */}
                  {productImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Uploaded Images ({productImages.length})</h4>
                        <p className="text-xs text-gray-500">Drag to reorder</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {productImages.map((imageUrl, index) => (
                          <div key={imageUrl || index} className="group relative">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={`Image ${index + 1}`}
                                  fill
                                  className="object-cover"
                                  unoptimized={isSupabaseStorageUrl(imageUrl)}
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement
                                    target.src = createImagePlaceholder(`${index + 1}`)
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                              {index === 0 && (
                                <Badge className="absolute top-2 left-2 text-xs">
                                  Main
                                </Badge>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              onClick={() => {
                                setProductImages(prev => prev.filter((_, i) => i !== index))
                              }}
                              disabled={saving}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              {index + 1}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="text-sm text-gray-500 text-center">
                    {productImages.length} of 10 images uploaded
                  </div>
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
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div>
                <Label className="text-sm font-medium">Brand</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => handleInputChange('brand_id', value)}
                >
                  <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No brand</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
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

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>
                Search engine optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title" className="text-sm">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  placeholder="SEO optimized title"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="seo_description" className="text-sm">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  placeholder="SEO meta description"
                  rows={3}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product?.name}"? This action cannot be undone and will permanently remove this product from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
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
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { prepareImagesForStorage } from '@/lib/utils/image-utils'

interface Category {
  id: string
  name: string
  slug: string
}

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form state
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
    category_id: '',
    is_active: true,
    is_featured: false,
    seo_title: '',
    seo_description: '',
  })
  
  const [productImages, setProductImages] = useState<string[]>([])
  
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
  
  // Digital product state
  const [digitalFiles, setDigitalFiles] = useState<string[]>([])

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
      price: formData.price,
      compare_price: formData.compare_price,
      cost_price: formData.cost_price,
      stock_quantity: '0',
      weight: '',
      is_active: true
    }))
    setVariations(newVariations)
  }

  const updateVariation = (index: number, field: string, value: string | boolean) => {
    const newVariations = [...variations]
    if (field in newVariations[index]) {
      (newVariations[index] as any)[field] = value
      setVariations(newVariations)
    }
  }

  const removeVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index)
    setVariations(newVariations)
  }

  // Helper functions for better UX
  const getPlaceholderForOption = (optionName: string) => {
    switch (optionName?.toLowerCase()) {
      case 'size': return 'XS, S, M, L, XL, XXL'
      case 'color': return 'Red, Blue, Green, Black, White'
      case 'material': return 'Cotton, Polyester, Silk, Wool'
      case 'style': return 'Classic, Modern, Vintage, Casual'
      case 'pattern': return 'Solid, Striped, Floral, Geometric'
      case 'finish': return 'Matte, Glossy, Satin, Textured'
      default: return 'Value 1, Value 2, Value 3'
    }
  }

  const getExampleForOption = (optionName: string) => {
    switch (optionName?.toLowerCase()) {
      case 'size': return 'S, M, L'
      case 'color': return 'Red, Blue, Green'
      case 'material': return 'Cotton, Silk'
      case 'style': return 'Classic, Modern'
      case 'pattern': return 'Solid, Striped'
      case 'finish': return 'Matte, Glossy'
      default: return 'Option1, Option2'
    }
  }

  const applyPriceToAll = () => {
    const price = window.prompt('Enter price to apply to all variations:', formData.price || '0')
    if (price && !isNaN(parseFloat(price))) {
      const newVariations = variations.map(v => ({ ...v, price }))
      setVariations(newVariations)
    }
  }

  const generateAllSKUs = () => {
    const baseSKU = formData.sku || formData.slug || 'PROD'
    const newVariations = variations.map((variation, index) => ({
      ...variation,
      sku: variation.sku || `${baseSKU}-${String(index + 1).padStart(3, '0')}`
    }))
    setVariations(newVariations)
  }

  const router = useRouter()
  const { tenant } = useTenant()

  // Sync valueInputs with variationOptions
  useEffect(() => {
    setValueInputs(variationOptions.map(option => option.values.join(', ')))
  }, [variationOptions.length])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      console.log('Loading categories, tenant ID:', tenant?.id)
      if (!tenant?.id) {
        console.log('No tenant ID available for loading categories')
        return
      }

      try {
        const tenantDb = new TenantDatabase(tenant.id)
        const result = await tenantDb.getCategories({ is_active: true })

        if (result.error) {
          console.error('Error loading categories:', result.error)
        } else {
          console.log('Categories loaded:', result.data)
          setCategories(result.data || [])
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    loadCategories()
  }, [tenant?.id])

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleInputChange = (field: string, value: any) => {
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

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Product name is required')
      return false
    }
    if (!formData.slug.trim()) {
      setError('Product slug is required')
      return false
    }
    
    // For single and digital products, price is required
    if (formData.product_type !== 'variable' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError('Valid price is required')
      return false
    }
    
    // For variable products, check variations
    if (formData.product_type === 'variable') {
      const validOptions = variationOptions.filter(opt => opt.name && opt.values.length > 0)
      if (validOptions.length === 0) {
        setError('Variable products must have at least one option with values')
        return false
      }
      
      if (variations.length === 0) {
        setError('Please generate variations from your options')
        return false
      }
      
      const activeVariations = variations.filter(v => v.is_active)
      if (activeVariations.length === 0) {
        setError('At least one variation must be active')
        return false
      }
      
      // Check if all active variations have valid prices
      const missingPrices = activeVariations.filter(v => !v.price || parseFloat(v.price) <= 0)
      if (missingPrices.length > 0) {
        setError(`${missingPrices.length} active variation(s) missing valid prices`)
        return false
      }
    }
    
    // Only check inventory for non-digital products
    if (formData.product_type !== 'digital' && formData.product_type !== 'variable' && formData.track_inventory && (!formData.inventory_quantity || parseInt(formData.inventory_quantity) < 0)) {
      setError('Valid inventory quantity is required when tracking inventory')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log('Tenant object:', tenant)
      console.log('Tenant ID:', tenant?.id)
      
      if (!tenant?.id) {
        setError('No tenant found. Please ensure you are properly authenticated and have access to a store.')
        return
      }

      // Prepare product data
      const productData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        short_description: formData.short_description.trim() || null,
        sku: formData.sku.trim() || null,
        product_type: formData.product_type,
        price: formData.product_type === 'variable' ? 0 : parseFloat(formData.price),
        compare_price: formData.product_type === 'variable' ? null : (formData.compare_price ? parseFloat(formData.compare_price) : null),
        cost_price: formData.product_type === 'variable' ? null : (formData.cost_price ? parseFloat(formData.cost_price) : null),
        track_inventory: formData.product_type === 'digital' ? false : formData.track_inventory,
        inventory_quantity: formData.product_type === 'digital' || formData.product_type === 'variable' ? 0 : (formData.track_inventory ? parseInt(formData.inventory_quantity) : 0),
        allow_backorder: formData.product_type === 'digital' ? false : formData.allow_backorder,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title.trim() || null,
        seo_description: formData.seo_description.trim() || null,
        images: prepareImagesForStorage(productImages),
        variants: formData.product_type === 'variable' ? variations.filter(v => v.is_active) : {},
        digital_files: formData.product_type === 'digital' ? digitalFiles : [],
      }

      console.log('Creating product with data:', productData)

      const tenantDb = new TenantDatabase(tenant.id)
      const { data, error } = await tenantDb.createProduct(productData)

      if (error) {
        console.error('Error creating product:', error)
        setError(`Failed to create product: ${error.message}`)
      } else {
        console.log('Product created successfully:', data)
        setSuccess(true)
        
        // Redirect to products list after a short delay
        setTimeout(() => {
          router.push('/admin/products')
        }, 2000)
      }
    } catch (error) {
      console.error('Error creating product:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Product Created Successfully!</CardTitle>
            <CardDescription>
              Your new product has been added to your store.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Redirecting to products...</span>
            </div>
            <Button asChild variant="outline">
              <Link href="/admin/products">
                View All Products
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground">
            Create a new product for your store
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                {/* Product Type Selection */}
                <div>
                  <Label htmlFor="product_type">Product Type *</Label>
                  <Select 
                    value={formData.product_type} 
                    onValueChange={(value: 'single' | 'variable' | 'digital') => handleInputChange('product_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">
                        <div className="flex items-center gap-2">
                          <span>📦</span>
                          <div>
                            <div className="font-medium">Single Product</div>
                            <div className="text-xs text-gray-500">Simple product with one variant</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="variable">
                        <div className="flex items-center gap-2">
                          <span>🔧</span>
                          <div>
                            <div className="font-medium">Variable Product</div>
                            <div className="text-xs text-gray-500">Product with multiple variants (size, color, etc.)</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="digital">
                        <div className="flex items-center gap-2">
                          <span>💾</span>
                          <div>
                            <div className="font-medium">Digital Product</div>
                            <div className="text-xs text-gray-500">Downloadable digital content</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="product-url-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief product description"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e: any) => handleInputChange('description', e.target.value)}
                    placeholder="Detailed product description"
                    rows={4}
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
                    Product pricing and cost information
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
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="compare_price">Compare at Price</Label>
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

            {/* Variations (for variable products) */}
            {formData.product_type === 'variable' && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Variations</CardTitle>
                  <CardDescription>
                    Define product options (like Size, Color) and we'll generate all possible combinations
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
                                    value={valueInputs[index] || option.values.join(', ')}
                                    onChange={(e) => updateValueInput(index, e.target.value)}
                                    onBlur={() => processValueInput(index)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        processValueInput(index)
                                      }
                                    }}
                                    placeholder={getPlaceholderForOption(option.name)}
                                  />
                                  <div className="text-xs text-gray-500">
                                    Separate values with commas. Press Enter or click away to apply. Example: {getExampleForOption(option.name)}
                                  </div>
                                </div>
                              </div>
                              
                              {option.values.length > 0 && (
                                <div>
                                  <Label className="text-xs text-gray-600">Preview ({option.values.length} values):</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {option.values.slice(0, 6).map((value, valueIndex) => (
                                      <Badge key={valueIndex} variant="secondary" className="text-xs">
                                        {value}
                                      </Badge>
                                    ))}
                                    {option.values.length > 6 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{option.values.length - 6} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {variationOptions.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <div className="text-sm">No options defined yet</div>
                            <div className="text-xs mt-1">Add an option to get started</div>
                          </div>
                        )}
                        
                        {variationOptions.length >= 3 && (
                          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
                            Maximum of 3 options allowed to keep variations manageable
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Generate Variations */}
                  {variationOptions.some(option => option.name && option.values.length > 0) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">2</div>
                        <h3 className="font-medium">Generate Variations</h3>
                      </div>
                      
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium text-blue-900">Ready to Generate</h4>
                            <p className="text-sm text-blue-700">
                              {getVariationCombinations().length} variations will be created from your {variationOptions.filter(opt => opt.name && opt.values.length > 0).length} options
                            </p>
                            <div className="text-xs text-blue-600">
                              {variationOptions.filter(opt => opt.name && opt.values.length > 0).map(opt => 
                                `${opt.name} (${opt.values.length})`
                              ).join(' × ')} = {getVariationCombinations().length} combinations
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {variations.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setVariations([])}
                                className="text-red-600 hover:text-red-700"
                              >
                                Clear All
                              </Button>
                            )}
                            <Button
                              type="button"
                              onClick={generateVariations}
                              size="sm"
                              disabled={getVariationCombinations().length > 50}
                            >
                              {variations.length > 0 ? 'Regenerate' : 'Generate'} Variations
                            </Button>
                          </div>
                        </div>
                        
                        {getVariationCombinations().length > 50 && (
                          <div className="mt-3 text-xs text-amber-700 bg-amber-100 border border-amber-300 rounded p-2">
                            ⚠️ Too many combinations ({getVariationCombinations().length}). Consider reducing option values to keep under 50 variations.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Configure Variations */}
                  {variations.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-medium flex items-center justify-center">3</div>
                        <h3 className="font-medium">Configure Variations</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {variations.length} variations
                        </Badge>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-sm font-medium">Bulk Actions</Label>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={applyPriceToAll}
                            >
                              Set All Prices
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={generateAllSKUs}
                            >
                              Generate SKUs
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {variations.map((variation, index) => (
                            <div key={variation.id} className="bg-white border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm font-medium">#{index + 1}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {variation.attributes.map((attr, attrIndex) => (
                                      <Badge key={attrIndex} variant="outline" className="text-xs">
                                        {attr.name}: {attr.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={variation.is_active}
                                    onCheckedChange={(checked) => updateVariation(index, 'is_active', checked)}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeVariation(index)}
                                    className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid gap-3 sm:grid-cols-4">
                                <div>
                                  <Label htmlFor={`var-price-${index}`} className="text-xs">Price *</Label>
                                  <Input
                                    id={`var-price-${index}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variation.price}
                                    onChange={(e) => updateVariation(index, 'price', e.target.value)}
                                    placeholder="0.00"
                                    className="h-8 text-sm"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`var-compare-${index}`} className="text-xs">Compare Price</Label>
                                  <Input
                                    id={`var-compare-${index}`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variation.compare_price}
                                    onChange={(e) => updateVariation(index, 'compare_price', e.target.value)}
                                    placeholder="0.00"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`var-sku-${index}`} className="text-xs">SKU</Label>
                                  <Input
                                    id={`var-sku-${index}`}
                                    value={variation.sku}
                                    onChange={(e) => updateVariation(index, 'sku', e.target.value)}
                                    placeholder="AUTO"
                                    className="h-8 text-sm"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`var-stock-${index}`} className="text-xs">Stock</Label>
                                  <Input
                                    id={`var-stock-${index}`}
                                    type="number"
                                    min="0"
                                    value={variation.stock_quantity}
                                    onChange={(e) => updateVariation(index, 'stock_quantity', e.target.value)}
                                    placeholder="0"
                                    className="h-8 text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                          <div>
                            Active variations: {variations.filter(v => v.is_active).length} / {variations.length}
                          </div>
                          <div>
                            Missing prices: {variations.filter(v => !v.price || parseFloat(v.price) <= 0).length}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Digital Files (for digital products) */}
            {formData.product_type === 'digital' && (
              <Card>
                <CardHeader>
                  <CardTitle>Digital Files</CardTitle>
                  <CardDescription>
                    Uploadable files that customers will receive after purchase
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="space-y-2">
                      <div className="mx-auto h-12 w-12 text-gray-400">
                        📄
                      </div>
                      <div>
                        <h4 className="font-medium">Upload Digital Files</h4>
                        <p className="text-sm text-gray-500">
                          PDF, ZIP, images, videos, or any other files customers will download
                        </p>
                      </div>
                      <Button type="button" variant="outline">
                        Choose Files
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Supported formats: PDF, ZIP, JPG, PNG, MP4, MP3, DOC, etc.</p>
                    <p>Maximum file size: 100MB per file</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Inventory */}
            {formData.product_type !== 'digital' && formData.product_type !== 'variable' && (
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

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Upload images for your product. The first image will be the main product image.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tenant?.id && (
                  <ImageUpload
                    tenantId={tenant.id}
                    productId={formData.slug || 'new-product'}
                    initialImages={productImages}
                    maxImages={10}
                    onImagesChange={setProductImages}
                    disabled={loading}
                  />
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
                  <Input
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div>
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description}
                    onChange={(e: any) => handleInputChange('seo_description', e.target.value)}
                    placeholder="SEO meta description"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Product Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
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

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Product Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="category_id">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value: any) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mb-4">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Product
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/admin/products">
                      Cancel
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
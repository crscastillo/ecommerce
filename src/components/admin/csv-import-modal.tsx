'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Download
} from 'lucide-react'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { useTenant } from '@/lib/contexts/tenant-context'
import { productImageStorage } from '@/lib/storage/product-images'

interface CSVImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete: () => void
}

interface CSVRow {
  [key: string]: string
}

interface ColumnMapping {
  csvColumn: string
  productProperty: string
  required: boolean
}

interface ValidationError {
  row: number
  column: string
  message: string
  value: string
}

const PRODUCT_PROPERTIES = [
  { value: 'name', label: 'Product Name', required: true, type: 'text' },
  { value: 'slug', label: 'URL Slug', required: false, type: 'text' },
  { value: 'description', label: 'Description', required: false, type: 'text' },
  { value: 'short_description', label: 'Short Description', required: false, type: 'text' },
  { value: 'price', label: 'Price', required: true, type: 'number' },
  { value: 'compare_price', label: 'Compare Price', required: false, type: 'number' },
  { value: 'cost_price', label: 'Cost Price', required: false, type: 'number' },
  { value: 'sku', label: 'SKU', required: false, type: 'text' },
  { value: 'inventory_quantity', label: 'Inventory Quantity', required: false, type: 'number' },
  { value: 'weight', label: 'Weight', required: false, type: 'number' },
  { value: 'tags', label: 'Tags (comma-separated)', required: false, type: 'text' },
  { value: 'is_active', label: 'Active Status', required: false, type: 'boolean' },
  { value: 'is_featured', label: 'Featured Status', required: false, type: 'boolean' },
  { value: 'category_slug', label: 'Category Slug', required: false, type: 'text' },
  { value: 'image_url', label: 'Image URL', required: false, type: 'url' },
]

export function CSVImportModal({ open, onOpenChange, onImportComplete }: CSVImportModalProps) {
  const { tenant } = useTenant()
  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'importing'>('upload')
  const [csvData, setCsvData] = useState<CSVRow[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })
  const [categories, setCategories] = useState<Array<{ id: string, slug: string, name: string }>>([])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please select a valid CSV file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          alert('CSV file must have at least a header row and one data row')
          return
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          const row: CSVRow = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })

        setCsvHeaders(headers)
        setCsvData(data)
        
        // Initialize column mappings
        const mappings: ColumnMapping[] = headers.map(header => ({
          csvColumn: header,
          productProperty: 'skip',
          required: false
        }))
        setColumnMappings(mappings)
        
        setStep('mapping')
      } catch (error) {
        console.error('Error parsing CSV:', error)
        alert('Error parsing CSV file. Please check the format and try again.')
      }
    }
    reader.readAsText(file)
  }, [])

  const updateColumnMapping = (csvColumn: string, productProperty: string) => {
    setColumnMappings(prev => 
      prev.map(mapping => 
        mapping.csvColumn === csvColumn 
          ? { ...mapping, productProperty }
          : mapping
      )
    )
  }

  const validateData = async () => {
    if (!tenant?.id) return

    const errors: ValidationError[] = []
    const tenantDb = new TenantDatabase(tenant.id)

    // Load categories for validation
    const categoriesResult = await tenantDb.getCategories()
    if (categoriesResult.data) {
      setCategories(categoriesResult.data)
    }

    // Check required mappings
    const requiredProps = PRODUCT_PROPERTIES.filter(prop => prop.required)
    for (const requiredProp of requiredProps) {
      const mapping = columnMappings.find(m => m.productProperty === requiredProp.value)
      if (!mapping || !mapping.csvColumn || mapping.productProperty === 'skip') {
        errors.push({
          row: 0,
          column: requiredProp.value,
          message: `Required field '${requiredProp.label}' is not mapped`,
          value: ''
        })
      }
    }

    // Validate data rows
    csvData.forEach((row, index) => {
      columnMappings.forEach(mapping => {
        if (!mapping.productProperty || mapping.productProperty === 'skip') return

        const value = row[mapping.csvColumn]
        const property = PRODUCT_PROPERTIES.find(p => p.value === mapping.productProperty)
        if (!property) return

        // Check required fields
        if (property.required && (!value || value.trim() === '')) {
          errors.push({
            row: index + 1,
            column: mapping.csvColumn,
            message: `${property.label} is required`,
            value: value || ''
          })
        }

        // Validate data types
        if (value && value.trim()) {
          switch (property.type) {
            case 'number':
              if (isNaN(Number(value))) {
                errors.push({
                  row: index + 1,
                  column: mapping.csvColumn,
                  message: `${property.label} must be a valid number`,
                  value
                })
              }
              break
            case 'boolean':
              const lowerValue = value.toLowerCase()
              if (!['true', 'false', '1', '0', 'yes', 'no', 'active', 'inactive'].includes(lowerValue)) {
                errors.push({
                  row: index + 1,
                  column: mapping.csvColumn,
                  message: `${property.label} must be true/false, 1/0, yes/no, or active/inactive`,
                  value
                })
              }
              break
            case 'url':
              try {
                new URL(value.trim())
              } catch {
                errors.push({
                  row: index + 1,
                  column: mapping.csvColumn,
                  message: `${property.label} must be a valid URL`,
                  value
                })
              }
              break
          }
        }
      })

      // Validate category slug if provided
      const categoryMapping = columnMappings.find(m => m.productProperty === 'category_slug')
      if (categoryMapping && categoryMapping.productProperty !== 'skip' && row[categoryMapping.csvColumn]) {
        const categorySlug = row[categoryMapping.csvColumn].trim()
        if (categorySlug && !categories.find(c => c.slug === categorySlug)) {
          errors.push({
            row: index + 1,
            column: categoryMapping.csvColumn,
            message: `Category with slug '${categorySlug}' not found`,
            value: categorySlug
          })
        }
      }
    })

    setValidationErrors(errors)
    setStep('validation')
  }

  const performImport = async () => {
    if (!tenant?.id || validationErrors.length > 0) return

    setStep('importing')
    setImportProgress({ current: 0, total: csvData.length })

    const tenantDb = new TenantDatabase(tenant.id)
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < csvData.length; i++) {
      try {
        const row = csvData[i]
        const productData: any = {}

        // Map CSV data to product properties
        columnMappings.forEach(mapping => {
          if (!mapping.productProperty || mapping.productProperty === 'skip') return

          const value = row[mapping.csvColumn]
          const property = PRODUCT_PROPERTIES.find(p => p.value === mapping.productProperty)
          if (!property || !value || !value.trim()) return

          switch (property.type) {
            case 'number':
              productData[mapping.productProperty] = Number(value)
              break
            case 'boolean':
              const lowerValue = value.toLowerCase()
              productData[mapping.productProperty] = ['true', '1', 'yes', 'active'].includes(lowerValue)
              break
            case 'text':
            default:
              if (mapping.productProperty === 'tags') {
                productData[mapping.productProperty] = value.split(',').map(tag => tag.trim()).filter(Boolean)
              } else {
                productData[mapping.productProperty] = value.trim()
              }
              break
          }
        })

        // Handle category mapping
        const categoryMapping = columnMappings.find(m => m.productProperty === 'category_slug')
        if (categoryMapping && categoryMapping.productProperty !== 'skip' && row[categoryMapping.csvColumn]) {
          const categorySlug = row[categoryMapping.csvColumn].trim()
          const category = categories.find(c => c.slug === categorySlug)
          if (category) {
            productData.category_id = category.id
          }
        }

        // Generate slug if not provided
        if (!productData.slug && productData.name) {
          productData.slug = productData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
        }

        // Set defaults
        productData.track_inventory = true
        productData.allow_backorder = false
        productData.images = []
        productData.variants = []

        if (productData.inventory_quantity === undefined) {
          productData.inventory_quantity = 0
        }
        if (productData.is_active === undefined) {
          productData.is_active = true
        }
        if (productData.is_featured === undefined) {
          productData.is_featured = false
        }

        // Handle image URL - download and upload to Supabase Storage
        const imageMapping = columnMappings.find(m => m.productProperty === 'image_url')
        if (imageMapping && imageMapping.productProperty !== 'skip' && row[imageMapping.csvColumn]) {
          const imageUrl = row[imageMapping.csvColumn].trim()
          if (imageUrl) {
            try {
              const uploadResult = await productImageStorage.downloadAndUploadFromUrl(
                imageUrl,
                {
                  tenantId: tenant.id,
                  productId: productData.slug || 'imported-product'
                }
              )
              
              if (uploadResult.success && uploadResult.url) {
                productData.images = [uploadResult.url]
              } else {
                console.warn(`Failed to upload image for row ${i + 1}: ${uploadResult.error}`)
              }
            } catch (error) {
              console.warn(`Error processing image for row ${i + 1}:`, error)
            }
          }
        }

        const result = await tenantDb.createProduct(productData)
        
        if (result.error) {
          console.error(`Error importing row ${i + 1}:`, result.error)
          errorCount++
        } else {
          successCount++
        }
      } catch (error) {
        console.error(`Error importing row ${i + 1}:`, error)
        errorCount++
      }

      setImportProgress({ current: i + 1, total: csvData.length })
      // Small delay to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    alert(`Import completed! ${successCount} products imported successfully, ${errorCount} errors.`)
    onImportComplete()
    handleClose()
  }

  const handleClose = () => {
    setStep('upload')
    setCsvData([])
    setCsvHeaders([])
    setColumnMappings([])
    setValidationErrors([])
    setImportProgress({ current: 0, total: 0 })
    onOpenChange(false)
  }

  const downloadTemplate = () => {
    const headers = ['name', 'price', 'description', 'short_description', 'sku', 'inventory_quantity', 'category_slug', 'image_url', 'is_active']
    const example = ['Sample Product', '29.99', 'A great product description', 'Short description', 'SKU001', '100', 'electronics', 'https://example.com/product-image.jpg', 'true']
    
    const csvContent = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file and map the columns to product properties
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Step 1: Upload CSV File</h3>
                <p className="text-sm text-muted-foreground">
                  Select a CSV file with your product data
                </p>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Click to upload
                </span>
                <span className="text-sm text-gray-600"> or drag and drop</span>
              </Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">CSV files only</p>
            </div>

            <div className="flex items-center gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">
                Your CSV file should have column headers in the first row. Supported columns include: name, price, description, sku, inventory_quantity, category_slug, etc.
              </p>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Step 2: Map CSV Columns</h3>
              <p className="text-sm text-muted-foreground">
                Map your CSV columns to product properties. Found {csvData.length} rows.
              </p>
            </div>

            <div className="grid gap-4">
              {csvHeaders.map((header) => (
                <div key={header} className="flex items-center gap-4">
                  <div className="w-48">
                    <Label className="text-sm font-medium">{header}</Label>
                    <div className="text-xs text-muted-foreground mt-1">
                      Example: {csvData[0]?.[header] || 'N/A'}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Select
                      value={columnMappings.find(m => m.csvColumn === header)?.productProperty || 'skip'}
                      onValueChange={(value) => updateColumnMapping(header, value === 'skip' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Skip this column</SelectItem>
                        {PRODUCT_PROPERTIES.map((prop) => (
                          <SelectItem key={prop.value} value={prop.value}>
                            {prop.label} {prop.required && <span className="text-red-500">*</span>}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <p className="text-sm text-orange-800">
                Fields marked with * are required. Make sure to map at least the required columns.
              </p>
            </div>
          </div>
        )}

        {step === 'validation' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Step 3: Validation Results</h3>
              <p className="text-sm text-muted-foreground">
                Review any validation errors before importing
              </p>
            </div>

            {validationErrors.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  All data validated successfully! Ready to import {csvData.length} products.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    Found {validationErrors.length} validation errors. Please fix these before importing.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Validation Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Row</TableHead>
                            <TableHead>Column</TableHead>
                            <TableHead>Error</TableHead>
                            <TableHead>Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {validationErrors.map((error, index) => (
                            <TableRow key={index}>
                              <TableCell>{error.row === 0 ? 'Mapping' : error.row}</TableCell>
                              <TableCell>{error.column}</TableCell>
                              <TableCell>{error.message}</TableCell>
                              <TableCell className="font-mono text-xs">{error.value}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {step === 'importing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Step 4: Importing Products</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we import your products...
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {step === 'mapping' && (
            <Button onClick={validateData}>
              Validate Data
            </Button>
          )}
          {step === 'validation' && validationErrors.length === 0 && (
            <Button onClick={performImport}>
              Import Products
            </Button>
          )}
          {step === 'validation' && validationErrors.length > 0 && (
            <Button variant="outline" onClick={() => setStep('mapping')}>
              Back to Mapping
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
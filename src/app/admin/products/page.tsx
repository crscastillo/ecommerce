'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '@/lib/contexts/tenant-context'
import { formatPrice } from '@/lib/utils/currency'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { CSVImportModal } from '@/components/admin/csv-import-modal'
import { isProductLowStock } from '@/lib/utils/low-stock'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  product_type: 'single' | 'variable' | 'digital'
  inventory_quantity: number
  track_inventory: boolean
  is_active: boolean
  is_featured: boolean
  category_id: string
  sku: string
  variants: any
  created_at: string
}

export default function ProductsPage() {
  const { tenant } = useTenant()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterProductType, setFilterProductType] = useState<'all' | 'single' | 'variable' | 'digital'>('all')
  const [showImportModal, setShowImportModal] = useState(false)
  const [tenantSettings, setTenantSettings] = useState<any>({})
  
  const supabase = createClient()

  const loadProducts = async () => {
    if (!tenant?.id) return
    
    try {
      setLoading(true)
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (filterStatus !== 'all') {
        query = query.eq('is_active', filterStatus === 'active')
      }
      
      // Apply product type filter
      if (filterProductType !== 'all') {
        query = query.eq('product_type', filterProductType)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading products:', error)
      } else {
        setProducts(data || [])
      }

      // Load tenant settings
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('settings')
        .eq('id', tenant.id)
        .single()
      
      if (tenantData?.settings) {
        setTenantSettings(tenantData.settings)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        console.error('Error deleting product:', error)
        alert('Failed to delete product')
      } else {
        // Reload products
        loadProducts()
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)

      if (error) {
        console.error('Error updating product status:', error)
        alert('Failed to update product status')
      } else {
        // Reload products
        loadProducts()
      }
    } catch (error) {
      console.error('Error updating product status:', error)
      alert('Failed to update product status')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [tenant?.id, searchQuery, filterStatus, filterProductType])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your store's product catalog
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex gap-2">
                <div className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
                  Status:
                </div>
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterStatus === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('inactive')}
                >
                  Inactive
                </Button>
              </div>

              {/* Product Type Filter */}
              <div className="flex gap-2">
                <div className="text-sm font-medium text-muted-foreground mr-2 flex items-center">
                  Type:
                </div>
                <Button
                  variant={filterProductType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProductType('all')}
                >
                  All
                </Button>
                <Button
                  variant={filterProductType === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProductType('single')}
                >
                  📦 Single
                </Button>
                <Button
                  variant={filterProductType === 'variable' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProductType('variable')}
                >
                  🔀 Variable
                </Button>
                <Button
                  variant={filterProductType === 'digital' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProductType('digital')}
                >
                  💾 Digital
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Products ({products.length})
          </CardTitle>
          <CardDescription>
            A list of all products in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || filterStatus !== 'all' 
                  ? 'No products match your current filters.' 
                  : 'Get started by adding your first product.'
                }
              </p>
              <Button asChild>
                <Link href="/admin/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            product.product_type === 'variable' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            product.product_type === 'digital' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {product.product_type === 'single' && '📦 Single'}
                          {product.product_type === 'variable' && '� Variable'}
                          {product.product_type === 'digital' && '💾 Digital'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {product.sku || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {product.product_type === 'variable' ? (
                          <span className="text-sm text-muted-foreground">
                            {(() => {
                              // Parse variants to get price range
                              let variants = product.variants
                              if (typeof variants === 'string') {
                                try {
                                  variants = JSON.parse(variants)
                                } catch (e) {
                                  variants = []
                                }
                              }
                              
                              if (!Array.isArray(variants)) {
                                variants = Object.values(variants || {})
                              }
                              
                              const activeVariants = variants.filter((v: any) => v.is_active !== false)
                              
                              if (activeVariants.length === 0) return 'No variants'
                              
                              const prices = activeVariants.map((v: any) => parseFloat(v.price || 0))
                              const minPrice = Math.min(...prices)
                              const maxPrice = Math.max(...prices)
                              
                              if (minPrice === maxPrice) {
                                return formatPrice(minPrice, tenant)
                              }
                              return `${formatPrice(minPrice, tenant)} - ${formatPrice(maxPrice, tenant)}`
                            })()}
                          </span>
                        ) : (
                          formatPrice(product.price, tenant)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {product.product_type === 'digital' ? (
                            <Badge variant="outline" className="text-xs">Digital</Badge>
                          ) : product.product_type === 'variable' ? (
                            (() => {
                              // Parse variants to get total count
                              let variants = product.variants
                              if (typeof variants === 'string') {
                                try {
                                  variants = JSON.parse(variants)
                                } catch (e) {
                                  variants = []
                                }
                              }
                              
                              if (!Array.isArray(variants)) {
                                variants = Object.values(variants || {})
                              }
                              
                              const activeVariants = variants.filter((v: any) => v.is_active !== false)
                              const totalStock = activeVariants.reduce((sum: number, v: any) => 
                                sum + parseInt(v.stock_quantity || 0), 0
                              )
                              
                              return (
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm ${
                                    totalStock > (tenantSettings.low_stock_threshold || 5)
                                      ? 'text-green-600' 
                                      : totalStock > 0 
                                        ? 'text-yellow-600' 
                                        : 'text-red-600'
                                  }`}>
                                    {totalStock}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({activeVariants.length} variants)
                                  </span>
                                </div>
                              )
                            })()
                          ) : (
                            <>
                              <span className={`text-sm ${
                                product.inventory_quantity > (tenantSettings.low_stock_threshold || 5)
                                  ? 'text-green-600' 
                                  : product.inventory_quantity > 0 
                                    ? 'text-yellow-600' 
                                    : 'text-red-600'
                              }`}>
                                {product.inventory_quantity}
                              </span>
                              {product.track_inventory && isProductLowStock(product, { low_stock_threshold: tenantSettings.low_stock_threshold || 5 }) && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.is_active ? 'default' : 'secondary'}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {product.is_featured && (
                            <Badge variant="outline">Featured</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(product.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}?mode=edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => toggleProductStatus(product.id, product.is_active)}
                            >
                              {product.is_active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => deleteProduct(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CSV Import Modal */}
      <CSVImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImportComplete={() => {
          loadProducts() // Reload products after import
        }}
      />
    </div>
  )
}
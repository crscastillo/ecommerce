'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { ProductWithVariants, TenantSettings } from '@/lib/types/product'
import { 
  getProductPriceRange, 
  getProductInventory, 
  getInventoryColorClass,
  getProductTypeBadgeClass,
  getProductTypeDisplay,
  formatProductDate
} from '@/lib/utils/product-utils'

interface ProductMobileCardProps {
  products: ProductWithVariants[]
  settings: TenantSettings
  tenant: any
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
  onToggleStatus: (productId: string, currentStatus: boolean) => void
}

export function ProductMobileCard({ 
  products, 
  settings, 
  tenant, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ProductMobileCardProps) {
  return (
    <div className="lg:hidden space-y-3">
      {products.map((product) => {
        const inventory = getProductInventory(product, settings)
        
        return (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base leading-tight mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono">{product.slug}</p>
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  {/* Quick Edit Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onEdit(product.id)}
                    className="h-8 px-2"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  {/* More Actions Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}`} className="text-sm">
                          <Eye className="mr-2 h-3 w-3" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.slug}`} target="_blank" className="text-sm">
                          <Eye className="mr-2 h-3 w-3" />
                          View in Store
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(product.id, product.is_active)}
                        className="text-sm"
                      >
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 text-sm"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge 
                  variant="outline"
                  className={`text-xs ${getProductTypeBadgeClass(product.product_type)}`}
                >
                  {getProductTypeDisplay(product.product_type)}
                </Badge>
                <Badge 
                  variant={product.is_active ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {product.is_featured && (
                  <Badge variant="outline" className="text-xs">Featured</Badge>
                )}
                {inventory.isLowStock && inventory.status !== 'digital' && (
                  <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                    <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>
              
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium">Price</span>
                  <p className="font-semibold text-sm">
                    {getProductPriceRange(product, tenant)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium">Inventory</span>
                  <div className="flex items-center gap-1">
                    {inventory.status === 'digital' ? (
                      <Badge variant="outline" className="text-xs">Digital</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold text-sm ${getInventoryColorClass(inventory.status)}`}>
                          {inventory.total}
                        </span>
                        {inventory.variants > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({inventory.variants} variants)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium">SKU</span>
                  <p className="font-mono text-xs">{product.sku || 'N/A'}</p>
                </div>
                
                <div className="space-y-1">
                  <span className="text-muted-foreground text-xs font-medium">Created</span>
                  <p className="text-xs">{formatProductDate(product.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
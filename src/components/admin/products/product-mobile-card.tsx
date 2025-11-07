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
    <div className="lg:hidden space-y-2">
      {products.map((product) => {
        const inventory = getProductInventory(product, settings)
        
        return (
          <Card key={product.id} className="overflow-hidden shadow-sm">
            <CardContent className="p-3">
              {/* Compact Header Row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={product.is_active ? 'default' : 'secondary'}
                      className="text-xs h-5 px-1.5"
                    >
                      {product.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={`text-xs h-5 px-1.5 ${getProductTypeBadgeClass(product.product_type)}`}
                    >
                      {getProductTypeDisplay(product.product_type)}
                    </Badge>
                    {inventory.isLowStock && inventory.status !== 'digital' && (
                      <AlertTriangle className="h-3 w-3 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onEdit(product.id)}
                    className="h-7 w-7 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <span className="sr-only">Actions</span>
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[140px]">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/products/${product.id}`} className="text-xs">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${product.slug}`} target="_blank" className="text-xs">
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(product.id, product.is_active)}
                        className="text-xs"
                      >
                        {product.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(product.id)}
                        className="text-red-600 text-xs"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Compact Info Row */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-semibold">
                      {getProductPriceRange(product, tenant)}
                    </span>
                  </div>
                  {product.brand && (
                    <div className="text-muted-foreground">
                      <span className="text-xs">Brand: {product.brand.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {inventory.status === 'digital' ? (
                      <span className="text-muted-foreground">Digital</span>
                    ) : (
                      <span className={`font-medium ${getInventoryColorClass(inventory.status)}`}>
                        Stock: {inventory.total}
                        {inventory.variants > 0 && <span className="text-muted-foreground ml-1">({inventory.variants})</span>}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-muted-foreground">
                  {product.sku && (
                    <span className="font-mono">{product.sku.length > 8 ? product.sku.substring(0, 8) + '...' : product.sku}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
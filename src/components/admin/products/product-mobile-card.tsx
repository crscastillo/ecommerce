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
    <div className="lg:hidden space-y-4">
      {products.map((product) => {
        const inventory = getProductInventory(product, settings)
        
        return (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{product.slug}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
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
                    <DropdownMenuItem onClick={() => onEdit(product.id)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onToggleStatus(product.id, product.is_active)}
                    >
                      {product.is_active ? 'Deactivate' : 'Activate'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(product.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge 
                  variant="outline"
                  className={getProductTypeBadgeClass(product.product_type)}
                >
                  {getProductTypeDisplay(product.product_type)}
                </Badge>
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {product.is_featured && (
                  <Badge variant="outline">Featured</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">Price</span>
                  <p className="font-semibold">
                    {getProductPriceRange(product, tenant)}
                  </p>
                </div>
                
                <div>
                  <span className="text-muted-foreground text-xs">Inventory</span>
                  <div className="flex items-center gap-1">
                    {inventory.status === 'digital' ? (
                      <Badge variant="outline" className="text-xs">Digital</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`font-semibold ${getInventoryColorClass(inventory.status)}`}>
                          {inventory.total}
                        </span>
                        {inventory.variants > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({inventory.variants})
                          </span>
                        )}
                        {inventory.isLowStock && (
                          <AlertTriangle className="h-3 w-3 text-orange-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="text-muted-foreground text-xs">SKU</span>
                  <p className="font-mono text-xs truncate">{product.sku || 'N/A'}</p>
                </div>
                
                <div>
                  <span className="text-muted-foreground text-xs">Created</span>
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
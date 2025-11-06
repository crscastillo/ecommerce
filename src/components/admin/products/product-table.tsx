'use client'

import { Button } from '@/components/ui/button'
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

interface ProductTableProps {
  products: ProductWithVariants[]
  settings: TenantSettings
  tenant: any
  onEdit: (productId: string) => void
  onDelete: (productId: string) => void
  onToggleStatus: (productId: string, currentStatus: boolean) => void
}

export function ProductTable({ 
  products, 
  settings, 
  tenant, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: ProductTableProps) {
  return (
    <div className="hidden lg:block overflow-x-auto">
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
          {products.map((product) => {
            const inventory = getProductInventory(product, settings)
            
            return (
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
                    className={getProductTypeBadgeClass(product.product_type)}
                  >
                    {getProductTypeDisplay(product.product_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {product.sku || 'N/A'}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {getProductPriceRange(product, tenant)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {inventory.status === 'digital' ? (
                      <Badge variant="outline" className="text-xs">Digital</Badge>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${getInventoryColorClass(inventory.status)}`}>
                          {inventory.total}
                        </span>
                        {inventory.variants > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({inventory.variants} variants)
                          </span>
                        )}
                        {inventory.isLowStock && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
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
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatProductDate(product.created_at)}
                  </span>
                </TableCell>
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
                        <Link href={`/product/${product.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          View in Store
                        </Link>
                      </DropdownMenuItem>
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
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
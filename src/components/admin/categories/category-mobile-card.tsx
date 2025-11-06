'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { CategoryWithProductCount } from '@/lib/types/category'

interface CategoryMobileCardProps {
  categories: CategoryWithProductCount[]
  onDelete: (category: CategoryWithProductCount) => Promise<void>
  onToggleStatus: (categoryId: string, currentStatus: boolean) => Promise<void>
}

export function CategoryMobileCard({ 
  categories, 
  onDelete, 
  onToggleStatus
}: CategoryMobileCardProps) {
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithProductCount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteCategory) return

    setDeleting(true)
    try {
      await onDelete(deleteCategory)
      setDeleteCategory(null)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="lg:hidden space-y-2">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden shadow-sm">
            <CardContent className="p-3">
              {/* Compact Header Row */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight truncate">{category.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant={category.is_active ? 'default' : 'secondary'}
                      className="text-xs h-5 px-1.5"
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {category.product_count || 0} products
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-1">
                  <Button 
                    asChild
                    size="sm" 
                    variant="ghost" 
                    className="h-7 w-7 p-0"
                  >
                    <Link href={`/admin/categories/${category.id}?mode=edit`}>
                      <Edit className="h-3 w-3" />
                    </Link>
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
                        <Link href={`/admin/categories/${category.id}`} className="text-xs">
                          <Package className="mr-2 h-3 w-3" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/products/category/${category.slug}`} target="_blank" className="text-xs">
                          <Eye className="mr-2 h-3 w-3" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(category.id, category.is_active)}
                        className="text-xs"
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteCategory(category)}
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
                    <span className="text-muted-foreground">Sort: </span>
                    <span className="font-medium">{category.sort_order}</span>
                  </div>
                  {category.description && (
                    <div className="text-muted-foreground truncate max-w-[120px]">
                      {category.description}
                    </div>
                  )}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-mono">
                    {category.slug.length > 12 ? category.slug.substring(0, 12) + '...' : category.slug}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCategory} onOpenChange={() => setDeleteCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCategory?.name}"? This action cannot be undone and will remove the category from all products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Category'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
'use client'

import { useState } from 'react'
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
  Plus,
  FolderOpen,
  Package
} from 'lucide-react'
import Link from 'next/link'
import { CategoryWithProductCount } from '@/lib/types/category'

interface CategoryTableProps {
  categories: CategoryWithProductCount[]
  loading: boolean
  onDelete: (category: CategoryWithProductCount) => Promise<void>
  onToggleStatus: (categoryId: string, currentStatus: boolean) => Promise<void>
}

export function CategoryTable({ 
  categories, 
  loading, 
  onDelete, 
  onToggleStatus
}: CategoryTableProps) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No categories found</h3>
        <p className="text-muted-foreground mb-4">
          Get started by creating your first category.
        </p>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                        {category.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                    {category.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {category.product_count || 0} products
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono">
                    {category.sort_order}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={category.is_active ? 'default' : 'secondary'}
                    className={category.is_active ? 'bg-green-100 text-green-800' : ''}
                  >
                    {category.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {new Date(category.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
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
                        <Link href={`/products/category/${category.slug}`} target="_blank">
                          <Eye className="mr-2 h-4 w-4" />
                          View in Store
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/categories/${category.id}`}>
                          <Package className="mr-2 h-4 w-4" />
                          View Category
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onToggleStatus(category.id, category.is_active)}
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteCategory(category)}
                        className="text-red-600 focus:text-red-600"
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
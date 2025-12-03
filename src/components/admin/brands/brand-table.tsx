'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Package, 
  ExternalLink,
  ArrowUpDown,
  ChevronUp,
  ChevronDown
} from 'lucide-react'
import { BrandWithProductCount } from '@/lib/types/brand'

interface BrandTableProps {
  brands: BrandWithProductCount[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

type SortField = 'name' | 'created_at' | 'updated_at' | 'sort_order' | 'product_count'
type SortDirection = 'asc' | 'desc'

export function BrandTable({ brands, onEdit, onDelete }: BrandTableProps) {
  const t = useTranslations('brands')
  const [sortField, setSortField] = useState<SortField>('sort_order')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [deleteBrand, setDeleteBrand] = useState<BrandWithProductCount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedBrands = [...brands].sort((a, b) => {
    let aVal: any = a[sortField]
    let bVal: any = b[sortField]

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) aVal = ''
    if (bVal === null || bVal === undefined) bVal = ''

    // Handle number comparison
    if (sortField === 'sort_order' || sortField === 'product_count') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    }

    // Handle date comparison
    if (sortField === 'created_at' || sortField === 'updated_at') {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    // Compare values
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="ml-2 h-4 w-4" />
      : <ChevronDown className="ml-2 h-4 w-4" />
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noBrandsFound')}</h3>
        <p className="text-gray-500">{t('getBrandsStarted')}</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">{t('logo')}</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                {t('name')}
                <SortIcon field="name" />
              </Button>
            </TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('product_count')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                {t('products')}
                <SortIcon field="product_count" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('sort_order')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                {t('sort')}
                <SortIcon field="sort_order" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('created_at')}
                className="h-auto p-0 font-semibold hover:bg-transparent"
              >
                {t('created')}
                <SortIcon field="created_at" />
              </Button>
            </TableHead>
            <TableHead className="w-[50px]">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedBrands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.name} logo`}
                    className="w-8 h-8 object-contain bg-white rounded border"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{brand.name}</span>
                  {brand.description && (
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {brand.description}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {brand.slug && (
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                        /{brand.slug}
                      </span>
                    )}
                    {brand.website_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-6 px-1.5 text-xs"
                      >
                        <a
                          href={brand.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {t('website')}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                  {brand.is_active ? t('active') : t('inactive')}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{brand.product_count || 0}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm">{brand.sort_order}</span>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {new Date(brand.created_at).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(brand.id)}>
                      <Edit2 className="mr-2 h-4 w-4" />
                      {t('edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setDeleteBrand(brand)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBrand} onOpenChange={() => setDeleteBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteBrand')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteBrandConfirmation', { name: deleteBrand?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteBrand) return
                setDeleting(true)
                try {
                  await onDelete(deleteBrand.id)
                  setDeleteBrand(null)
                } catch (error) {
                } finally {
                  setDeleting(false)
                }
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? t('deleting') : t('deleteBrand')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
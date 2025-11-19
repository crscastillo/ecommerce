'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { ExternalLink, Edit2, Trash2, Package, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BrandWithProductCount } from '@/lib/types/brand'

interface BrandMobileCardProps {
  brand: BrandWithProductCount
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function BrandMobileCard({ brand, onEdit, onDelete }: BrandMobileCardProps) {
  const t = useTranslations('brands')
  const [deleteBrand, setDeleteBrand] = useState<BrandWithProductCount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteBrand) return

    setDeleting(true)
    try {
      await onDelete(deleteBrand.id)
      setDeleteBrand(null)
    } catch (error) {
      console.error('Error deleting brand:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {brand.logo_url ? (
              <img
                src={brand.logo_url}
                alt={`${brand.name} logo`}
                className="w-10 h-10 object-contain bg-white rounded-md border flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {brand.name}
              </CardTitle>
              {brand.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(brand.id)}>
                <Edit2 className="h-4 w-4 mr-2" />
                {t('edit')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteBrand(brand)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-3">
        {/* Status and Product Count */}
        <div className="flex items-center justify-between">
          <Badge variant={brand.is_active ? 'default' : 'secondary'}>
            {brand.is_active ? t('active') : t('inactive')}
          </Badge>
          {typeof brand.product_count === 'number' && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>{brand.product_count} {t('products').toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Website Link */}
        {brand.website_url && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-7 text-xs flex-1"
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
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>{t('created')}: {new Date(brand.created_at).toLocaleDateString()}</div>
          {brand.updated_at && brand.updated_at !== brand.created_at && (
            <div>{t('updated')}: {new Date(brand.updated_at).toLocaleDateString()}</div>
          )}
          {brand.slug && (
            <div className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs inline-block">
              /{brand.slug}
            </div>
          )}
        </div>
      </CardContent>
    </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteBrand} onOpenChange={() => setDeleteBrand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteBrand')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteBrandConfirmation', { name: deleteBrand?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? t('deleting') : t('deleteBrand')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
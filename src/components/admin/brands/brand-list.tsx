'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Grid, List, Package } from 'lucide-react'
import Link from 'next/link'
import { BrandTable } from './brand-table'
import { BrandMobileCard } from './brand-mobile-card'
import { BrandWithProductCount } from '@/lib/types/brand'

interface BrandListProps {
  brands: BrandWithProductCount[]
  loading: boolean
  hasFilters: boolean
  onDelete: (brandId: string) => Promise<void>
}

export function BrandList({ 
  brands, 
  loading, 
  hasFilters,
  onDelete
}: BrandListProps) {
  const router = useRouter()

  const handleEdit = (id: string) => {
    router.push(`/admin/brands/${id}`)
  }

  const handleDelete = async (id: string) => {
    await onDelete(id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 md:py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-2 md:mb-3"></div>
          <p className="text-xs md:text-sm text-muted-foreground">Loading brands...</p>
        </div>
      </div>
    )
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-6 md:py-8 px-4">
        <Package className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
        <h3 className="text-base md:text-lg font-semibold mb-2">No brands found</h3>
        <p className="text-muted-foreground mb-4 text-xs md:text-sm max-w-md mx-auto">
          {hasFilters 
            ? 'No brands match your current filters. Try adjusting your search criteria.' 
            : 'Get started by creating your first brand to organize your products.'
          }
        </p>
        <Button asChild size="sm" className="h-8 md:h-auto">
          <Link href="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {brands.map((brand) => (
          <BrandMobileCard
            key={brand.id}
            brand={brand}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <BrandTable
          brands={brands}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}
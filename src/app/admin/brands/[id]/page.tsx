'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { BrandForm } from '@/components/admin/brands/brand-form'
import { Brand } from '@/lib/types/brand'
import { Card, CardContent } from '@/components/ui/card'
import { Package, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function BrandDetailPage() {
  const params = useParams()
  const { tenant } = useTenant()
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const brandId = params?.id as string

  useEffect(() => {
    const loadBrand = async () => {
      if (!tenant?.id || !brandId) {
        setError('Missing tenant or brand ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const tenantDb = new TenantDatabase(tenant.id)
        const { data, error: fetchError } = await tenantDb.getBrand(brandId)

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          setError('Brand not found')
        } else {
          setBrand(data)
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load brand')
      } finally {
        setLoading(false)
      }
    }

    loadBrand()
  }, [tenant?.id, brandId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">Edit Brand</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Brand</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/brands">
                Back to Brands
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-gray-600" />
          <h1 className="text-2xl font-bold">Brand Not Found</h1>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brand Not Found</h3>
            <p className="text-gray-600 mb-4">
              The brand you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/admin/brands">
                Back to Brands
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <BrandForm mode="edit" initialData={brand} />
}
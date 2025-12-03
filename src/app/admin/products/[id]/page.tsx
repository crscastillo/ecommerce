'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { ProductForm } from '@/components/admin/products/product-form'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  product_type: 'single' | 'variable' | 'digital'
  sku: string | null
  price: number
  compare_price: number | null
  cost_price: number | null
  track_inventory: boolean
  inventory_quantity: number
  allow_backorder: boolean
  weight: number | null
  category_id: string | null
  brand_id: string | null
  is_active: boolean
  is_featured: boolean
  seo_title: string | null
  seo_description: string | null
  images: any
  variants: any
  created_at: string
  updated_at: string
}

export default function ProductEditPage() {
  const params = useParams()
  const { tenant } = useTenant()
  const t = useTranslations('products')
  const productId = params.id as string

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProduct = async () => {
      if (!tenant?.id || !productId) return

      try {
        setLoading(true)
        setError('')

        const tenantDb = new TenantDatabase(tenant.id)
        const { data: productData, error: productError } = await tenantDb.getProduct(productId)

        if (productError) {
          throw new Error(productError)
        }

        if (!productData) {
          throw new Error(t('productNotFound'))
        }

        setProduct(productData)
      } catch (err: any) {
        setError(err.message || t('failedToLoadProduct'))
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [tenant?.id, productId, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingProduct')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('productNotFound')}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return <ProductForm mode="edit" initialData={product} />
}

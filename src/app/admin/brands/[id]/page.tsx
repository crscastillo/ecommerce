'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { Brand } from '@/lib/types/brand'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Package, 
  AlertCircle, 
  Edit2, 
  ArrowLeft, 
  ExternalLink,
  Calendar,
  Hash,
  Globe,
  FileText,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useBrandActions } from '@/lib/hooks/use-brands'
import { useToast } from '@/lib/contexts/toast-context'

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tenant } = useTenant()
  const { success, error: showError } = useToast()
  const { deleteBrand } = useBrandActions()
  
  const [brand, setBrand] = useState<Brand | null>(null)
  const [productCount, setProductCount] = useState<number>(0)
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
        
        // Load brand data
        const { data, error: fetchError } = await tenantDb.getBrand(brandId)

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          setError('Brand not found')
        } else {
          setBrand(data)
          
          // Load product count
          try {
            const { data: products } = await tenantDb.getProducts({ brand_id: brandId })
            setProductCount(products?.length || 0)
          } catch (err) {
            console.warn('Could not load product count:', err)
            setProductCount(0)
          }
        }
      } catch (err: any) {
        console.error('Error loading brand:', err)
        setError(err.message || 'Failed to load brand')
      } finally {
        setLoading(false)
      }
    }

    loadBrand()
  }, [tenant?.id, brandId])

  const handleDelete = async () => {
    if (!brand) return

    if (window.confirm(`Are you sure you want to delete "${brand.name}"? This action cannot be undone.`)) {
      try {
        await deleteBrand(brand.id)
        success(`Brand "${brand.name}" has been deleted.`)
        router.push('/admin/brands')
      } catch (err: any) {
        showError(err.message || 'Failed to delete brand')
      }
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="h-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !brand) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/brands">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold">Brand Details</h1>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || 'Brand Not Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "The brand you're looking for doesn't exist or you don't have permission to view it."}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/brands">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold">{brand.name}</h1>
              <p className="text-muted-foreground">Brand Details</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/brands/${brand.id}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={`${brand.name} logo`}
                    className="w-16 h-16 object-contain bg-white rounded border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1">{brand.name}</h2>
                  <p className="text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded inline-block">
                    /{brand.slug}
                  </p>
                </div>
              </div>

              {brand.description && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-muted-foreground">{brand.description}</p>
                  </div>
                </>
              )}

              {brand.website_url && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </h4>
                    <Button variant="outline" size="sm" asChild>
                      <a href={brand.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* SEO Information */}
          {(brand.seo_title || brand.seo_description) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  SEO Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {brand.seo_title && (
                  <div>
                    <h4 className="font-medium mb-2">SEO Title</h4>
                    <p className="text-muted-foreground">{brand.seo_title}</p>
                  </div>
                )}
                {brand.seo_description && (
                  <div>
                    <h4 className="font-medium mb-2">SEO Description</h4>
                    <p className="text-muted-foreground">{brand.seo_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <Badge variant={brand.is_active ? 'default' : 'secondary'}>
                  {brand.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Products
                </span>
                <span className="font-semibold">{productCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Sort Order
                </span>
                <span className="font-mono text-sm">{brand.sort_order}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium mb-1">Created</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(brand.created_at).toLocaleString()}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm font-medium mb-1">Last Updated</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(brand.updated_at).toLocaleString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
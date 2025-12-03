'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { CategoryForm } from '@/components/admin/categories/category-form'
import { Category } from '@/lib/types/category'
import { Card, CardContent } from '@/components/ui/card'
import { FolderOpen, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function CategoryPage() {
  const params = useParams()
  const { tenant } = useTenant()
  const t = useTranslations('categories')
  const categoryId = params.id as string

  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadCategory = async () => {
      if (!tenant?.id || !categoryId) return

      try {
        setLoading(true)
        setError('')

        const tenantDb = new TenantDatabase(tenant.id)
        const { data, error: fetchError } = await tenantDb.getCategory(categoryId)

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        if (!data) {
          throw new Error(t('categoryNotFound'))
        }

        setCategory(data)
      } catch (err: any) {
        setError(err.message || t('failedToLoadCategory'))
      } finally {
        setLoading(false)
      }
    }

    loadCategory()
  }, [tenant?.id, categoryId, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('loadingCategory')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Category</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button asChild>
              <Link href="/admin/categories">
                Back to Categories
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Category Not Found</h3>
            <p className="text-gray-600 mb-4">
              The category you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/admin/categories">
                Back to Categories
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <CategoryForm mode="edit" initialData={category} />
}
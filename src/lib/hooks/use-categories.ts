'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { 
  Category, 
  CategoryWithProductCount, 
  CategoryCreateData, 
  CategoryFilters 
} from '@/lib/types/category'

interface UseCategoriesReturn {
  categories: CategoryWithProductCount[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useCategories(filters: CategoryFilters): UseCategoriesReturn {
  const { tenant } = useTenant()
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCategories = useCallback(async () => {
    if (!tenant?.id) {
      setCategories([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const tenantDb = new TenantDatabase(tenant.id)
      
      // Build filters for the database query
      const dbFilters: any = {}
      if (filters.is_active !== undefined) {
        dbFilters.is_active = filters.is_active
      }

      const { data, error: dbError } = await tenantDb.getCategories(dbFilters)
      
      if (dbError) {
        throw new Error(dbError.message)
      }

      let filteredCategories = data || []
      
      // Apply search filter client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredCategories = filteredCategories.filter((category: Category) =>
          category.name.toLowerCase().includes(searchLower) ||
          category.description?.toLowerCase().includes(searchLower) ||
          category.slug.toLowerCase().includes(searchLower)
        )
      }

      // Load product counts for each category
      const categoriesWithCounts = await Promise.all(
        filteredCategories.map(async (category: Category) => {
          try {
            const { data: products } = await tenantDb.getProducts({ category_id: category.id })
            return {
              ...category,
              product_count: products?.length || 0
            }
          } catch {
            return {
              ...category,
              product_count: 0
            }
          }
        })
      )

      setCategories(categoriesWithCounts)
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  }
}

interface UseCategoryActionsReturn {
  createCategory: (data: CategoryCreateData) => Promise<void>
  updateCategory: (id: string, data: CategoryCreateData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  toggleCategoryStatus: (id: string, currentStatus: boolean) => Promise<void>
  loading: boolean
  error: string
}

export function useCategoryActions(onSuccess?: () => void): UseCategoryActionsReturn {
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createCategory = async (data: CategoryCreateData) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: createError } = await tenantDb.createCategory(data)
      
      if (createError) {
        throw new Error(createError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create category'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, data: CategoryCreateData) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: updateError } = await tenantDb.updateCategory(id, data)
      
      if (updateError) {
        throw new Error(updateError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update category'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: deleteError } = await tenantDb.deleteCategory(id)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete category'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategoryStatus = async (id: string, currentStatus: boolean) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: updateError } = await tenantDb.updateCategory(id, { 
        is_active: !currentStatus 
      })
      
      if (updateError) {
        throw new Error(updateError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update category status'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    loading,
    error
  }
}
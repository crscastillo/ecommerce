'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { 
  Brand, 
  BrandWithProductCount, 
  BrandCreateData, 
  BrandFilters 
} from '@/lib/types/brand'

interface UseBrandsReturn {
  brands: BrandWithProductCount[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useBrands(filters: BrandFilters): UseBrandsReturn {
  const { tenant } = useTenant()
  const [brands, setBrands] = useState<BrandWithProductCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBrands = useCallback(async () => {
    if (!tenant?.id) {
      setBrands([])
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

      const { data, error: dbError } = await tenantDb.getBrands(dbFilters)
      
      if (dbError) {
        throw new Error(dbError.message)
      }

      let filteredBrands = data || []
      
      // Apply search filter client-side
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredBrands = filteredBrands.filter((brand: Brand) =>
          brand.name.toLowerCase().includes(searchLower) ||
          brand.description?.toLowerCase().includes(searchLower) ||
          brand.slug.toLowerCase().includes(searchLower)
        )
      }

      // Load product counts for each brand
      const brandsWithCounts = await Promise.all(
        filteredBrands.map(async (brand: Brand) => {
          try {
            const { data: products } = await tenantDb.getProducts({ brand_id: brand.id })
            return {
              ...brand,
              product_count: products?.length || 0
            }
          } catch {
            return {
              ...brand,
              product_count: 0
            }
          }
        })
      )

      setBrands(brandsWithCounts)
    } catch (err: any) {
      console.error('Error loading brands:', err)
      setError(err.message || 'Failed to load brands')
      setBrands([])
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters])

  useEffect(() => {
    loadBrands()
  }, [loadBrands])

  return {
    brands,
    loading,
    error,
    refetch: loadBrands
  }
}

interface UseBrandActionsReturn {
  createBrand: (data: BrandCreateData) => Promise<void>
  updateBrand: (id: string, data: BrandCreateData) => Promise<void>
  deleteBrand: (id: string) => Promise<void>
  toggleBrandStatus: (id: string, currentStatus: boolean) => Promise<void>
  loading: boolean
  error: string
}

export function useBrandActions(onSuccess?: () => void): UseBrandActionsReturn {
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createBrand = async (data: BrandCreateData) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: createError } = await tenantDb.createBrand(data)
      
      if (createError) {
        throw new Error(createError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create brand'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateBrand = async (id: string, data: BrandCreateData) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: updateError } = await tenantDb.updateBrand(id, data)
      
      if (updateError) {
        throw new Error(updateError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update brand'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const deleteBrand = async (id: string) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: deleteError } = await tenantDb.deleteBrand(id)
      
      if (deleteError) {
        throw new Error(deleteError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete brand'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleBrandStatus = async (id: string, currentStatus: boolean) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const tenantDb = new TenantDatabase(tenant.id)
      const { error: updateError } = await tenantDb.updateBrand(id, { 
        is_active: !currentStatus 
      })
      
      if (updateError) {
        throw new Error(updateError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update brand status'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createBrand,
    updateBrand,
    deleteBrand,
    toggleBrandStatus,
    loading,
    error
  }
}
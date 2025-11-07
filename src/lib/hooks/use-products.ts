'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useTenant } from '@/lib/contexts/tenant-context'
import { TenantDatabase } from '@/lib/supabase/tenant-database'
import { 
  ProductWithVariants, 
  ProductFilters, 
  TenantSettings 
} from '@/lib/types/product'
import { parseProductVariants } from '@/lib/utils/product-utils'

interface UseProductsReturn {
  products: ProductWithVariants[]
  loading: boolean
  error: string
  refetch: () => Promise<void>
}

export function useProducts(filters: ProductFilters): UseProductsReturn {
  const { tenant } = useTenant()
  const [products, setProducts] = useState<ProductWithVariants[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  const loadProducts = useCallback(async () => {
    if (!tenant?.id) {
      setProducts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const tenantDb = new TenantDatabase(tenant.id)
      
      // Build filters for TenantDatabase
      const dbFilters: any = {}
      
      // Apply status filter
      if (filters.is_active !== undefined) {
        dbFilters.is_active = filters.is_active
      }
      
      // Apply search filter
      if (filters.search) {
        dbFilters.search = filters.search
      }
      
      const { data: productsData, error: dbError } = await tenantDb.getProducts(dbFilters)
      
      if (dbError) {
        throw new Error(dbError.message)
      }

      let filteredProducts = productsData || []
      
      // Apply product type filter client-side
      if (filters.productType && filters.productType !== 'all') {
        filteredProducts = filteredProducts.filter((product: any) => 
          product.product_type === filters.productType
        )
      }

      // Parse variants for each product
      const productsWithParsedVariants = filteredProducts.map((product: any) => ({
        ...product,
        parsed_variants: parseProductVariants(product.variants)
      }))

      setProducts(productsWithParsedVariants)
    } catch (err: any) {
      console.error('Error loading products:', err)
      setError(err.message || 'Failed to load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [tenant?.id, filters, supabase])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return {
    products,
    loading,
    error,
    refetch: loadProducts
  }
}

interface UseProductActionsReturn {
  deleteProduct: (productId: string) => Promise<void>
  toggleProductStatus: (productId: string, currentStatus: boolean) => Promise<void>
  loading: boolean
  error: string
}

export function useProductActions(onSuccess?: () => void): UseProductActionsReturn {
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  const deleteProduct = async (productId: string) => {
    if (!tenant?.id) throw new Error('No tenant available')
    if (!confirm('Are you sure you want to delete this product?')) return

    setLoading(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('tenant_id', tenant.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete product'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    if (!tenant?.id) throw new Error('No tenant available')

    setLoading(true)
    setError('')

    try {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId)
        .eq('tenant_id', tenant.id)

      if (updateError) {
        throw new Error(updateError.message)
      }

      onSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update product status'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteProduct,
    toggleProductStatus,
    loading,
    error
  }
}

interface UseTenantSettingsReturn {
  settings: TenantSettings
  loading: boolean
  error: string
}

export function useTenantSettings(): UseTenantSettingsReturn {
  const { tenant } = useTenant()
  const [settings, setSettings] = useState<TenantSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    const loadSettings = async () => {
      if (!tenant?.id) {
        setSettings({})
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const { data, error: dbError } = await supabase
          .from('tenants')
          .select('settings')
          .eq('id', tenant.id)
          .single()

        if (dbError) {
          throw new Error(dbError.message)
        }

        setSettings(data?.settings || {})
      } catch (err: any) {
        console.error('Error loading tenant settings:', err)
        setError(err.message || 'Failed to load settings')
        setSettings({})
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [tenant?.id, supabase])

  return {
    settings,
    loading,
    error
  }
}
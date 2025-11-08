/**
 * Centralized API Service
 * Handles all API calls to the backend routes
 */

// Types
export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  tenant_id: string
}

export interface ProductVariant {
  id: string
  title: string
  option1: string | null
  option2: string | null
  option3: string | null
  sku: string | null
  price: number | null
  compare_price: number | null
  inventory_quantity: number
  image_url: string | null
  is_active: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  short_description: string | null
  price: number
  compare_price: number | null
  category_id: string | null
  brand_id: string | null
  category?: {
    id: string
    name: string
    slug: string
  }
  brand?: {
    id: string
    name: string
    slug: string
  }
  images: any
  is_active: boolean
  is_featured: boolean
  inventory_quantity: number
  track_inventory: boolean
  product_type: 'single' | 'variable' | 'digital'
  variants?: ProductVariant[]
  tags: string[] | null
  created_at: string
  updated_at: string
  tenant_id: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface ProductsByCategoryResponse {
  category: {
    id: string
    name: string
    description: string | null
  }
  products: Product[]
}

export interface ProductBySlugResponse {
  product: Product
}

// API Service Class
export class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error) {
        return { data: null, error: result.error }
      }

      return { data: result.data || result, error: null }
    } catch (error) {
      console.error(`API Error for ${url}:`, error)
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get categories for a tenant
   */
  async getCategories(
    tenantId: string,
    filters: {
      is_active?: boolean
      limit?: number
    } = {}
  ): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams({ tenant_id: tenantId })

    if (filters.is_active !== undefined) {
      params.append('is_active', filters.is_active.toString())
    }

    if (filters.limit) {
      params.append('limit', filters.limit.toString())
    }

    return this.fetchWithErrorHandling<Category[]>(`${this.baseUrl}/api/categories?${params.toString()}`)
  }

  /**
   * Get navigation categories (limited for menu display)
   */
  async getNavigationCategories(
    tenantId: string,
    limit: number = 3
  ): Promise<ApiResponse<Category[]>> {
    const result = await this.getCategories(tenantId, { is_active: true, limit })
    
    if (result.data) {
      // Additional filtering and sorting for navigation
      const navigationCategories = result.data
        .filter(cat => cat.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .slice(0, limit)
      
      return { data: navigationCategories, error: null }
    }

    return result
  }

  /**
   * Get products for a tenant
   */
  async getProducts(
    tenantId: string,
    filters: {
      category_id?: string
      brand_slug?: string
      is_active?: boolean
      is_featured?: boolean
      search?: string
      sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
      limit?: number
      offset?: number
    } = {}
  ): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({ tenant_id: tenantId })

    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return this.fetchWithErrorHandling<Product[]>(`${this.baseUrl}/api/products?${params.toString()}`)
  }

  /**
   * Get products by category slug
   */
  async getProductsByCategory(
    tenantId: string,
    categorySlug: string,
    filters: {
      is_active?: boolean
      is_featured?: boolean
      search?: string
      sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
      limit?: number
      offset?: number
    } = {}
  ): Promise<ApiResponse<ProductsByCategoryResponse>> {
    const params = new URLSearchParams({ tenant_id: tenantId })

    // Add filters to query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString())
      }
    })

    return this.fetchWithErrorHandling<ProductsByCategoryResponse>(
      `${this.baseUrl}/api/products/category/${categorySlug}?${params.toString()}`
    )
  }

  /**
   * Get a single product by slug
   */
  async getProductBySlug(
    tenantId: string,
    slug: string
  ): Promise<ApiResponse<ProductBySlugResponse>> {
    const params = new URLSearchParams({ tenant_id: tenantId })

    return this.fetchWithErrorHandling<ProductBySlugResponse>(
      `${this.baseUrl}/api/products/${slug}?${params.toString()}`
    )
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(
    tenantId: string,
    limit: number = 8
  ): Promise<ApiResponse<Product[]>> {
    return this.getProducts(tenantId, {
      is_active: true,
      is_featured: true,
      sort_by: 'newest',
      limit
    })
  }

  /**
   * Search products
   */
  async searchProducts(
    tenantId: string,
    query: string,
    filters: {
      category_id?: string
      brand_slug?: string
      is_active?: boolean
      is_featured?: boolean
      sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
      limit?: number
      offset?: number
    } = {}
  ): Promise<ApiResponse<Product[]>> {
    return this.getProducts(tenantId, {
      ...filters,
      search: query,
      is_active: true
    })
  }
}

// Create and export a default instance
export const apiService = new ApiService()

// Export convenience functions for easier usage
export const getCategories = (
  tenantId: string, 
  filters: {
    is_active?: boolean
    limit?: number
  } = {}
): Promise<ApiResponse<Category[]>> => apiService.getCategories(tenantId, filters)

export const getNavigationCategories = (
  tenantId: string, 
  limit: number = 3
): Promise<ApiResponse<Category[]>> => apiService.getNavigationCategories(tenantId, limit)

export const getProducts = (
  tenantId: string, 
  filters: {
    category_id?: string
    is_active?: boolean
    is_featured?: boolean
    search?: string
    sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
    limit?: number
    offset?: number
  } = {}
): Promise<ApiResponse<Product[]>> => apiService.getProducts(tenantId, filters)

export const getProductsByCategory = (
  tenantId: string, 
  categorySlug: string, 
  filters: {
    is_active?: boolean
    is_featured?: boolean
    search?: string
    sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
    limit?: number
    offset?: number
  } = {}
): Promise<ApiResponse<ProductsByCategoryResponse>> => apiService.getProductsByCategory(tenantId, categorySlug, filters)

export const getProductBySlug = (
  tenantId: string, 
  slug: string
): Promise<ApiResponse<ProductBySlugResponse>> => apiService.getProductBySlug(tenantId, slug)

export const getFeaturedProducts = (
  tenantId: string, 
  limit: number = 8
): Promise<ApiResponse<Product[]>> => apiService.getFeaturedProducts(tenantId, limit)

export const searchProducts = (
  tenantId: string, 
  query: string, 
  filters: {
    category_id?: string
    is_active?: boolean
    is_featured?: boolean
    sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
    limit?: number
    offset?: number
  } = {}
): Promise<ApiResponse<Product[]>> => apiService.searchProducts(tenantId, query, filters)
export type ProductType = 'single' | 'variable' | 'digital'

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  product_type: ProductType
  inventory_quantity: number
  track_inventory: boolean
  is_active: boolean
  is_featured: boolean
  category_id: string
  sku: string | null
  variants: any // Will be typed more specifically later
  created_at: string
  updated_at: string
  tenant_id: string
}

export interface ProductVariant {
  id: string
  title: string
  attributes: Array<{ name: string; value: string }>
  sku: string
  price: string
  compare_price: string
  cost_price: string
  stock_quantity: string
  weight: string
  is_active: boolean
}

export interface ProductWithVariants extends Product {
  parsed_variants?: ProductVariant[]
}

export interface ProductFilters {
  status: 'all' | 'active' | 'inactive'
  productType: 'all' | 'single' | 'variable' | 'digital'
  search: string
  is_active?: boolean
  product_type?: ProductType
}

export interface ProductStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  outOfStock: number
}

export interface TenantSettings {
  low_stock_threshold?: number
  currency?: string
  currency_symbol?: string
}

export const defaultProductFilters: ProductFilters = {
  status: 'all',
  productType: 'all',
  search: ''
}

export const productTypeOptions = [
  { value: 'all', label: 'All Types', icon: '📦' },
  { value: 'single', label: 'Single', icon: '📦' },
  { value: 'variable', label: 'Variable', icon: '🔀' },
  { value: 'digital', label: 'Digital', icon: '💾' }
] as const

export const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
] as const
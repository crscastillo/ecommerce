export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface BrandFormData {
  name: string
  slug: string
  description: string
  logo_url: string
  website_url: string
  sort_order: string
  is_active: boolean
  seo_title: string
  seo_description: string
}

export interface BrandCreateData {
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  website_url: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
}

export interface BrandFilters {
  status: 'all' | 'active' | 'inactive'
  search: string
  is_active?: boolean
}

export interface BrandWithProductCount extends Brand {
  product_count?: number
}

export const defaultBrandFormData: BrandFormData = {
  name: '',
  slug: '',
  description: '',
  logo_url: '',
  website_url: '',
  sort_order: '0',
  is_active: true,
  seo_title: '',
  seo_description: ''
}

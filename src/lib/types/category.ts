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
}

export interface CategoryFormData {
  name: string
  slug: string
  description: string
  image_url: string
  parent_id: string
  sort_order: string
  is_active: boolean
  seo_title: string
  seo_description: string
}

export interface CategoryCreateData {
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
}

export interface CategoryFilters {
  status: 'all' | 'active' | 'inactive'
  search: string
  is_active?: boolean
}

export interface CategoryWithProductCount extends Category {
  product_count?: number
}

export const defaultCategoryFormData: CategoryFormData = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  parent_id: '',
  sort_order: '0',
  is_active: true,
  seo_title: '',
  seo_description: ''
}
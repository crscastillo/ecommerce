import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'

// Tenant-aware database operations
export class TenantDatabase {
  private supabase: any
  private tenantId: string

  constructor(tenantId: string) {
    this.supabase = createClient()
    this.tenantId = tenantId
  }

  // Products
  async getProducts(filters: {
    category_id?: string
    is_active?: boolean
    is_featured?: boolean
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('tenant_id', this.tenantId)

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query
  }

  async getProduct(id: string) {
    return this.supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async getProductBySlug(slug: string) {
    return this.supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        variants:product_variants(*)
      `)
      .eq('slug', slug)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async createProduct(productData: any) {
    return this.supabase
      .from('products')
      .insert({
        ...productData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateProduct(id: string, productData: any) {
    return this.supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async deleteProduct(id: string) {
    return this.supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Categories
  async getCategories(filters: { is_active?: boolean } = {}) {
    let query = this.supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('sort_order', { ascending: true })

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    return query
  }

  async getCategory(id: string) {
    return this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async getCategoryBySlug(slug: string) {
    return this.supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async createCategory(categoryData: any) {
    return this.supabase
      .from('categories')
      .insert({
        ...categoryData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateCategory(id: string, categoryData: any) {
    return this.supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async deleteCategory(id: string) {
    return this.supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Orders
  async getOrders(filters: {
    customer_id?: string
    financial_status?: string
    fulfillment_status?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, email, first_name, last_name),
        order_items:order_line_items(*)
      `)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false })

    if (filters.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }
    if (filters.financial_status) {
      query = query.eq('financial_status', filters.financial_status)
    }
    if (filters.fulfillment_status) {
      query = query.eq('fulfillment_status', filters.fulfillment_status)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query
  }

  async getOrder(id: string) {
    return this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(id, email, first_name, last_name),
        order_items:order_line_items(*)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async createOrder(orderData: any) {
    return this.supabase
      .from('orders')
      .insert({
        ...orderData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateOrder(id: string, orderData: any) {
    return this.supabase
      .from('orders')
      .update(orderData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  // Customers
  async getCustomers(filters: {
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('customers')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false })

    if (filters.search) {
      query = query.or(`email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return query
  }

  async getCustomer(id: string) {
    return this.supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async getCustomerByEmail(email: string) {
    return this.supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async createCustomer(customerData: any) {
    return this.supabase
      .from('customers')
      .insert({
        ...customerData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateCustomer(id: string, customerData: any) {
    return this.supabase
      .from('customers')
      .update(customerData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  // Cart operations
  async getCartItems(userId: string) {
    return this.supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('tenant_id', this.tenantId)
      .eq('user_id', userId)
  }

  async addToCart(userId: string, productId: string, variantId?: string, quantity: number = 1) {
    return this.supabase
      .from('cart_items')
      .upsert({
        tenant_id: this.tenantId,
        user_id: userId,
        product_id: productId,
        product_variant_id: variantId,
        quantity
      })
      .select()
      .single()
  }

  async updateCartItem(id: string, quantity: number) {
    return this.supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async removeFromCart(id: string) {
    return this.supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  async clearCart(userId: string) {
    return this.supabase
      .from('cart_items')
      .delete()
      .eq('tenant_id', this.tenantId)
      .eq('user_id', userId)
  }
}
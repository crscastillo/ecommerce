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
      .order('created_at', { ascending: false })

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

    return await query
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

    return await query
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

    return await query
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

    return await query
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

  // Product Variants
  async getProductVariants(productId: string) {
    return this.supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .order('title', { ascending: true })
  }

  async getProductVariant(id: string) {
    return this.supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async createProductVariant(variantData: any) {
    return this.supabase
      .from('product_variants')
      .insert({
        ...variantData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateProductVariant(id: string, variantData: any) {
    return this.supabase
      .from('product_variants')
      .update(variantData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async deleteProductVariant(id: string) {
    return this.supabase
      .from('product_variants')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Order Line Items
  async getOrderLineItems(orderId: string) {
    return this.supabase
      .from('order_line_items')
      .select(`
        *,
        product:products(id, name, slug),
        variant:product_variants(id, title, sku)
      `)
      .eq('order_id', orderId)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: true })
  }

  async createOrderLineItem(lineItemData: any) {
    return this.supabase
      .from('order_line_items')
      .insert({
        ...lineItemData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateOrderLineItem(id: string, lineItemData: any) {
    return this.supabase
      .from('order_line_items')
      .update(lineItemData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async deleteOrderLineItem(id: string) {
    return this.supabase
      .from('order_line_items')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Discounts
  async getDiscounts(filters: {
    is_active?: boolean
    type?: string
    search?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('discounts')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false })

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.search) {
      query = query.or(`code.ilike.%${filters.search}%,title.ilike.%${filters.search}%`)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return await query
  }

  async getDiscount(id: string) {
    return this.supabase
      .from('discounts')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async getDiscountByCode(code: string) {
    return this.supabase
      .from('discounts')
      .select('*')
      .eq('code', code)
      .eq('tenant_id', this.tenantId)
      .eq('is_active', true)
      .single()
  }

  async createDiscount(discountData: any) {
    return this.supabase
      .from('discounts')
      .insert({
        ...discountData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateDiscount(id: string, discountData: any) {
    return this.supabase
      .from('discounts')
      .update(discountData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async deleteDiscount(id: string) {
    return this.supabase
      .from('discounts')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Tenant Users (for team management)
  async getTenantUsers(filters: {
    is_active?: boolean
    role?: string
    limit?: number
    offset?: number
  } = {}) {
    let query = this.supabase
      .from('tenant_users')
      .select(`
        *,
        user:auth.users(id, email),
        invited_by_user:auth.users!invited_by(id, email)
      `)
      .eq('tenant_id', this.tenantId)
      .order('created_at', { ascending: false })

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.role) {
      query = query.eq('role', filters.role)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    return await query
  }

  async getTenantUser(id: string) {
    return this.supabase
      .from('tenant_users')
      .select(`
        *,
        user:auth.users(id, email),
        invited_by_user:auth.users!invited_by(id, email)
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async getTenantUserByUserId(userId: string) {
    return this.supabase
      .from('tenant_users')
      .select('*')
      .eq('user_id', userId)
      .eq('tenant_id', this.tenantId)
      .single()
  }

  async inviteTenantUser(userData: any) {
    return this.supabase
      .from('tenant_users')
      .insert({
        ...userData,
        tenant_id: this.tenantId
      })
      .select()
      .single()
  }

  async updateTenantUser(id: string, userData: any) {
    return this.supabase
      .from('tenant_users')
      .update(userData)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .select()
      .single()
  }

  async removeTenantUser(id: string) {
    return this.supabase
      .from('tenant_users')
      .delete()
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
  }

  // Tenant Settings
  async getTenant() {
    return this.supabase
      .from('tenants')
      .select('*')
      .eq('id', this.tenantId)
      .single()
  }

  async getTenantSettings() {
    const { data: tenant } = await this.supabase
      .from('tenants')
      .select('settings')
      .eq('id', this.tenantId)
      .single()
    
    return tenant?.settings || {}
  }

  async updateTenantSettings(settings: any) {
    return this.supabase
      .from('tenants')
      .update({ settings })
      .eq('id', this.tenantId)
      .select()
      .single()
  }

  // Low Stock Helpers
  async getLowStockThreshold(): Promise<number> {
    const settings = await this.getTenantSettings()
    return settings.low_stock_threshold || 5
  }

  async isProductLowStock(product: { inventory_quantity: number, track_inventory: boolean }): Promise<boolean> {
    if (!product.track_inventory) {
      return false
    }
    
    const threshold = await this.getLowStockThreshold()
    return product.inventory_quantity < threshold
  }

  async getLowStockProducts(limit: number = 50) {
    const threshold = await this.getLowStockThreshold()
    
    return await this.supabase
      .from('products')
      .select('*')
      .eq('tenant_id', this.tenantId)
      .eq('track_inventory', true)
      .eq('is_active', true)
      .lt('inventory_quantity', threshold)
      .order('inventory_quantity', { ascending: true })
      .limit(limit)
  }

  // Client-side API methods (for use in client components)
  // These methods use fetch to call the API routes instead of direct Supabase queries

  /**
   * Client-side method to get categories via Supabase client
   */
  async getCategoriesAPI(filters: { is_active?: boolean; limit?: number } = {}) {
    try {
      let query = this.supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('sort_order', { ascending: true })

      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching categories:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Client-side method to get navigation categories (active categories limited for menu)
   */
  async getNavigationCategories(limit: number = 3) {
    const result = await this.getCategoriesAPI({ is_active: true, limit })
    
    if (result.data) {
      // Additional filtering and sorting for navigation
      const navigationCategories = result.data
        .filter((cat: any) => cat.is_active)
        .sort((a: any, b: any) => a.sort_order - b.sort_order)
        .slice(0, limit)
      
      return { data: navigationCategories, error: null }
    }

    return result
  }

  /**
   * Client-side method to get products via Supabase client
   */
  async getProductsAPI(filters: {
    category_id?: string
    is_active?: boolean
    is_featured?: boolean
    search?: string
    sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
    limit?: number
    offset?: number
  } = {}) {
    try {
      let query = this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          category_id,
          category:categories(
            id,
            name,
            slug
          ),
          images,
          is_active,
          is_featured,
          inventory_quantity,
          track_inventory,
          tags,
          created_at
        `)
        .eq('tenant_id', this.tenantId)

      // Apply filters
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
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data, error } = await query

      if (error) {
        return { data: null, error: error.message }
      }

      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching products:', error)
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Client-side method to get products by category via Supabase client
   */
  async getProductsByCategoryAPI(
    categorySlug: string,
    filters: {
      is_active?: boolean
      is_featured?: boolean
      search?: string
      sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
      limit?: number
      offset?: number
    } = {}
  ) {
    try {
      // First get the category to find the category_id
      const { data: category, error: categoryError } = await this.supabase
        .from('categories')
        .select('id, name, description')
        .eq('slug', categorySlug)
        .eq('tenant_id', this.tenantId)
        .single()

      if (categoryError || !category) {
        return { 
          category: null, 
          products: [], 
          error: categoryError?.message || 'Category not found' 
        }
      }

      // Now get products for this category
      let query = this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          category_id,
          images,
          is_active,
          is_featured,
          inventory_quantity,
          track_inventory,
          tags,
          created_at
        `)
        .eq('tenant_id', this.tenantId)
        .eq('category_id', category.id)

      // Apply filters
      if (filters.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`)
      }

      // Apply sorting
      switch (filters.sort_by) {
        case 'price-low':
          query = query.order('price', { ascending: true })
          break
        case 'price-high':
          query = query.order('price', { ascending: false })
          break
        case 'name':
          query = query.order('name', { ascending: true })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
          break
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
      }

      const { data: products, error: productsError } = await query

      if (productsError) {
        return { category, products: [], error: productsError.message }
      }

      return { 
        category,
        products: products || [], 
        error: null 
      }
    } catch (error) {
      console.error('Error fetching products by category:', error)
      return { 
        category: null, 
        products: [], 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Client-side method to get a single product by slug via Supabase client
   */
  async getProductBySlugAPI(slug: string) {
    try {
      const { data: product, error } = await this.supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          description,
          short_description,
          price,
          compare_price,
          category_id,
          category:categories(
            id,
            name,
            slug
          ),
          images,
          is_active,
          is_featured,
          inventory_quantity,
          track_inventory,
          tags,
          created_at,
          updated_at
        `)
        .eq('slug', slug)
        .eq('tenant_id', this.tenantId)
        .single()

      if (error) {
        return { 
          data: null, 
          product: null, 
          error: error.message 
        }
      }

      return { 
        data: product, 
        product: product, 
        error: null 
      }
    } catch (error) {
      console.error('Error fetching product by slug:', error)
      return { 
        data: null, 
        product: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Client-side method to get featured products
   */
  async getFeaturedProductsAPI(limit: number = 8) {
    return this.getProductsAPI({
      is_active: true,
      is_featured: true,
      sort_by: 'newest',
      limit
    })
  }

  /**
   * Client-side method to search products
   */
  async searchProductsAPI(
    query: string,
    filters: {
      category_id?: string
      is_active?: boolean
      is_featured?: boolean
      sort_by?: 'newest' | 'price-low' | 'price-high' | 'name'
      limit?: number
      offset?: number
    } = {}
  ) {
    return this.getProductsAPI({
      ...filters,
      search: query,
      is_active: true
    })
  }
}
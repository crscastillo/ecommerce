export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          subdomain: string
          domain: string | null
          description: string | null
          logo_url: string | null
          theme_config: Json
          contact_email: string | null
          contact_phone: string | null
          address: Json | null
          settings: Json
          subscription_tier: string
          is_active: boolean
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subdomain: string
          domain?: string | null
          description?: string | null
          logo_url?: string | null
          theme_config?: Json
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          settings?: Json
          subscription_tier?: string
          is_active?: boolean
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subdomain?: string
          domain?: string | null
          description?: string | null
          logo_url?: string | null
          theme_config?: Json
          contact_email?: string | null
          contact_phone?: string | null
          address?: Json | null
          settings?: Json
          subscription_tier?: string
          is_active?: boolean
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          tenant_id: string
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
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          sku: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          track_inventory: boolean
          inventory_quantity: number
          allow_backorder: boolean
          weight: number | null
          dimensions: Json | null
          category_id: string | null
          tags: string[] | null
          images: Json
          variants: Json
          seo_title: string | null
          seo_description: string | null
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          track_inventory?: boolean
          inventory_quantity?: number
          allow_backorder?: boolean
          weight?: number | null
          dimensions?: Json | null
          category_id?: string | null
          tags?: string[] | null
          images?: Json
          variants?: Json
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          sku?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          track_inventory?: boolean
          inventory_quantity?: number
          allow_backorder?: boolean
          weight?: number | null
          dimensions?: Json | null
          category_id?: string | null
          tags?: string[] | null
          images?: Json
          variants?: Json
          seo_title?: string | null
          seo_description?: string | null
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          accepts_marketing: boolean
          addresses: Json
          tags: string[] | null
          notes: string | null
          total_spent: number
          orders_count: number
          last_order_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          accepts_marketing?: boolean
          addresses?: Json
          tags?: string[] | null
          notes?: string | null
          total_spent?: number
          orders_count?: number
          last_order_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          accepts_marketing?: boolean
          addresses?: Json
          tags?: string[] | null
          notes?: string | null
          total_spent?: number
          orders_count?: number
          last_order_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string | null
          order_number: string
          email: string
          phone: string | null
          currency: string
          subtotal_price: number
          total_tax: number
          total_discounts: number
          shipping_price: number
          total_price: number
          financial_status: string
          fulfillment_status: string
          billing_address: Json | null
          shipping_address: Json | null
          notes: string | null
          tags: string[] | null
          cancelled_at: string | null
          cancel_reason: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          customer_id?: string | null
          order_number: string
          email: string
          phone?: string | null
          currency?: string
          subtotal_price: number
          total_tax?: number
          total_discounts?: number
          shipping_price?: number
          total_price: number
          financial_status?: string
          fulfillment_status?: string
          billing_address?: Json | null
          shipping_address?: Json | null
          notes?: string | null
          tags?: string[] | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          customer_id?: string | null
          order_number?: string
          email?: string
          phone?: string | null
          currency?: string
          subtotal_price?: number
          total_tax?: number
          total_discounts?: number
          shipping_price?: number
          total_price?: number
          financial_status?: string
          fulfillment_status?: string
          billing_address?: Json | null
          shipping_address?: Json | null
          notes?: string | null
          tags?: string[] | null
          cancelled_at?: string | null
          cancel_reason?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          session_id: string | null
          product_id: string
          product_variant_id: string | null
          quantity: number
          properties: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          session_id?: string | null
          product_id: string
          product_variant_id?: string | null
          quantity?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          session_id?: string | null
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
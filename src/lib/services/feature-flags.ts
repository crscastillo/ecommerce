import { createClient } from '@/lib/supabase/client'

export interface FeatureFlag {
  id: string
  feature_key: string
  feature_name: string
  feature_description: string | null
  enabled: boolean
  category: string
  created_at: string
  updated_at: string
}

export interface PaymentMethodFlags {
  cash_on_delivery: boolean
  stripe: boolean
  tilopay: boolean
  bank_transfer: boolean
  mobile_bank_transfer: boolean
}

export class FeatureFlagsService {
  /**
   * Get all feature flags
   */
  static async getAllFeatureFlags(): Promise<FeatureFlag[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('*')
      .order('category', { ascending: true })
      .order('feature_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching feature flags:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get feature flags by category
   */
  static async getFeatureFlagsByCategory(category: string): Promise<FeatureFlag[]> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('*')
      .eq('category', category)
      .order('feature_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching feature flags by category:', error)
      throw error
    }
    
    return data || []
  }

  /**
   * Get enabled payment methods
   */
  static async getEnabledPaymentMethods(): Promise<PaymentMethodFlags> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, enabled')
      .eq('category', 'payment_methods')
    
    if (error) {
      console.error('Error fetching payment method flags:', error)
      // Return all enabled as fallback
      return {
        cash_on_delivery: true,
        stripe: true,
        tilopay: true,
        bank_transfer: true,
        mobile_bank_transfer: true
      }
    }
    
    const flags: PaymentMethodFlags = {
      cash_on_delivery: false,
      stripe: false,
      tilopay: false,
      bank_transfer: false,
      mobile_bank_transfer: false
    }
    
    data?.forEach(flag => {
      switch (flag.feature_key) {
        case 'payment_method_cash_on_delivery':
          flags.cash_on_delivery = flag.enabled
          break
        case 'payment_method_stripe':
          flags.stripe = flag.enabled
          break
        case 'payment_method_tilopay':
          flags.tilopay = flag.enabled
          break
        case 'payment_method_bank_transfer':
          flags.bank_transfer = flag.enabled
          break
        case 'payment_method_mobile_bank_transfer':
          flags.mobile_bank_transfer = flag.enabled
          break
      }
    })
    
    return flags
  }

  /**
   * Check if a specific feature is enabled
   */
  static async isFeatureEnabled(featureKey: string): Promise<boolean> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('enabled')
      .eq('feature_key', featureKey)
      .single()
    
    if (error) {
      console.error(`Error checking feature flag ${featureKey}:`, error)
      return false
    }
    
    return data?.enabled || false
  }

  /**
   * Update a feature flag (platform admin only)
   */
  static async updateFeatureFlag(id: string, enabled: boolean): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('platform_feature_flags')
      .update({ enabled })
      .eq('id', id)
    
    if (error) {
      console.error('Error updating feature flag:', error)
      throw error
    }
  }

  /**
   * Bulk update feature flags
   */
  static async bulkUpdateFeatureFlags(updates: { id: string; enabled: boolean }[]): Promise<void> {
    const supabase = createClient()
    
    const promises = updates.map(update =>
      supabase
        .from('platform_feature_flags')
        .update({ enabled: update.enabled })
        .eq('id', update.id)
    )
    
    const results = await Promise.all(promises)
    const errors = results.filter(r => r.error)
    
    if (errors.length > 0) {
      console.error('Error updating feature flags:', errors)
      throw new Error('Failed to update some feature flags')
    }
  }
}

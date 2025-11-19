import { createClient } from '@/lib/supabase/client'

export interface FeatureFlag {
  id: string
  feature_key: string
  feature_name: string
  feature_description: string | null
  enabled: boolean
  category: string
  target_tiers: string[]
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

export interface SecurityFeatureFlags {
  mfa_sms_enabled: boolean
  mfa_authenticator_enabled: boolean
  advanced_session_management: boolean
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
    
    return (data || []).map(flag => ({
      ...flag,
      target_tiers: flag.target_tiers || ['basic', 'pro', 'enterprise']
    }))
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
    
    return (data || []).map(flag => ({
      ...flag,
      target_tiers: flag.target_tiers || ['basic', 'pro', 'enterprise']
    }))
  }

  /**
   * Get enabled payment methods for a specific tier
   */
  static async getEnabledPaymentMethodsForTier(tier: 'basic' | 'pro' | 'enterprise'): Promise<PaymentMethodFlags> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, enabled, target_tiers')
      .eq('category', 'payment_methods')
    
    if (error) {
      console.error('Error fetching payment method flags:', error)
      // Return all disabled as fallback for tier-specific
      return {
        cash_on_delivery: false,
        stripe: false,
        tilopay: false,
        bank_transfer: false,
        mobile_bank_transfer: false
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
      // Check if the flag is enabled AND the tier has access
      const tierHasAccess = flag.target_tiers ? flag.target_tiers.includes(tier) : true
      const isEnabled = flag.enabled && tierHasAccess
      
      switch (flag.feature_key) {
        case 'payment_method_cash_on_delivery':
          flags.cash_on_delivery = isEnabled
          break
        case 'payment_method_stripe':
          flags.stripe = isEnabled
          break
        case 'payment_method_tilopay':
          flags.tilopay = isEnabled
          break
        case 'payment_method_bank_transfer':
          flags.bank_transfer = isEnabled
          break
        case 'payment_method_mobile_bank_transfer':
          flags.mobile_bank_transfer = isEnabled
          break
      }
    })
    
    return flags
  }

  /**
   * Get enabled payment methods (for all tiers - backward compatibility)
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
   * Check if a specific feature is enabled for a specific tier
   */
  static async isFeatureEnabledForTier(featureKey: string, tier: 'basic' | 'pro' | 'enterprise'): Promise<boolean> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('enabled, target_tiers')
      .eq('feature_key', featureKey)
      .single()
    
    if (error) {
      console.error(`Error checking feature flag ${featureKey}:`, error)
      return false
    }
    
    if (!data?.enabled) return false
    
    // Check if tier has access
    const tierHasAccess = data.target_tiers ? data.target_tiers.includes(tier) : true
    return tierHasAccess
  }

  /**
   * Check if a specific feature is enabled (for any tier - backward compatibility)
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
   * Update feature flag with full details including tiers
   */
  static async updateFeatureFlagDetails(id: string, updates: {
    feature_name?: string
    feature_description?: string
    enabled?: boolean
    target_tiers?: string[]
  }): Promise<void> {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('platform_feature_flags')
      .update(updates)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating feature flag details:', error)
      throw error
    }
  }

  /**
   * Get enabled security features for a specific tier
   */
  static async getEnabledSecurityFeaturesForTier(tier: 'basic' | 'pro' | 'enterprise'): Promise<SecurityFeatureFlags> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, enabled, target_tiers')
      .eq('category', 'security')
    
    if (error) {
      console.error('Error fetching security feature flags:', error)
      // Return all disabled as fallback
      return {
        mfa_sms_enabled: false,
        mfa_authenticator_enabled: false,
        advanced_session_management: false
      }
    }
    
    const flags: SecurityFeatureFlags = {
      mfa_sms_enabled: false,
      mfa_authenticator_enabled: false,
      advanced_session_management: false
    }
    
    data?.forEach(flag => {
      // Check if the flag is enabled AND the tier has access
      const tierHasAccess = flag.target_tiers ? flag.target_tiers.includes(tier) : true
      const isEnabled = flag.enabled && tierHasAccess
      
      switch (flag.feature_key) {
        case 'mfa_sms_enabled':
          flags.mfa_sms_enabled = isEnabled
          break
        case 'mfa_authenticator_enabled':
          flags.mfa_authenticator_enabled = isEnabled
          break
        case 'advanced_session_management':
          flags.advanced_session_management = isEnabled
          break
      }
    })
    
    return flags
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

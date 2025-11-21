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

export interface PluginFeatureFlags {
  plugin_google_analytics: boolean
  plugin_facebook_pixel: boolean
  plugin_mailchimp: boolean
  plugin_whatsapp: boolean
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
        stripe: false,
        tilopay: false,
        bank_transfer: false,
        mobile_bank_transfer: false
      }
    }
    
    const flags: PaymentMethodFlags = {
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
        stripe: true,
        tilopay: true,
        bank_transfer: true,
        mobile_bank_transfer: true
      }
    }
    
    const flags: PaymentMethodFlags = {
      stripe: false,
      tilopay: false,
      bank_transfer: false,
      mobile_bank_transfer: false
    }
    
    data?.forEach(flag => {
      switch (flag.feature_key) {
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
   * Get enabled plugin features for a specific tier
   */
  static async getEnabledPluginFeaturesForTier(tier: 'basic' | 'pro' | 'enterprise'): Promise<PluginFeatureFlags> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, enabled, target_tiers')
      .eq('category', 'plugins')
    
    if (error) {
      console.error('Error fetching plugin feature flags:', error)
      // Return all disabled as fallback
      return {
        plugin_google_analytics: false,
        plugin_facebook_pixel: false,
        plugin_mailchimp: false,
        plugin_whatsapp: false
      }
    }
    
    const flags: PluginFeatureFlags = {
      plugin_google_analytics: false,
      plugin_facebook_pixel: false,
      plugin_mailchimp: false,
      plugin_whatsapp: false
    }
    
    data?.forEach(flag => {
      // Check if the flag is enabled AND the tier has access
      const tierHasAccess = flag.target_tiers ? flag.target_tiers.includes(tier) : true
      const isEnabled = flag.enabled && tierHasAccess
      
      switch (flag.feature_key) {
        case 'plugin_google_analytics':
          flags.plugin_google_analytics = isEnabled
          break
        case 'plugin_facebook_pixel':
          flags.plugin_facebook_pixel = isEnabled
          break
        case 'plugin_mailchimp':
          flags.plugin_mailchimp = isEnabled
          break
        case 'plugin_whatsapp':
          flags.plugin_whatsapp = isEnabled
          break
      }
    })
    
    return flags
  }

  /**
   * Get available payment method configurations from feature flags
   */
  static async getPaymentMethodConfigurations(tier: 'basic' | 'pro' | 'enterprise'): Promise<Array<{
    id: string
    name: string
    enabled: boolean
    requiresKeys: boolean
    keys?: {
      publishableKey?: string
      secretKey?: string
      webhookSecret?: string
    }
    testMode?: boolean
    metadata?: Record<string, any>
    bankDetails?: {
      bankName?: string
      accountNumber?: string
      accountHolder?: string
      instructions?: string
    }
  }>> {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, feature_name, feature_description, enabled, target_tiers')
      .eq('category', 'payment_methods')
      .order('feature_name', { ascending: true })
    
    if (error) {
      console.error('Error fetching payment method configurations:', error)
      return []
    }
    
    const configurations = data?.map(flag => {
      // Check if the flag is available for this tier
      const tierHasAccess = flag.target_tiers ? flag.target_tiers.includes(tier) : true
      
      // Don't include payment methods that aren't available for this tier
      if (!tierHasAccess) return null
      
      // Map feature keys to payment method configurations
      const baseConfig = {
        enabled: false, // User hasn't configured it yet
        testMode: true
      }
      
      switch (flag.feature_key) {
        case 'payment_method_stripe':
          return {
            id: 'stripe',
            name: flag.feature_name,
            ...baseConfig,
            requiresKeys: true,
            keys: {
              publishableKey: '',
              secretKey: '',
              webhookSecret: ''
            }
          }
        case 'payment_method_tilopay':
          return {
            id: 'tilopay',
            name: flag.feature_name,
            ...baseConfig,
            requiresKeys: true,
            keys: {
              publishableKey: '',
              secretKey: '',
              webhookSecret: ''
            },
            metadata: {
              description: 'TiloPay payment gateway for Costa Rica',
              supportedCountries: ['CR'],
              supportedCurrencies: ['CRC', 'USD']
            }
          }
        case 'payment_method_paypal':
          return {
            id: 'paypal',
            name: flag.feature_name,
            ...baseConfig,
            requiresKeys: true,
            keys: {
              publishableKey: '',
              secretKey: ''
            }
          }
        case 'payment_method_bank_transfer':
          return {
            id: 'bank_transfer',
            name: flag.feature_name,
            ...baseConfig,
            requiresKeys: false,
            bankDetails: {
              bankName: '',
              accountNumber: '',
              accountHolder: '',
              instructions: ''
            }
          }
        case 'payment_method_mobile_bank_transfer':
          return {
            id: 'mobile_bank_transfer',
            name: flag.feature_name,
            ...baseConfig,
            requiresKeys: false,
            bankDetails: {
              phoneNumber: '',
              instructions: ''
            }
          }
        default:
          return null
      }
    }).filter(Boolean) || []
    
    return configurations as any[]
  }

  /**
   * Get feature flags for a specific tenant based on their tier
   */
  static async getFeatureFlags(tenantId: string): Promise<Record<string, boolean>> {
    const supabase = createClient()
    
    // Get tenant tier
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('subscription_tier')
      .eq('id', tenantId)
      .single()
    
    if (tenantError) {
      console.error('Error fetching tenant:', tenantError)
      return { analytics: false }
    }
    
    const tier = tenant?.subscription_tier || 'basic'
    
    // Get all feature flags
    const { data: flags, error } = await supabase
      .from('platform_feature_flags')
      .select('feature_key, enabled, target_tiers')
    
    if (error) {
      console.error('Error fetching feature flags:', error)
      return { analytics: false }
    }
    
    const result: Record<string, boolean> = {}
    
    flags?.forEach(flag => {
      // Check if the flag is enabled AND the tier has access
      const tierHasAccess = flag.target_tiers ? flag.target_tiers.includes(tier) : true
      const isEnabled = flag.enabled && tierHasAccess
      
      // Map feature keys to simple names
      switch (flag.feature_key) {
        case 'analytics_dashboard':
          result.analytics = isEnabled
          break
        // Add more feature mappings as needed
      }
    })
    
    return result
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

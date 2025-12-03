// Payment methods configuration service
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface PaymentMethodConfig {
  id: string
  name: string
  enabled: boolean
  requiresKeys: boolean
  keys?: {
    publishableKey?: string
    secretKey?: string
    webhookSecret?: string
  }
  metadata?: Record<string, any>
}

export interface TenantPaymentSettings {
  tenant_id: string
  payment_methods: PaymentMethodConfig[]
  updated_at: string
}

export class PaymentMethodsService {
  static async getPaymentMethodsConfig(tenantId: string, tier: 'basic' | 'pro' | 'enterprise' = 'pro'): Promise<PaymentMethodConfig[]> {
    try {
      // ALWAYS start with feature flag configurations - they determine what's available
      const availableConfigs = await this.getDefaultPaymentMethods(tier)
      
      if (availableConfigs.length === 0) {
        return []
      }

      // Then try to get saved tenant-specific settings
      const response = await fetch(`/api/payment-settings?tenant_id=${tenantId}`)
      
      if (!response.ok) {
        return availableConfigs
      }

      const result = await response.json()
      
      if (result.data?.payment_methods) {
        const availableIds = availableConfigs.map(config => config.id)
        
        // Only include saved methods that are still available according to feature flags
        const filteredMethods = result.data.payment_methods.filter((method: PaymentMethodConfig) => 
          availableIds.includes(method.id)
        )
        
        // Merge available configs with saved settings
        // The feature flags determine what's available, saved settings determine configuration
        const mergedMethods = availableConfigs.map(defaultConfig => {
          const savedConfig = filteredMethods.find((saved: PaymentMethodConfig) => saved.id === defaultConfig.id)
          return savedConfig ? { ...defaultConfig, ...savedConfig } : defaultConfig
        })
        
        return mergedMethods
      }

      // Return feature flag configurations if no saved settings exist
      return availableConfigs
    } catch (error) {
      // Return empty array if feature flags fail - no hardcoded fallback
      return []
    }
  }

  static async savePaymentMethodsConfig(
    tenantId: string, 
    paymentMethods: PaymentMethodConfig[]
  ): Promise<void> {
    try {
      const response = await fetch('/api/payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          payment_methods: paymentMethods
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save payment settings')
      }

      const result = await response.json()
    } catch (error) {
      throw error
    }
  }

  static async getDefaultPaymentMethods(tier: 'basic' | 'pro' | 'enterprise' = 'pro'): Promise<PaymentMethodConfig[]> {
    const { FeatureFlagsService } = await import('./feature-flags')
    
    try {
      const configurations = await FeatureFlagsService.getPaymentMethodConfigurations(tier)
      
      if (configurations.length === 0) {
      }
      
      return configurations
    } catch (error) {
      return []
    }
  }



  static validateStripeKeys(keys: any): { valid: boolean; message: string } {
    if (!keys.publishableKey || !keys.secretKey) {
      return { valid: false, message: 'Both publishable and secret keys are required' }
    }
    
    const isTestMode = keys.publishableKey.startsWith('pk_test_') && keys.secretKey.startsWith('sk_test_')
    const isLiveMode = keys.publishableKey.startsWith('pk_live_') && keys.secretKey.startsWith('sk_live_')
    
    if (!isTestMode && !isLiveMode) {
      return { valid: false, message: 'Invalid key format' }
    }
    
    if ((keys.publishableKey.startsWith('pk_test_') && keys.secretKey.startsWith('sk_live_')) ||
        (keys.publishableKey.startsWith('pk_live_') && keys.secretKey.startsWith('sk_test_'))) {
      return { valid: false, message: 'Publishable and secret keys must be from the same mode' }
    }
    
    return { 
      valid: true, 
      message: isTestMode ? 'Test mode keys detected' : 'Live mode keys detected' 
    }
  }

  static validateTiloPayKeys(keys: any): { valid: boolean; message: string } {
    if (!keys.publishableKey || !keys.secretKey) {
      return { valid: false, message: 'Both API key and secret key are required' }
    }
    
    // TiloPay uses different key formats - validate basic structure
    if (keys.publishableKey.length < 10) {
      return { valid: false, message: 'Invalid API key format' }
    }
    
    if (keys.secretKey.length < 20) {
      return { valid: false, message: 'Invalid secret key format' }
    }
    
    return { 
      valid: true, 
      message: 'TiloPay keys validated successfully' 
    }
  }

  static getEnabledPaymentMethods(paymentMethods: PaymentMethodConfig[]): PaymentMethodConfig[] {
    return paymentMethods.filter(method => method.enabled)
  }

  static getStripeConfig(paymentMethods: PaymentMethodConfig[]): PaymentMethodConfig | null {
    return paymentMethods.find(method => method.id === 'stripe' && method.enabled) || null
  }

  static getTiloPayConfig(paymentMethods: PaymentMethodConfig[]): PaymentMethodConfig | null {
    return paymentMethods.find(method => method.id === 'tilopay' && method.enabled) || null
  }
}
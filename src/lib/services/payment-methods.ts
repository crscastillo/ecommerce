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
  testMode?: boolean
  metadata?: Record<string, any>
}

export interface TenantPaymentSettings {
  tenant_id: string
  payment_methods: PaymentMethodConfig[]
  updated_at: string
}

export class PaymentMethodsService {
  static async getPaymentMethodsConfig(tenantId: string): Promise<PaymentMethodConfig[]> {
    try {
      const { data, error } = await supabase
        .from('tenant_payment_settings')
        .select('payment_methods')
        .eq('tenant_id', tenantId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data?.payment_methods) {
        return data.payment_methods as PaymentMethodConfig[]
      }

      // Return default configuration if none exists
      return this.getDefaultPaymentMethods()
    } catch (error) {
      console.error('Error loading payment methods config:', error)
      return this.getDefaultPaymentMethods()
    }
  }

  static async savePaymentMethodsConfig(
    tenantId: string, 
    paymentMethods: PaymentMethodConfig[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('tenant_payment_settings')
        .upsert({
          tenant_id: tenantId,
          payment_methods: paymentMethods,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (error) {
      console.error('Error saving payment methods config:', error)
      throw error
    }
  }

  static getDefaultPaymentMethods(): PaymentMethodConfig[] {
    return [
      {
        id: 'stripe',
        name: 'Stripe',
        enabled: true,
        requiresKeys: true,
        keys: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        },
        testMode: true
      },
      {
        id: 'traditional',
        name: 'Traditional Card Form',
        enabled: true,
        requiresKeys: false
      },
      {
        id: 'tilopay',
        name: 'TiloPay',
        enabled: false,
        requiresKeys: true,
        keys: {
          publishableKey: '',
          secretKey: '',
          webhookSecret: ''
        },
        testMode: true,
        metadata: {
          description: 'TiloPay payment gateway for Costa Rica',
          supportedCountries: ['CR'],
          supportedCurrencies: ['CRC', 'USD']
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        enabled: false,
        requiresKeys: true,
        keys: {
          publishableKey: '',
          secretKey: ''
        }
      },
      {
        id: 'apple_pay',
        name: 'Apple Pay',
        enabled: false,
        requiresKeys: false
      },
      {
        id: 'google_pay',
        name: 'Google Pay',
        enabled: false,
        requiresKeys: false
      }
    ]
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
'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useSettings } from '@/lib/contexts/settings-context'
import { createClient } from '@/lib/supabase/client'
import { PaymentMethodsService } from '@/lib/services/payment-methods'
import { FeatureFlagsService, PluginFeatureFlags } from '@/lib/services/feature-flags'
import { StoreSettings, ThemeSettings, PaymentSettings } from '@/components/admin/settings'

// Hook for store settings
export function useStoreSettings() {
  const { tenant, refreshTenant } = useTenant()
  const { setSaving, showSuccess, showError } = useSettings()
  const supabase = createClient()

  const [settings, setSettings] = useState<StoreSettings>({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    country: '',
    admin_language: 'en',
    store_language: 'en',
    address: {},
    settings: {
      currency: 'USD',
      timezone: 'America/New_York',
      tax_rate: 0,
      shipping_enabled: true,
      inventory_tracking: true,
      allow_backorders: false,
      auto_fulfill_orders: false,
      email_notifications: true,
      sms_notifications: false,
      low_stock_threshold: 5
    }
  })

  // Load settings from tenant
  useEffect(() => {
    if (!tenant) return

    const tenantSettings = (tenant.settings as any) || {}
    
    setSettings({
      name: tenant.name || '',
      description: tenant.description || '',
      contact_email: tenant.contact_email || '',
      contact_phone: tenant.contact_phone || '',
      country: tenant.country || 'US',
      admin_language: tenantSettings.admin_language || 'en',
      store_language: tenantSettings.store_language || 'en',
      address: (tenant.address as any) || {},
      settings: {
        currency: 'USD',
        timezone: 'America/New_York',
        tax_rate: 0,
        shipping_enabled: true,
        inventory_tracking: true,
        allow_backorders: false,
        auto_fulfill_orders: false,
        email_notifications: true,
        sms_notifications: false,
        low_stock_threshold: 5,
        ...tenantSettings
      }
    })
  }, [tenant])

  const saveSettings = async () => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      // Prepare settings with language preferences stored in the settings JSONB field
      const updatedSettings = {
        ...settings.settings,
        admin_language: settings.admin_language,
        store_language: settings.store_language
      }
      
      const { error } = await supabase
        .from('tenants')
        .update({
          name: settings.name,
          description: settings.description,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          country: settings.country,

          address: settings.address,
          settings: updatedSettings, // Store language preferences in settings JSONB
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (error) throw error

      await refreshTenant()
      showSuccess('Store settings saved successfully!')
    } catch (error) {
      console.error('Error saving store settings:', error)
      showError('Failed to save store settings')
    } finally {
      setSaving(false)
    }
  }

  return {
    settings,
    setSettings,
    saveSettings,
  }
}

// Hook for theme settings
export function useThemeSettings() {
  const { tenant } = useTenant()
  const { setSaving, showSuccess, showError } = useSettings()
  const supabase = createClient()

  const [settings, setSettings] = useState<ThemeSettings>({
    admin_theme: 'default',
    store_theme: 'default',
    primary_color: '#3B82F6',
    secondary_color: '#6B7280',
    accent_color: '#10B981',
    background_color: '#FFFFFF',
    text_color: '#111827',
    logo_url: '',
    favicon_url: '',
    custom_css: ''
  })

  // Load settings from tenant
  useEffect(() => {
    if (!tenant) return

    const themeConfig = (tenant.theme_config as any) || {}
    setSettings({
      admin_theme: themeConfig.admin_theme || 'default',
      store_theme: themeConfig.store_theme || 'default',
      primary_color: themeConfig.primary_color || '#3B82F6',
      secondary_color: themeConfig.secondary_color || '#6B7280',
      accent_color: themeConfig.accent_color || '#10B981',
      background_color: themeConfig.background_color || '#FFFFFF',
      text_color: themeConfig.text_color || '#111827',
      logo_url: tenant.logo_url || '',
      favicon_url: themeConfig.favicon_url || '',
      custom_css: themeConfig.custom_css || '',
      hero_background_type: themeConfig.hero_background_type || 'color',
      hero_background_value: themeConfig.hero_background_value || ''
    })
  }, [tenant])

  const saveSettings = async () => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tenants')
        .update({
          logo_url: settings.logo_url,
          theme_config: {
            admin_theme: settings.admin_theme,
            store_theme: settings.store_theme,
            primary_color: settings.primary_color,
            secondary_color: settings.secondary_color,
            accent_color: settings.accent_color,
            background_color: settings.background_color,
            text_color: settings.text_color,
            favicon_url: settings.favicon_url,
            custom_css: settings.custom_css,
            hero_background_type: settings.hero_background_type,
            hero_background_value: settings.hero_background_value
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (error) throw error

      showSuccess('Theme settings saved successfully!')
    } catch (error) {
      console.error('Error saving theme settings:', error)
      showError('Failed to save theme settings')
    } finally {
      setSaving(false)
    }
  }

  return {
    settings,
    setSettings,
    saveSettings,
  }
}

// Hook for payment settings
export function usePaymentSettings() {
  const { tenant } = useTenant()
  const { setSaving, showSuccess, showError } = useSettings()
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>([])

  useEffect(() => {
    if (!tenant?.id) return

    const loadPaymentMethods = async () => {
      try {
        const tier = (tenant.subscription_tier as 'basic' | 'pro' | 'enterprise') || 'pro'
        const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenant.id, tier)
        setPaymentMethods(methods)
      } catch (error) {
        console.error('Error loading payment methods:', error)
      }
    }

    loadPaymentMethods()
  }, [tenant?.id])

  const saveSettings = async () => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      // Validate enabled payment methods with keys
      for (const method of paymentMethods) {
        if (!method.enabled || !method.requiresKeys) continue
        
        if (method.id === 'stripe') {
          const validation = PaymentMethodsService.validateStripeKeys({
            publishableKey: method.keys?.publishableKey || '',
            secretKey: method.keys?.secretKey || ''
          })
          
          if (!validation.valid) {
            showError(`Stripe validation error: ${validation.message}`)
            return
          }
        }
        
        if (method.id === 'tilopay') {
          const validation = PaymentMethodsService.validateTiloPayKeys({
            publishableKey: method.keys?.publishableKey || '',
            secretKey: method.keys?.secretKey || ''
          })
          
          if (!validation.valid) {
            showError(`TiloPay validation error: ${validation.message}`)
            return
          }
        }
      }

      await PaymentMethodsService.savePaymentMethodsConfig(tenant.id, paymentMethods)
      showSuccess('Payment settings saved successfully!')
    } catch (error) {
      console.error('Error saving payment settings:', error)
      showError('Failed to save payment settings')
    } finally {
      setSaving(false)
    }
  }

  return {
    paymentMethods,
    setPaymentMethods,
    saveSettings,
  }
}

// Hook for plugin features
export function usePluginFeatures() {
  const { tenant } = useTenant()
  const [pluginFeatures, setPluginFeatures] = useState<PluginFeatureFlags>({
    plugin_google_analytics: false,
    plugin_facebook_pixel: false,
    plugin_mailchimp: false,
    plugin_whatsapp: false
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!tenant?.subscription_tier) return

    const loadPluginFeatures = async () => {
      try {
        const features = await FeatureFlagsService.getEnabledPluginFeaturesForTier(
          tenant.subscription_tier as 'basic' | 'pro' | 'enterprise'
        )
        setPluginFeatures(features)
      } catch (error) {
        console.error('Failed to load plugin features:', error)
      } finally {
        setLoaded(true)
      }
    }

    loadPluginFeatures()
  }, [tenant?.subscription_tier])

  const hasAnyPlugins = loaded && (
    pluginFeatures.plugin_google_analytics ||
    pluginFeatures.plugin_facebook_pixel ||
    pluginFeatures.plugin_mailchimp ||
    pluginFeatures.plugin_whatsapp
  )

  return {
    pluginFeatures,
    loaded,
    hasAnyPlugins,
  }
}

// Hook for tenant users
export function useTenantUsers() {
  const { tenant } = useTenant()
  const { setSaving, showSuccess, showError } = useSettings()
  const supabase = createClient()
  
  const [users, setUsers] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')

  useEffect(() => {
    if (!tenant?.id) return
    loadUsers()
  }, [tenant?.id])

  const loadUsers = async () => {
    if (!tenant?.id) return

    try {
      const { data, error } = await supabase
        .from('tenant_users')
        .select(`
          id,
          tenant_id,
          user_id,
          role,
          permissions,
          is_active,
          invited_at,
          accepted_at
        `)
        .eq('tenant_id', tenant.id)
        .order('invited_at', { ascending: false })

      if (error) {
        console.error('Error loading tenant users:', error)
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading tenant users:', error)
    }
  }

  const inviteUser = async () => {
    if (!tenant?.id || !inviteEmail.trim()) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: tenant.id,
          user_id: `pending-${Date.now()}`,
          role: inviteRole,
          permissions: {},
          is_active: false,
          invited_at: new Date().toISOString()
        })

      if (error) throw error

      showSuccess('User invitation sent successfully!')
      setInviteEmail('')
      loadUsers()
    } catch (error) {
      console.error('Error inviting user:', error)
      showError('Failed to send invitation')
    } finally {
      setSaving(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    if (!tenant?.id) return

    try {
      const { error } = await supabase
        .from('tenant_users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .eq('tenant_id', tenant.id)

      if (error) throw error

      showSuccess('User role updated successfully!')
      loadUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      showError('Failed to update user role')
    }
  }

  const removeUser = async (userId: string) => {
    if (!tenant?.id) return

    try {
      const { error } = await supabase
        .from('tenant_users')
        .delete()
        .eq('id', userId)
        .eq('tenant_id', tenant.id)

      if (error) throw error

      showSuccess('User removed successfully!')
      loadUsers()
    } catch (error) {
      console.error('Error removing user:', error)
      showError('Failed to remove user')
    }
  }

  return {
    users,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteUser,
    updateUserRole,
    removeUser,
  }
}
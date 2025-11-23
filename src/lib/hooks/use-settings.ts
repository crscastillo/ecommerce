'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useSettings } from '@/lib/contexts/settings-context'
import { createClient } from '@/lib/supabase/client'
import { PaymentMethodsService } from '@/lib/services/payment-methods'
import { FeatureFlagsService, PluginFeatureFlags } from '@/lib/services/feature-flags'
import { StoreSettings, ThemeSettings, PaymentSettings } from '@/components/admin/settings'

// Hook for store settings
export function useStoreSettings() {
  const t = useTranslations('settings.messages')
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

  const saveSettings = async (customMessage?: string) => {
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

      showSuccess(customMessage || t('storeSettingsSaved'))
    } catch (error) {
      console.error('Error saving store settings:', error)
      showError(t('failedToSaveStore'))
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
  const t = useTranslations('settings.messages')
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
    favicon_url: ''
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
            hero_background_type: settings.hero_background_type,
            hero_background_value: settings.hero_background_value
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (error) throw error

      showSuccess(t('themeSettingsSaved'))
    } catch (error) {
      console.error('Error saving theme settings:', error)
      showError(t('failedToSaveTheme'))
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
  const t = useTranslations('settings.messages')
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
      showSuccess(t('paymentSettingsSaved'))
    } catch (error) {
      console.error('Error saving payment settings:', error)
      showError(t('failedToSavePayments'))
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
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  useEffect(() => {
    if (!tenant?.id) return
    loadUsers()
  }, [tenant?.id])

  const loadUsers = async () => {
    if (!tenant?.id) return

    try {
      // Load actual tenant users
      const { data: tenantUsersData, error: tenantUsersError } = await supabase
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

      if (tenantUsersError) {
        console.error('Error loading tenant users:', tenantUsersError)
        return
      }

      // Load pending invitations from tenant_users_invitations table
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('tenant_users_invitations')
        .select(`
          id,
          tenant_id,
          email,
          role,
          invited_at,
          expires_at,
          is_active
        `)
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .order('invited_at', { ascending: false })

      const pendingInvitations = invitationsError ? [] : (invitationsData || [])

      // Combine and format the data
      const combinedUsers = [
        ...(tenantUsersData || []).map(user => ({ ...user, type: 'user' })),
        ...pendingInvitations.map(invitation => ({ 
          ...invitation, 
          type: 'invitation',
          tenant_id: tenant.id,
          user_id: invitation.email, // Use email as user_id for display
          permissions: {},
          accepted_at: null,
          is_active: false // Mark invitations as not active users
        }))
      ].sort((a, b) => new Date(b.invited_at).getTime() - new Date(a.invited_at).getTime())

      setUsers(combinedUsers)
    } catch (error) {
      console.error('Error loading users and invitations:', error)
    }
  }

  const inviteUser = async () => {
    if (!tenant?.id || !inviteEmail.trim()) return

    try {
      setSaving(true)
      
      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          email: inviteEmail.trim(),
          role: inviteRole
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invitation')
      }

      // Handle different email statuses
      let message = 'User invitation created successfully!'
      
      if (result.email_status === 'sent') {
        message = 'User invitation sent successfully! The user will receive an email with instructions.'
      } else if (result.email_status === 'user_exists') {
        message = 'Invitation created! Note: This user already has an account and can sign in directly.'
      } else if (result.email_status === 'failed') {
        message = `Invitation created but email failed to send: ${result.email_error || 'Unknown error'}`
      }

      showSuccess(message)
      setInviteEmail('')
      setInviteModalOpen(false)
      loadUsers()
    } catch (error) {
      console.error('Error inviting user:', error)
      showError(error instanceof Error ? error.message : 'Failed to send invitation')
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
      // Find the user in our current users list to determine if it's a real user or invitation
      const userToRemove = users.find(user => user.id === userId)
      
      if (!userToRemove) {
        showError('User not found')
        return
      }

      if (userToRemove.type === 'invitation') {
        // Remove invitation from tenant's pending_invitations
        await removeInvitation(userId)
      } else {
        // Remove real user from tenant_users table
        const { error } = await supabase
          .from('tenant_users')
          .delete()
          .eq('id', userId)
          .eq('tenant_id', tenant.id)

        if (error) throw error
      }

      showSuccess('User removed successfully!')
      loadUsers()
    } catch (error) {
      console.error('Error removing user:', error)
      showError('Failed to remove user')
    }
  }

  const removeInvitation = async (invitationId: string) => {
    if (!tenant?.id) return

    try {
      // Delete the invitation from tenant_users_invitations table
      const { error } = await supabase
        .from('tenant_users_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('tenant_id', tenant.id)

      if (error) throw error
    } catch (error) {
      throw error
    }
  }

  const resendInvitation = async (invitationId: string) => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      const response = await fetch('/api/users/resend-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId,
          tenantId: tenant.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend invitation')
      }

      // Handle different email statuses
      let message = 'Invitation resent successfully!'
      
      if (result.email_status === 'sent') {
        message = 'Invitation resent successfully! The user will receive a new email with instructions.'
      } else if (result.email_status === 'user_exists') {
        message = 'Note: This user already has an account and can sign in directly.'
      } else if (result.email_status === 'failed') {
        message = `Invitation updated but email failed to send: ${result.email_error || 'Unknown error'}`
      }

      showSuccess(message)
      loadUsers()
    } catch (error) {
      console.error('Error resending invitation:', error)
      showError(error instanceof Error ? error.message : 'Failed to resend invitation')
    } finally {
      setSaving(false)
    }
  }

  return {
    users,
    inviteEmail,
    setInviteEmail,
    inviteRole,
    setInviteRole,
    inviteModalOpen,
    setInviteModalOpen,
    inviteUser,
    updateUserRole,
    removeUser,
    resendInvitation,
  }
}
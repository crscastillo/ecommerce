'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Database } from '@/lib/types/database'
import { PaymentMethodsService } from '@/lib/services/payment-methods'
import { FeatureFlagsService, PluginFeatureFlags } from '@/lib/services/feature-flags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Import refactored components
import { 
  StoreInformationTab, 
  ConfigurationTab, 
  StoreConfigTab,
  ThemeTab,
  PaymentsTab,
  PluginsTab,
  UsersTab,
  SecurityTab,
  type StoreSettings as StoreSettingsType,
  type ThemeSettings as ThemeSettingsType,
  type PaymentSettings
} from '@/components/admin/settings'

import { 
  Settings, 
  Store, 
  Palette, 
  Users, 
  Shield, 
  Mail, 
  Globe, 
  Save, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  CreditCard,
  Cog,
  Puzzle
} from 'lucide-react'

type Tenant = Database['public']['Tables']['tenants']['Row']
type TenantUser = {
  id: string
  tenant_id: string
  user_id: string
  role: string
  permissions: Record<string, any>
  is_active: boolean
  invited_at: string
  accepted_at?: string
  user?: {
    email: string
  }
}

// Use imported types from components
type StoreSettings = StoreSettingsType
type ThemeSettings = ThemeSettingsType

interface PaymentMethodConfig {
  enabled: boolean
  stripe_publishable_key?: string
  stripe_secret_key?: string
  tilopay_api_key?: string
  tilopay_secret_key?: string
}

// Note: PaymentSettings is imported from components/admin/settings

export default function SettingsPage() {
  const { tenant, isLoading: tenantLoading, error, refreshTenant } = useTenant()
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([])
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'store')
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>([])
  const [showStripeKeys, setShowStripeKeys] = useState(false)
  const [showTiloPayKeys, setShowTiloPayKeys] = useState(false)
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
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

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
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

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')
  const [pluginFeatures, setPluginFeatures] = useState<PluginFeatureFlags>({
    plugin_google_analytics: false,
    plugin_facebook_pixel: false,
    plugin_mailchimp: false,
    plugin_whatsapp: false
  })
  const [pluginFeaturesLoaded, setPluginFeaturesLoaded] = useState(false)

  const supabase = createClient()

  // Track when component is mounted to prevent SSR flash
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (tenant?.id) {
      loadSettings()
      loadTenantUsers()
      loadPaymentMethods()
      loadPluginFeatures()
    }
  }, [tenant?.id])

  // Update URL when tab changes (only when user changes tab, not on initial load)
  useEffect(() => {
    if (!mounted) return // Don't update URL on initial mount
    
    const currentTab = searchParams.get('tab') || 'store'
    if (currentTab !== activeTab) {
      const newParams = new URLSearchParams(searchParams.toString())
      if (activeTab === 'store') {
        newParams.delete('tab')
      } else {
        newParams.set('tab', activeTab)
      }
      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '/admin/settings'
      router.replace(newUrl, { scroll: false })
    }
  }, [activeTab, mounted])

  // Initialize activeTab from URL on mount only
  useEffect(() => {
    if (mounted) {
      const tabFromUrl = searchParams.get('tab') || 'store'
      setActiveTab(tabFromUrl)
    }
  }, [mounted])

  const loadSettings = async () => {
    if (!tenant) return

    try {
      setLoading(true)
      
      // Load current tenant data
      setStoreSettings({
        name: tenant.name || '',
        description: tenant.description || '',
        contact_email: tenant.contact_email || '',
        contact_phone: tenant.contact_phone || '',
        country: tenant.country || 'US',
        admin_language: (tenant as any).admin_language || 'en',
        store_language: (tenant as any).store_language || 'en',
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
          ...(tenant.settings as any) || {}
        }
      })

      // Load theme settings from tenant.theme_config
      const themeConfig = (tenant.theme_config as any) || {}
      setThemeSettings({
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
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: 'Failed to load settings' })
    } finally {
      setLoading(false)
    }
  }

  const loadTenantUsers = async () => {
    if (!tenant?.id) return

    try {
      const { data: users, error } = await supabase
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

      setTenantUsers(users || [])
    } catch (error) {
      console.error('Error loading tenant users:', error)
    }
  }

  const loadPaymentMethods = async () => {
    if (!tenant?.id) return

    try {
      const tier = (tenant.subscription_tier as 'basic' | 'pro' | 'enterprise') || 'pro'
      const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenant.id, tier)
      setPaymentMethods(methods)
    } catch (error) {
      console.error('Error loading payment methods:', error)
    }
  }

  const loadPluginFeatures = async () => {
    if (!tenant?.subscription_tier) return

    try {
      const features = await FeatureFlagsService.getEnabledPluginFeaturesForTier(
        tenant.subscription_tier as 'basic' | 'pro' | 'enterprise'
      )
      setPluginFeatures(features)
    } catch (error) {
      console.error('Failed to load plugin features:', error)
      // Keep default disabled state on error
    } finally {
      setPluginFeaturesLoaded(true)
    }
  }

  const saveStoreSettings = async () => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tenants')
        .update({
          name: storeSettings.name,
          description: storeSettings.description,
          contact_email: storeSettings.contact_email,
          contact_phone: storeSettings.contact_phone,
          country: storeSettings.country,
          admin_language: storeSettings.admin_language,
          store_language: storeSettings.store_language,
          address: storeSettings.address,
          settings: storeSettings.settings,
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (error) {
        throw error
      }

      // Refresh tenant context to get updated currency
      await refreshTenant()

      setMessage({ type: 'success', text: 'Store settings saved successfully!' })
    } catch (error) {
      console.error('Error saving store settings:', error)
      setMessage({ type: 'error', text: 'Failed to save store settings' })
    } finally {
      setSaving(false)
    }
  }

  const saveThemeSettings = async () => {
    if (!tenant?.id) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('tenants')
        .update({
          logo_url: themeSettings.logo_url,
          theme_config: {
            admin_theme: themeSettings.admin_theme,
            store_theme: themeSettings.store_theme,
            primary_color: themeSettings.primary_color,
            secondary_color: themeSettings.secondary_color,
            accent_color: themeSettings.accent_color,
            background_color: themeSettings.background_color,
            text_color: themeSettings.text_color,
            favicon_url: themeSettings.favicon_url,
            custom_css: themeSettings.custom_css,
            hero_background_type: themeSettings.hero_background_type,
            hero_background_value: themeSettings.hero_background_value
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', tenant.id)

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'Theme settings saved successfully!' })
    } catch (error) {
      console.error('Error saving theme settings:', error)
      setMessage({ type: 'error', text: 'Failed to save theme settings' })
    } finally {
      setSaving(false)
    }
  }

  const savePaymentSettings = async () => {
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
            setMessage({ type: 'error', text: `Stripe validation error: ${validation.message}` })
            return
          }
        }
        
        if (method.id === 'tilopay') {
          const validation = PaymentMethodsService.validateTiloPayKeys({
            publishableKey: method.keys?.publishableKey || '',
            secretKey: method.keys?.secretKey || ''
          })
          
          if (!validation.valid) {
            setMessage({ type: 'error', text: `TiloPay validation error: ${validation.message}` })
            return
          }
        }
      }

      await PaymentMethodsService.savePaymentMethodsConfig(tenant.id, paymentMethods)
      setMessage({ type: 'success', text: 'Payment settings saved successfully!' })
    } catch (error) {
      console.error('Error saving payment settings:', error)
      setMessage({ type: 'error', text: 'Failed to save payment settings' })
    } finally {
      setSaving(false)
    }
  }

  const inviteUser = async () => {
    if (!tenant?.id || !inviteEmail.trim()) return

    try {
      setSaving(true)
      
      // For demo purposes, we'll just add to tenant_users table
      // In a real app, you'd send an email invitation
      const { error } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: tenant.id,
          user_id: `pending-${Date.now()}`, // Placeholder for pending invitation
          role: inviteRole,
          permissions: {},
          is_active: false,
          invited_at: new Date().toISOString()
        })

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'User invitation sent successfully!' })
      setInviteEmail('')
      loadTenantUsers()
    } catch (error) {
      console.error('Error inviting user:', error)
      setMessage({ type: 'error', text: 'Failed to send invitation' })
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

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'User role updated successfully!' })
      loadTenantUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      setMessage({ type: 'error', text: 'Failed to update user role' })
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

      if (error) {
        throw error
      }

      setMessage({ type: 'success', text: 'User removed successfully!' })
      loadTenantUsers()
    } catch (error) {
      console.error('Error removing user:', error)
      setMessage({ type: 'error', text: 'Failed to remove user' })
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'staff': return 'outline'
      default: return 'outline'
    }
  }

  // Don't render anything until mounted (prevents SSR flash)
  if (!mounted) {
    return null
  }

  // Show tenant loading state
  if (tenantLoading || !tenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading settings...</p>
        </div>
      </div>
    )
  }

  // Show tenant error state only if there's an actual error
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tenant Access Required</h3>
            <p className="text-gray-600 mb-4">
              {error || 'Settings require access via your store subdomain.'}
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {(() => {
          const hasAnyPlugins = pluginFeaturesLoaded && (
            pluginFeatures.plugin_google_analytics ||
            pluginFeatures.plugin_facebook_pixel ||
            pluginFeatures.plugin_mailchimp ||
            pluginFeatures.plugin_whatsapp
          )
          
          return (
            <TabsList className={hasAnyPlugins ? "grid w-full grid-cols-7" : "grid w-full grid-cols-6"}>
          <TabsTrigger value="store" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>{t('tabs.store')}</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Cog className="h-4 w-4" />
            <span>{t('tabs.config')}</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>{t('tabs.theme')}</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>{t('tabs.payments')}</span>
          </TabsTrigger>
          {hasAnyPlugins && (
            <TabsTrigger value="plugins" className="flex items-center space-x-2">
              <Puzzle className="h-4 w-4" />
              <span>{t('tabs.plugins')}</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{t('tabs.users')}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>{t('tabs.security')}</span>
          </TabsTrigger>
            </TabsList>
          )
        })()}

        {/* Store Settings - Using Refactored Component */}
        <TabsContent value="store" className="space-y-6">
          <StoreInformationTab
            tenant={tenant}
            settings={storeSettings}
            onSettingsChange={setStoreSettings}
            onSave={saveStoreSettings}
            saving={saving}
          />
        </TabsContent>

        {/* Configuration Settings - Using Refactored Component */}
        <TabsContent value="config" className="space-y-6">
          <ConfigurationTab
            settings={storeSettings}
            onSettingsChange={setStoreSettings}
            onSave={saveStoreSettings}
            saving={saving}
          />
        </TabsContent>

        {/* Theme Settings - Using Refactored Component */}
        <TabsContent value="theme" className="space-y-6">
          <ThemeTab
            settings={themeSettings}
            onSettingsChange={setThemeSettings}
            onSave={saveThemeSettings}
            saving={saving}
            tenantId={tenant.id}
          />
        </TabsContent>

        {/* Payment Methods Settings */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab
            paymentMethods={paymentMethods}
            onPaymentMethodsChange={setPaymentMethods}
            onSave={savePaymentSettings}
            saving={saving}
          />
        </TabsContent>

        {/* Plugins Management */}
        {pluginFeaturesLoaded && (
          pluginFeatures.plugin_google_analytics ||
          pluginFeatures.plugin_facebook_pixel ||
          pluginFeatures.plugin_mailchimp ||
          pluginFeatures.plugin_whatsapp
        ) && (
          <TabsContent value="plugins" className="space-y-6">
            <PluginsTab tenant={tenant} />
          </TabsContent>
        )}

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <UsersTab
            tenantUsers={tenantUsers}
            inviteEmail={inviteEmail}
            inviteRole={inviteRole}
            saving={saving}
            onInviteEmailChange={setInviteEmail}
            onInviteRoleChange={setInviteRole}
            onInviteUser={inviteUser}
            onUpdateUserRole={updateUserRole}
            onRemoveUser={removeUser}
            getRoleBadgeVariant={getRoleBadgeVariant}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTab
            tenant={tenant}
            saving={saving}
            onPasswordReset={async () => {
              try {
                setSaving(true)
                
                const { error } = await supabase.auth.resetPasswordForEmail(
                  tenant.contact_email || '',
                  {
                    redirectTo: `${window.location.origin}/admin/reset-password`
                  }
                )

                if (error) {
                  throw error
                }

                setMessage({ 
                  type: 'success', 
                  text: t('security.passwordResetSent')
                })
              } catch (error) {
                console.error('Error sending password reset:', error)
                setMessage({ 
                  type: 'error', 
                  text: t('security.failedToSendPasswordReset')
                })
              } finally {
                setSaving(false)
              }
            }}
            onSignOut={async () => {
              try {
                setSaving(true)
                await supabase.auth.signOut()
                window.location.href = '/login'
              } catch (error) {
                console.error('Error signing out:', error)
                setMessage({ 
                  type: 'error', 
                  text: t('security.failedToSignOut')
                })
              } finally {
                setSaving(false)
              }
            }}
            onDeleteStore={async () => {
              // TODO: Implement delete store functionality
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
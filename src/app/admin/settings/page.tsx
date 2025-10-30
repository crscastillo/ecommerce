'use client'

import { useState, useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { PaymentMethodsService } from '@/lib/services/payment-methods'
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

interface StoreSettings {
  name: string
  description: string
  contact_email: string
  contact_phone: string
  country: string
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  settings: {
    currency?: string
    timezone?: string
    tax_rate?: number
    shipping_enabled?: boolean
    inventory_tracking?: boolean
    allow_backorders?: boolean
    auto_fulfill_orders?: boolean
    email_notifications?: boolean
    sms_notifications?: boolean
    low_stock_threshold?: number
  }
}

interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  font_family: string
  logo_url: string
  favicon_url: string
  custom_css: string
}

interface PaymentMethodConfig {
  enabled: boolean
  stripe_publishable_key?: string
  stripe_secret_key?: string
  tilopay_api_key?: string
  tilopay_secret_key?: string
}

interface PaymentSettings {
  cash_on_delivery: PaymentMethodConfig
  stripe: PaymentMethodConfig
  tilopay: PaymentMethodConfig
}

export default function SettingsPage() {
  const { tenant, isLoading: tenantLoading, error, refreshTenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [tenantUsers, setTenantUsers] = useState<TenantUser[]>([])
  const [activeTab, setActiveTab] = useState('store')
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>({
    cash_on_delivery: { enabled: true },
    stripe: { enabled: false },
    tilopay: { enabled: false }
  })
  const [showStripeKeys, setShowStripeKeys] = useState(false)
  const [showTiloPayKeys, setShowTiloPayKeys] = useState(false)
  
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    country: '',
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
    primary_color: '#3B82F6',
    secondary_color: '#6B7280',
    accent_color: '#10B981',
    background_color: '#FFFFFF',
    text_color: '#111827',
    font_family: 'Inter',
    logo_url: '',
    favicon_url: '',
    custom_css: ''
  })

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('staff')

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadSettings()
      loadTenantUsers()
      loadPaymentMethods()
    }
  }, [tenant?.id])

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
        primary_color: themeConfig.primary_color || '#3B82F6',
        secondary_color: themeConfig.secondary_color || '#6B7280',
        accent_color: themeConfig.accent_color || '#10B981',
        background_color: themeConfig.background_color || '#FFFFFF',
        text_color: themeConfig.text_color || '#111827',
        font_family: themeConfig.font_family || 'Inter',
        logo_url: tenant.logo_url || '',
        favicon_url: themeConfig.favicon_url || '',
        custom_css: themeConfig.custom_css || ''
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
      const methods = await PaymentMethodsService.getPaymentMethodsConfig(tenant.id)
      
      // Convert to our local state format
      const stripeMethod = methods.find(m => m.id === 'stripe')
      const traditionalMethod = methods.find(m => m.id === 'traditional')
      const tilopayMethod = methods.find(m => m.id === 'tilopay')
      
      setPaymentMethods({
        cash_on_delivery: {
          enabled: traditionalMethod?.enabled || true
        },
        stripe: {
          enabled: stripeMethod?.enabled || false,
          stripe_publishable_key: stripeMethod?.keys?.publishableKey || '',
          stripe_secret_key: stripeMethod?.keys?.secretKey || ''
        },
        tilopay: {
          enabled: tilopayMethod?.enabled || false,
          tilopay_api_key: tilopayMethod?.keys?.publishableKey || '',
          tilopay_secret_key: tilopayMethod?.keys?.secretKey || ''
        }
      })
    } catch (error) {
      console.error('Error loading payment methods:', error)
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
            primary_color: themeSettings.primary_color,
            secondary_color: themeSettings.secondary_color,
            accent_color: themeSettings.accent_color,
            background_color: themeSettings.background_color,
            text_color: themeSettings.text_color,
            font_family: themeSettings.font_family,
            favicon_url: themeSettings.favicon_url,
            custom_css: themeSettings.custom_css
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
      
      // Validate Stripe keys if Stripe is enabled
      if (paymentMethods.stripe.enabled) {
        const validation = PaymentMethodsService.validateStripeKeys({
          publishableKey: paymentMethods.stripe.stripe_publishable_key,
          secretKey: paymentMethods.stripe.stripe_secret_key
        })
        
        if (!validation.valid) {
          setMessage({ type: 'error', text: `Stripe validation error: ${validation.message}` })
          return
        }
      }

      // Validate TiloPay keys if TiloPay is enabled
      if (paymentMethods.tilopay.enabled) {
        const validation = PaymentMethodsService.validateTiloPayKeys({
          publishableKey: paymentMethods.tilopay.tilopay_api_key,
          secretKey: paymentMethods.tilopay.tilopay_secret_key
        })
        
        if (!validation.valid) {
          setMessage({ type: 'error', text: `TiloPay validation error: ${validation.message}` })
          return
        }
      }

      // Convert to service format
      const defaultMethods = PaymentMethodsService.getDefaultPaymentMethods()
      const updatedMethods = defaultMethods.map(method => {
        if (method.id === 'stripe') {
          return {
            ...method,
            enabled: paymentMethods.stripe.enabled,
            keys: {
              ...method.keys,
              publishableKey: paymentMethods.stripe.stripe_publishable_key || '',
              secretKey: paymentMethods.stripe.stripe_secret_key || ''
            }
          }
        }
        if (method.id === 'traditional') {
          return {
            ...method,
            enabled: paymentMethods.cash_on_delivery.enabled
          }
        }
        if (method.id === 'tilopay') {
          return {
            ...method,
            enabled: paymentMethods.tilopay.enabled,
            keys: {
              ...method.keys,
              publishableKey: paymentMethods.tilopay.tilopay_api_key || '',
              secretKey: paymentMethods.tilopay.tilopay_secret_key || ''
            }
          }
        }
        return method
      })

      await PaymentMethodsService.savePaymentMethodsConfig(tenant.id, updatedMethods)
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

  // Show tenant loading state
  if (tenantLoading) {
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

  // Show tenant error state
  if (error || !tenant) {
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="store" className="flex items-center space-x-2">
            <Store className="h-4 w-4" />
            <span>Store</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center space-x-2">
            <Cog className="h-4 w-4" />
            <span>Config</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Theme</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Payments</span>
          </TabsTrigger>
          <TabsTrigger value="plugins" className="flex items-center space-x-2">
            <Puzzle className="h-4 w-4" />
            <span>Plugins</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input
                    id="store-name"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Awesome Store"
                  />
                </div>
                <div>
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <Input
                    id="subdomain"
                    value={tenant.subdomain}
                    disabled
                    placeholder="mystore"
                  />
                  <p className="text-xs text-gray-500 mt-1">Subdomain cannot be changed after creation</p>
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={storeSettings.country} 
                    onValueChange={(value) => setStoreSettings(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">🇺🇸 United States</SelectItem>
                      <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                      <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                      <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                      <SelectItem value="CR">🇨🇷 Costa Rica</SelectItem>
                      <SelectItem value="MX">🇲🇽 Mexico</SelectItem>
                      <SelectItem value="ES">🇪🇸 Spain</SelectItem>
                      <SelectItem value="FR">🇫🇷 France</SelectItem>
                      <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                      <SelectItem value="IT">🇮🇹 Italy</SelectItem>
                      <SelectItem value="BR">🇧🇷 Brazil</SelectItem>
                      <SelectItem value="AR">🇦🇷 Argentina</SelectItem>
                      <SelectItem value="CL">🇨🇱 Chile</SelectItem>
                      <SelectItem value="CO">🇨🇴 Colombia</SelectItem>
                      <SelectItem value="PE">🇵🇪 Peru</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={storeSettings.description}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your store..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={storeSettings.contact_email}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contact@mystore.com"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input
                    id="contact-phone"
                    value={storeSettings.contact_phone}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={storeSettings.address.street || ''}
                      onChange={(e) => setStoreSettings(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={storeSettings.address.city || ''}
                      onChange={(e) => setStoreSettings(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={storeSettings.address.state || ''}
                      onChange={(e) => setStoreSettings(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={storeSettings.address.zip || ''}
                      onChange={(e) => setStoreSettings(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, zip: e.target.value }
                      }))}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={storeSettings.address.country || ''}
                      onChange={(e) => setStoreSettings(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveStoreSettings} disabled={saving} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Store Information'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Settings */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select 
                    value={storeSettings.settings.currency} 
                    onValueChange={(value) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, currency: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">💵 USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">💶 EUR - Euro</SelectItem>
                      <SelectItem value="GBP">💷 GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="CRC">🇨🇷 CRC - Costa Rican Colón</SelectItem>
                      <SelectItem value="MXN">🇲🇽 MXN - Mexican Peso</SelectItem>
                      <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                      <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                      <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc</SelectItem>
                      <SelectItem value="SEK">🇸🇪 SEK - Swedish Krona</SelectItem>
                      <SelectItem value="NOK">🇳🇴 NOK - Norwegian Krone</SelectItem>
                      <SelectItem value="DKK">🇩🇰 DKK - Danish Krone</SelectItem>
                      <SelectItem value="BRL">🇧🇷 BRL - Brazilian Real</SelectItem>
                      <SelectItem value="ARS">🇦🇷 ARS - Argentine Peso</SelectItem>
                      <SelectItem value="CLP">🇨🇱 CLP - Chilean Peso</SelectItem>
                      <SelectItem value="COP">🇨🇴 COP - Colombian Peso</SelectItem>
                      <SelectItem value="PEN">🇵🇪 PEN - Peruvian Sol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={storeSettings.settings.timezone} 
                    onValueChange={(value) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={storeSettings.settings.tax_rate || 0}
                  onChange={(e) => setStoreSettings(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, tax_rate: parseFloat(e.target.value) || 0 }
                  }))}
                  placeholder="8.25"
                />
              </div>

              <div>
                <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
                <Input
                  id="low-stock-threshold"
                  type="number"
                  min="0"
                  value={storeSettings.settings.low_stock_threshold || 5}
                  onChange={(e) => setStoreSettings(prev => ({ 
                    ...prev, 
                    settings: { ...prev.settings, low_stock_threshold: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Show low stock warnings when product quantity is below this number
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Store Features</h3>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Inventory Tracking</Label>
                    <p className="text-sm text-gray-500">Track product quantities and stock levels</p>
                  </div>
                  <Switch
                    checked={storeSettings.settings.inventory_tracking || false}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, inventory_tracking: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Backorders</Label>
                    <p className="text-sm text-gray-500">Allow customers to order out-of-stock items</p>
                  </div>
                  <Switch
                    checked={storeSettings.settings.allow_backorders || false}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, allow_backorders: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-fulfill Orders</Label>
                    <p className="text-sm text-gray-500">Automatically mark orders as fulfilled</p>
                  </div>
                  <Switch
                    checked={storeSettings.settings.auto_fulfill_orders || false}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, auto_fulfill_orders: checked }
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500">Send email notifications for order updates</p>
                  </div>
                  <Switch
                    checked={storeSettings.settings.email_notifications !== false}
                    onCheckedChange={(checked) => setStoreSettings(prev => ({ 
                      ...prev, 
                      settings: { ...prev.settings, email_notifications: checked }
                    }))}
                  />
                </div>
              </div>

              <Button onClick={saveStoreSettings} disabled={saving} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo-url">Logo URL</Label>
                <Input
                  id="logo-url"
                  value={themeSettings.logo_url}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <Label htmlFor="favicon-url">Favicon URL</Label>
                <Input
                  id="favicon-url"
                  value={themeSettings.favicon_url}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={themeSettings.secondary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.secondary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, secondary_color: e.target.value }))}
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                      placeholder="#10B981"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select 
                  value={themeSettings.font_family} 
                  onValueChange={(value) => setThemeSettings(prev => ({ ...prev, font_family: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom CSS</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={themeSettings.custom_css}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, custom_css: e.target.value }))}
                  placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #333;&#10;}"
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={saveThemeSettings} disabled={saving} className="mt-4">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Theme Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Settings */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure which payment methods are available to your customers.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cash on Delivery */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    💵
                  </div>
                  <div>
                    <h3 className="font-medium">Cash on Delivery</h3>
                    <p className="text-sm text-gray-500">
                      Allow customers to pay when they receive their order
                    </p>
                  </div>
                </div>
                <Switch
                  checked={paymentMethods.cash_on_delivery.enabled}
                  onCheckedChange={(checked) => setPaymentMethods(prev => ({
                    ...prev,
                    cash_on_delivery: { ...prev.cash_on_delivery, enabled: checked }
                  }))}
                />
              </div>

              {/* Stripe */}
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Stripe</h3>
                      <p className="text-sm text-gray-500">
                        Accept credit cards and other payment methods with Stripe
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.stripe.enabled}
                    onCheckedChange={(checked) => setPaymentMethods(prev => ({
                      ...prev,
                      stripe: { ...prev.stripe, enabled: checked }
                    }))}
                  />
                </div>

                {paymentMethods.stripe.enabled && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between pt-4">
                      <Label className="text-sm font-medium">API Keys</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStripeKeys(!showStripeKeys)}
                      >
                        {showStripeKeys ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Keys
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show Keys
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="stripe-publishable-key" className="text-sm">
                          Publishable Key
                        </Label>
                        <Input
                          id="stripe-publishable-key"
                          type={showStripeKeys ? "text" : "password"}
                          value={paymentMethods.stripe.stripe_publishable_key || ''}
                          onChange={(e) => setPaymentMethods(prev => ({
                            ...prev,
                            stripe: { ...prev.stripe, stripe_publishable_key: e.target.value }
                          }))}
                          placeholder="pk_test_..."
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stripe-secret-key" className="text-sm">
                          Secret Key
                        </Label>
                        <Input
                          id="stripe-secret-key"
                          type={showStripeKeys ? "text" : "password"}
                          value={paymentMethods.stripe.stripe_secret_key || ''}
                          onChange={(e) => setPaymentMethods(prev => ({
                            ...prev,
                            stripe: { ...prev.stripe, stripe_secret_key: e.target.value }
                          }))}
                          placeholder="sk_test_..."
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-blue-900">Stripe API Keys</p>
                          <p className="text-blue-700">
                            Get your API keys from the{' '}
                            <a 
                              href="https://dashboard.stripe.com/apikeys" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              Stripe Dashboard
                            </a>
                            . Use test keys for testing and live keys for production.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* TiloPay */}
              <div className="border rounded-lg">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      🏦
                    </div>
                    <div>
                      <h3 className="font-medium">TiloPay</h3>
                      <p className="text-sm text-gray-500">
                        Costa Rican payment gateway for local and international cards
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.tilopay.enabled}
                    onCheckedChange={(checked) => setPaymentMethods(prev => ({
                      ...prev,
                      tilopay: { ...prev.tilopay, enabled: checked }
                    }))}
                  />
                </div>

                {paymentMethods.tilopay.enabled && (
                  <div className="px-4 pb-4 space-y-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between pt-4">
                      <Label className="text-sm font-medium">API Keys</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTiloPayKeys(!showTiloPayKeys)}
                      >
                        {showTiloPayKeys ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide Keys
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show Keys
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="tilopay-api-key" className="text-sm">
                          API Key
                        </Label>
                        <Input
                          id="tilopay-api-key"
                          type={showTiloPayKeys ? "text" : "password"}
                          value={paymentMethods.tilopay.tilopay_api_key || ''}
                          onChange={(e) => setPaymentMethods(prev => ({
                            ...prev,
                            tilopay: { ...prev.tilopay, tilopay_api_key: e.target.value }
                          }))}
                          placeholder="Your TiloPay API key"
                          className="font-mono text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tilopay-secret-key" className="text-sm">
                          Secret Key
                        </Label>
                        <Input
                          id="tilopay-secret-key"
                          type={showTiloPayKeys ? "text" : "password"}
                          value={paymentMethods.tilopay.tilopay_secret_key || ''}
                          onChange={(e) => setPaymentMethods(prev => ({
                            ...prev,
                            tilopay: { ...prev.tilopay, tilopay_secret_key: e.target.value }
                          }))}
                          placeholder="Your TiloPay secret key"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-green-900">TiloPay API Keys</p>
                          <p className="text-green-700">
                            Get your API keys from the{' '}
                            <a 
                              href="https://portal.tilopay.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline"
                            >
                              TiloPay Portal
                            </a>
                            . TiloPay supports CRC and USD payments for Costa Rica.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={savePaymentSettings} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Payment Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plugins Management */}
        <TabsContent value="plugins" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Puzzle className="h-5 w-5 mr-2" />
                Available Plugins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Analytics Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Google Analytics</h3>
                          <p className="text-sm text-gray-600">Track store performance and visitor behavior</p>
                        </div>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="ga-tracking-id">Tracking ID</Label>
                        <Input
                          id="ga-tracking-id"
                          placeholder="G-XXXXXXXXXX"
                          disabled
                        />
                      </div>
                      <Badge variant="outline">Pro Feature</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Facebook Pixel Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Facebook Pixel</h3>
                          <p className="text-sm text-gray-600">Track conversions and optimize ads</p>
                        </div>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="fb-pixel-id">Pixel ID</Label>
                        <Input
                          id="fb-pixel-id"
                          placeholder="1234567890123456"
                          disabled
                        />
                      </div>
                      <Badge variant="outline">Pro Feature</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Marketing Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Mailchimp Integration</h3>
                          <p className="text-sm text-gray-600">Sync customers and send newsletters</p>
                        </div>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="mailchimp-api-key">API Key</Label>
                        <Input
                          id="mailchimp-api-key"
                          placeholder="API Key"
                          type="password"
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="mailchimp-list-id">List ID</Label>
                        <Input
                          id="mailchimp-list-id"
                          placeholder="List ID"
                          disabled
                        />
                      </div>
                      <Badge variant="outline">Pro Feature</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* WhatsApp Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">WhatsApp Business</h3>
                          <p className="text-sm text-gray-600">Customer support via WhatsApp</p>
                        </div>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
                        <Input
                          id="whatsapp-number"
                          placeholder="+506 1234 5678"
                          defaultValue="+506 8888 8888"
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp-message">Default Message</Label>
                        <Textarea
                          id="whatsapp-message"
                          placeholder="Hi! I'm interested in..."
                          defaultValue="Hola! Me interesa obtener información sobre sus productos."
                        />
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Live Chat Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Mail className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Live Chat Widget</h3>
                          <p className="text-sm text-gray-600">Real-time customer support</p>
                        </div>
                      </div>
                      <Switch 
                        checked={false}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="chat-position">Widget Position</Label>
                        <Select defaultValue="bottom-right">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Badge variant="outline">Pro Feature</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory Management Plugin */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Low Stock Alerts</h3>
                          <p className="text-sm text-gray-600">Get notified when inventory is low</p>
                        </div>
                      </div>
                      <Switch 
                        checked={true}
                        onCheckedChange={(checked) => {
                          // TODO: Handle plugin toggle
                        }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="low-stock-threshold">Alert Threshold</Label>
                        <Input
                          id="low-stock-threshold"
                          type="number"
                          placeholder="5"
                          defaultValue="5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="alert-email">Alert Email</Label>
                        <Input
                          id="alert-email"
                          type="email"
                          placeholder="alerts@yourdomain.com"
                          defaultValue="admin@yourdomain.com"
                        />
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

              </div>

              <Separator />

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Puzzle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900">Need a Custom Plugin?</h3>
                    <p className="text-sm text-blue-800 mt-1">
                      Contact our development team to create custom integrations for your specific business needs.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 border-blue-200">
                      Request Custom Plugin
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => {}} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Plugin Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invite New User</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteUser} disabled={saving || !inviteEmail.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {tenantUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Invite users to help manage your store.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tenantUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {user.user?.email || `Pending invitation (${user.user_id})`}
                          </span>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          {!user.is_active && (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          Invited {new Date(user.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={user.role} 
                          onValueChange={(value) => updateUserRole(user.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove this team member? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeUser(user.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subscription Tier</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {tenant.subscription_tier}
                  </Badge>
                  <span className="text-sm text-gray-500">Plan</span>
                </div>
              </div>
              <div>
                <Label>Store Status</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={tenant.is_active ? "default" : "secondary"}>
                    {tenant.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Created</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(tenant.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-red-600">Delete Store</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Permanently delete your store and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Store
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Store</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your store "{tenant.name}" and all associated data including products, orders, and customers. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Store
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Settings, 
  Store, 
  Palette, 
  Users, 
  Shield, 
  CreditCard,
  Cog,
  Puzzle,
  ChevronDown
} from 'lucide-react'

// Import hooks
import { 
  useStoreSettings, 
  useThemeSettings, 
  usePaymentSettings, 
  usePluginFeatures,
  useTenantUsers 
} from '@/lib/hooks/use-settings'

// Import components
import { 
  StoreInformationTab, 
  ConfigurationTab, 
  ThemeTab,
  PaymentsTab,
  PluginsTab,
  UsersTab,
  SecurityTab
} from '@/components/admin/settings'
import { SettingsMessage } from '@/components/admin/settings/settings-message'
import { useSettings } from '@/lib/contexts/settings-context'

interface SettingsContentProps {
  tenant: any
  searchParams: URLSearchParams
  router: any
}

export function SettingsContent({ tenant, searchParams, router }: SettingsContentProps) {
  const t = useTranslations('settings')
  const { state, setSaving, showSuccess, showError } = useSettings()
  const supabase = createClient()
  
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'store')

  // Custom hooks
  const storeSettings = useStoreSettings()
  const themeSettings = useThemeSettings()
  const paymentSettings = usePaymentSettings()
  const pluginFeatures = usePluginFeatures()
  const tenantUsers = useTenantUsers()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Update URL when tab changes (only when user changes tab, not on initial load)
  useEffect(() => {
    if (!mounted) return
    
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
  }, [activeTab, mounted, searchParams, router])

  // Initialize activeTab from URL on mount only
  useEffect(() => {
    if (mounted) {
      const tabFromUrl = searchParams.get('tab') || 'store'
      setActiveTab(tabFromUrl)
    }
  }, [mounted, searchParams])

  const handlePasswordReset = async () => {
    try {
      setSaving(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(
        tenant.contact_email || '',
        {
          redirectTo: `${window.location.origin}/admin/reset-password`
        }
      )

      if (error) throw error

      showSuccess('Password reset email sent successfully!')
    } catch (error) {
      console.error('Error sending password reset:', error)
      showError('Failed to send password reset email')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setSaving(true)
      await supabase.auth.signOut()
      window.location.href = '/login'
    } catch (error) {
      console.error('Error signing out:', error)
      showError('Failed to sign out')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStore = async () => {
    // TODO: Implement delete store functionality
    showError('Delete store functionality not yet implemented')
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default'
      case 'admin': return 'secondary'
      case 'staff': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8 text-gray-600" />
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
      </div>

      {/* Message */}
      <SettingsMessage />

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Mobile: Dropdown Navigation */}
        <div className="block md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store">
                <div className="flex items-center space-x-2">
                  <Store className="h-4 w-4" />
                  <span>{t('tabs.store')}</span>
                </div>
              </SelectItem>
              <SelectItem value="config">
                <div className="flex items-center space-x-2">
                  <Cog className="h-4 w-4" />
                  <span>{t('tabs.config')}</span>
                </div>
              </SelectItem>
              <SelectItem value="theme">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4" />
                  <span>{t('tabs.theme')}</span>
                </div>
              </SelectItem>
              <SelectItem value="payments">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>{t('tabs.payments')}</span>
                </div>
              </SelectItem>
              {pluginFeatures.hasAnyPlugins && (
                <SelectItem value="plugins">
                  <div className="flex items-center space-x-2">
                    <Puzzle className="h-4 w-4" />
                    <span>{t('tabs.plugins')}</span>
                  </div>
                </SelectItem>
              )}
              <SelectItem value="users">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{t('tabs.users')}</span>
                </div>
              </SelectItem>
              <SelectItem value="security">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>{t('tabs.security')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Full Tab Navigation */}
        <div className="hidden md:block">
          <TabsList className={pluginFeatures.hasAnyPlugins ? "grid w-full grid-cols-7" : "grid w-full grid-cols-6"}>
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
            {pluginFeatures.hasAnyPlugins && (
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
        </div>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <StoreInformationTab
            tenant={tenant}
            settings={storeSettings.settings}
            onSettingsChange={storeSettings.setSettings}
            onSave={storeSettings.saveSettings}
            saving={state.saving}
          />
        </TabsContent>

        {/* Configuration Settings */}
        <TabsContent value="config" className="space-y-6">
          <ConfigurationTab
            settings={storeSettings.settings}
            onSettingsChange={storeSettings.setSettings}
            onSave={storeSettings.saveSettings}
            saving={state.saving}
          />
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <ThemeTab
            settings={themeSettings.settings}
            onSettingsChange={themeSettings.setSettings}
            onSave={themeSettings.saveSettings}
            saving={state.saving}
            tenantId={tenant.id}
          />
        </TabsContent>

        {/* Payment Methods Settings */}
        <TabsContent value="payments" className="space-y-6">
          <PaymentsTab
            paymentMethods={paymentSettings.paymentMethods}
            onPaymentMethodsChange={paymentSettings.setPaymentMethods}
            onSave={paymentSettings.saveSettings}
            saving={state.saving}
          />
        </TabsContent>

        {/* Plugins Management */}
        {pluginFeatures.hasAnyPlugins && (
          <TabsContent value="plugins" className="space-y-6">
            <PluginsTab tenant={tenant} />
          </TabsContent>
        )}

        {/* Users Management */}
        <TabsContent value="users" className="space-y-6">
          <UsersTab
            tenantUsers={tenantUsers.users}
            inviteEmail={tenantUsers.inviteEmail}
            inviteRole={tenantUsers.inviteRole}
            saving={state.saving}
            onInviteEmailChange={tenantUsers.setInviteEmail}
            onInviteRoleChange={tenantUsers.setInviteRole}
            onInviteUser={tenantUsers.inviteUser}
            onUpdateUserRole={tenantUsers.updateUserRole}
            onRemoveUser={tenantUsers.removeUser}
            getRoleBadgeVariant={getRoleBadgeVariant}
          />
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <SecurityTab
            tenant={tenant}
            saving={state.saving}
            onPasswordReset={handlePasswordReset}
            onSignOut={handleSignOut}
            onDeleteStore={handleDeleteStore}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
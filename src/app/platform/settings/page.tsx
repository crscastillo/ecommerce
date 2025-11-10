'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getPlatformAdminEmail } from '@/lib/actions/admin-check'
import { 
  Settings,
  Save,
  Globe,
  Mail,
  Shield,
  Database,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface PlatformSettings {
  platform_name: string
  platform_description: string
  platform_url: string
  support_email: string
  max_tenants_per_user: number
  default_subscription_tier: string
  maintenance_mode: boolean
  new_registrations_enabled: boolean
  email_notifications_enabled: boolean
  analytics_enabled: boolean
}

interface DatabaseConfig {
  max_connections: number
  backup_frequency: string
  retention_days: number
}

interface SecuritySettings {
  require_email_verification: boolean
  max_login_attempts: number
  session_timeout_hours: number
  password_min_length: number
  enable_2fa: boolean
}

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    platform_name: 'Aluro Platform',
    platform_description: 'Multi-tenant ecommerce platform',
    platform_url: 'https://aluro.shop',
    support_email: 'support@aluro.shop',
    max_tenants_per_user: 5,
    default_subscription_tier: 'basic',
    maintenance_mode: false,
    new_registrations_enabled: true,
    email_notifications_enabled: true,
    analytics_enabled: true
  })
  
  const [databaseConfig, setDatabaseConfig] = useState<DatabaseConfig>({
    max_connections: 100,
    backup_frequency: 'daily',
    retention_days: 30
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    require_email_verification: true,
    max_login_attempts: 5,
    session_timeout_hours: 24,
    password_min_length: 8,
    enable_2fa: false
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [showSecrets, setShowSecrets] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
    loadAdminEmail()
  }, [])

  const loadAdminEmail = async () => {
    try {
      const email = await getPlatformAdminEmail()
      setAdminEmail(email)
    } catch (error) {
      console.error('Error loading admin email:', error)
      setAdminEmail('error-loading-email')
    }
  }

  const loadSettings = async () => {
    try {
      // In a real implementation, you'd load these from a platform_settings table
      // For now, we'll use localStorage as a demo
      const saved = localStorage.getItem('platform_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        setSettings(parsed.settings || settings)
        setDatabaseConfig(parsed.database || databaseConfig)
        setSecuritySettings(parsed.security || securitySettings)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setMessage('')

      // In a real implementation, you'd save to database
      const toSave = {
        settings,
        database: databaseConfig,
        security: securitySettings,
        updated_at: new Date().toISOString()
      }
      
      localStorage.setItem('platform_settings', JSON.stringify(toSave))

      setMessage('Settings saved successfully!')
      setMessageType('success')
    } catch (err: any) {
      console.error('Error saving settings:', err)
      setMessage(err.message || 'Failed to save settings')
      setMessageType('error')
    } finally {
      setSaving(false)
    }
  }

  const handleSettingsChange = (key: keyof PlatformSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleDatabaseChange = (key: keyof DatabaseConfig, value: any) => {
    setDatabaseConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleSecurityChange = (key: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
            <p className="text-gray-600">Configure global platform settings and preferences</p>
          </div>
        </div>
        
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {messageType === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Information</CardTitle>
              <CardDescription>
                Basic platform configuration and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platform_name">Platform Name</Label>
                <Input
                  id="platform_name"
                  value={settings.platform_name}
                  onChange={(e) => handleSettingsChange('platform_name', e.target.value)}
                  placeholder="Your Platform Name"
                />
              </div>

              <div>
                <Label htmlFor="platform_description">Description</Label>
                <Textarea
                  id="platform_description"
                  value={settings.platform_description}
                  onChange={(e) => handleSettingsChange('platform_description', e.target.value)}
                  placeholder="Brief description of your platform"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="platform_url">Platform URL</Label>
                <Input
                  id="platform_url"
                  type="url"
                  value={settings.platform_url}
                  onChange={(e) => handleSettingsChange('platform_url', e.target.value)}
                  placeholder="https://yourdomain.com"
                />
              </div>

              <div>
                <Label htmlFor="support_email">Support Email</Label>
                <Input
                  id="support_email"
                  type="email"
                  value={settings.support_email}
                  onChange={(e) => handleSettingsChange('support_email', e.target.value)}
                  placeholder="support@yourdomain.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Limits</CardTitle>
              <CardDescription>
                Configure limits and defaults for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max_tenants">Max Tenants per User</Label>
                <Input
                  id="max_tenants"
                  type="number"
                  value={settings.max_tenants_per_user}
                  onChange={(e) => handleSettingsChange('max_tenants_per_user', parseInt(e.target.value))}
                  min="1"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum number of stores a user can create
                </p>
              </div>

              <div>
                <Label htmlFor="default_tier">Default Subscription Tier</Label>
                <select
                  id="default_tier"
                  className="w-full p-2 border rounded-md"
                  value={settings.default_subscription_tier}
                  onChange={(e) => handleSettingsChange('default_subscription_tier', e.target.value)}
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Controls</CardTitle>
              <CardDescription>
                Global switches for platform functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-xs text-gray-500">
                    Temporarily disable access to all tenant stores
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => handleSettingsChange('maintenance_mode', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Registrations</Label>
                  <p className="text-xs text-gray-500">
                    Allow new users to create accounts and tenants
                  </p>
                </div>
                <Switch
                  checked={settings.new_registrations_enabled}
                  onCheckedChange={(checked) => handleSettingsChange('new_registrations_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-gray-500">
                    Send platform notifications to admins
                  </p>
                </div>
                <Switch
                  checked={settings.email_notifications_enabled}
                  onCheckedChange={(checked) => handleSettingsChange('email_notifications_enabled', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics Tracking</Label>
                  <p className="text-xs text-gray-500">
                    Collect usage analytics for platform improvement
                  </p>
                </div>
                <Switch
                  checked={settings.analytics_enabled}
                  onCheckedChange={(checked) => handleSettingsChange('analytics_enabled', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure security and authentication requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-xs text-gray-500">
                    Users must verify email before accessing platform
                  </p>
                </div>
                <Switch
                  checked={securitySettings.require_email_verification}
                  onCheckedChange={(checked) => handleSecurityChange('require_email_verification', checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  value={securitySettings.max_login_attempts}
                  onChange={(e) => handleSecurityChange('max_login_attempts', parseInt(e.target.value))}
                  min="3"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lock account after this many failed attempts
                </p>
              </div>

              <div>
                <Label htmlFor="session_timeout">Session Timeout (hours)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  value={securitySettings.session_timeout_hours}
                  onChange={(e) => handleSecurityChange('session_timeout_hours', parseInt(e.target.value))}
                  min="1"
                  max="168"
                />
              </div>

              <div>
                <Label htmlFor="password_min_length">Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  value={securitySettings.password_min_length}
                  onChange={(e) => handleSecurityChange('password_min_length', parseInt(e.target.value))}
                  min="6"
                  max="20"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-500">
                    Require 2FA for platform admin access
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Coming Soon</Badge>
                  <Switch
                    checked={securitySettings.enable_2fa}
                    onCheckedChange={(checked) => handleSecurityChange('enable_2fa', checked)}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Database performance and backup settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="max_connections">Max Database Connections</Label>
                <Input
                  id="max_connections"
                  type="number"
                  value={databaseConfig.max_connections}
                  onChange={(e) => handleDatabaseChange('max_connections', parseInt(e.target.value))}
                  min="50"
                  max="1000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum concurrent database connections
                </p>
              </div>

              <div>
                <Label htmlFor="backup_frequency">Backup Frequency</Label>
                <select
                  id="backup_frequency"
                  className="w-full p-2 border rounded-md"
                  value={databaseConfig.backup_frequency}
                  onChange={(e) => handleDatabaseChange('backup_frequency', e.target.value)}
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="retention_days">Backup Retention (days)</Label>
                <Input
                  id="retention_days"
                  type="number"
                  value={databaseConfig.retention_days}
                  onChange={(e) => handleDatabaseChange('retention_days', parseInt(e.target.value))}
                  min="7"
                  max="365"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
              <CardDescription>
                Current database health and statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connection Status</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connected</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Connections</span>
                <span className="text-sm">45 / {databaseConfig.max_connections}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Backup</span>
                <span className="text-sm">{new Date().toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Size</span>
                <span className="text-sm">2.3 GB</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Current platform environment configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Show Sensitive Values</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecrets(!showSecrets)}
                >
                  {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Supabase URL</Label>
                  <Input
                    value={process.env.NEXT_PUBLIC_SUPABASE_URL || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label>Platform Domain</Label>
                  <Input
                    value={process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'localhost:3000'}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label>Stripe Publishable Key</Label>
                  <Input
                    type={showSecrets ? 'text' : 'password'}
                    value={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <Label>Platform Admin Email</Label>
                  <Input
                    value={adminEmail || 'Loading...'}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Important</span>
                </div>
                <p className="text-xs text-yellow-700">
                  Environment variables are read-only from this interface. 
                  Update them in your deployment configuration or .env files.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
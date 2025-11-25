// Database types
export interface Tenant {
  id: string
  name: string
  subdomain: string
  domain?: string
  description?: string
  logo_url?: string
  theme_config?: Record<string, any>
  contact_email?: string
  contact_phone?: string
  address?: Record<string, any>
  settings?: Record<string, any>
  subscription_tier: 'basic' | 'pro' | 'enterprise'
  is_active: boolean
  owner_id: string
  country?: string
  language?: string
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: 'owner' | 'admin' | 'staff'
  permissions: Record<string, any>
  is_active: boolean
  invited_at: string
  accepted_at?: string
  user?: {
    email: string
    full_name?: string
  }
}

// Settings interfaces
export interface StoreSettings {
  name: string
  description: string
  contact_email: string
  contact_phone: string
  country: string
  admin_language: string
  store_language: string
  address: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  settings: {
    currency: string
    timezone: string
    tax_rate: number
    shipping_enabled: boolean
    inventory_tracking: boolean
    allow_backorders: boolean
    auto_fulfill_orders: boolean
    email_notifications: boolean
    sms_notifications: boolean
    low_stock_threshold: number
  }
}

export interface ThemeSettings {
  admin_theme: string
  store_theme: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  logo_url: string
  favicon_url: string
  hero_background_type?: 'color' | 'image'
  hero_background_value?: string
}

export interface PaymentKeys {
  publishableKey?: string
  secretKey?: string
  webhookSecret?: string
}

export interface BankDetails {
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  instructions?: string
  phoneNumber?: string // For mobile bank transfer
}

export interface PaymentMethodConfig {
  id: string
  name: string
  enabled: boolean
  requiresKeys: boolean
  keys?: PaymentKeys
  metadata?: Record<string, any>
  bankDetails?: BankDetails
  description?: string
  fees?: string
}

export type PaymentSettings = PaymentMethodConfig[]

// Security settings
export interface SecuritySettings {
  two_factor_enabled: boolean
  session_timeout: number
  password_requirements: {
    min_length: number
    require_uppercase: boolean
    require_lowercase: boolean
    require_numbers: boolean
    require_symbols: boolean
  }
  allowed_domains: string[]
  ip_restrictions: string[]
}

// Plugin settings
export interface PluginSettings {
  google_analytics?: {
    enabled: boolean
    tracking_id?: string
  }
  facebook_pixel?: {
    enabled: boolean
    pixel_id?: string
  }
  mailchimp?: {
    enabled: boolean
    api_key?: string
    list_id?: string
  }
  whatsapp?: {
    enabled: boolean
    phone_number?: string
    welcome_message?: string
  }
}

// Form validation types
export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Settings form props
export interface SettingsTabProps {
  saving?: boolean
  onSave?: () => Promise<void> | void
}

export interface StoreSettingsTabProps extends SettingsTabProps {
  tenant: Tenant
  settings: StoreSettings
  onSettingsChange: (settings: StoreSettings) => void
}

export interface ThemeSettingsTabProps extends SettingsTabProps {
  settings: ThemeSettings
  onSettingsChange: (settings: ThemeSettings) => void
  tenantId: string
}

export interface PaymentSettingsTabProps extends SettingsTabProps {
  paymentMethods: PaymentSettings
  onPaymentMethodsChange: (methods: PaymentSettings) => void
}

export interface UsersTabProps extends SettingsTabProps {
  tenantUsers: TenantUser[]
  inviteEmail: string
  inviteRole: string
  onInviteEmailChange: (email: string) => void
  onInviteRoleChange: (role: string) => void
  onInviteUser: () => Promise<void> | void
  onUpdateUserRole: (userId: string, role: string) => Promise<void> | void
  onRemoveUser: (userId: string) => Promise<void> | void
  getRoleBadgeVariant: (role: string) => string
}

export interface SecurityTabProps extends SettingsTabProps {
  tenant: Tenant
  onPasswordReset: () => Promise<void> | void
  onSignOut: () => Promise<void> | void
  onDeleteStore: () => Promise<void> | void
}

export interface PluginsTabProps {
  tenant: Tenant
}

// Hook return types
export interface UseStoreSettingsReturn {
  settings: StoreSettings
  setSettings: (settings: StoreSettings) => void
  saveSettings: () => Promise<void>
}

export interface UseThemeSettingsReturn {
  settings: ThemeSettings
  setSettings: (settings: ThemeSettings) => void
  saveSettings: () => Promise<void>
}

export interface UsePaymentSettingsReturn {
  paymentMethods: PaymentSettings
  setPaymentMethods: (methods: PaymentSettings) => void
  saveSettings: () => Promise<void>
}

export interface UseTenantUsersReturn {
  users: TenantUser[]
  inviteEmail: string
  setInviteEmail: (email: string) => void
  inviteRole: string
  setInviteRole: (role: string) => void
  inviteUser: () => Promise<void>
  updateUserRole: (userId: string, role: string) => Promise<void>
  removeUser: (userId: string) => Promise<void>
}

export interface UsePluginFeaturesReturn {
  pluginFeatures: Record<string, boolean>
  loaded: boolean
  hasAnyPlugins: boolean
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaymentMethodValidation {
  valid: boolean
  message: string
}

// Constants
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡' },
] as const

export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'GB', name: 'United Kingdom' },
] as const

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
] as const

export const SUPPORTED_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Costa_Rica',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
] as const

export const USER_ROLES = [
  { value: 'owner', label: 'Owner', description: 'Full access to all features' },
  { value: 'admin', label: 'Administrator', description: 'Manage store and users' },
  { value: 'staff', label: 'Staff', description: 'Basic store management' },
] as const

export const THEME_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'modern', label: 'Modern' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimal', label: 'Minimal' },
] as const
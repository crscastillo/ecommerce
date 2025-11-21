// Settings Page Components
export { StoreInformationTab } from './store-information-tab'
export { ConfigurationTab } from './configuration-tab'
export { StoreConfigTab } from './store-config-tab'
export { ThemeTab } from './theme-tab'
export { PaymentsTab } from './payments-tab'
export { PluginsTab } from './plugins-tab'
export { UsersTab } from './users-tab'
export { SecurityTab } from './security-tab'

// Settings Components
export { SettingsMessage } from './settings-message'
export { SettingsContent } from './settings-content'

// Shared Settings Types
export interface StoreSettings {
  name: string
  description: string
  contact_email: string
  contact_phone: string
  country: string
  admin_language: string
  store_language: string
  address: Record<string, any>
  settings: Record<string, any>
}

export interface ThemeSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  logo_url: string
  favicon_url: string
  custom_css: string
  hero_background_type?: 'color' | 'image'
  hero_background_value?: string
  admin_theme?: string
  store_theme?: string
}

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
  bankDetails?: {
    bankName?: string
    accountNumber?: string
    accountHolder?: string
    instructions?: string
    phoneNumber?: string // For mobile bank transfer
  }
}

export type PaymentSettings = PaymentMethodConfig[]

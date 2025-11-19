// Settings Page Components
export { StoreInformationTab } from './store-information-tab'
export { ConfigurationTab } from './configuration-tab'
export { StoreConfigTab } from './store-config-tab'
export { ThemeTab } from './theme-tab'
export { PaymentsTab } from './payments-tab'
export { PluginsTab } from './plugins-tab'
export { UsersTab } from './users-tab'
export { SecurityTab } from './security-tab'
// TODO: Create remaining components
// export { PaymentsTab } from './payments-tab'
// export { PluginsTab } from './plugins-tab'
// export { UsersTab } from './users-tab'
// export { SecurityTab } from './security-tab'

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

export interface PaymentSettings {
  cash_on_delivery: {
    enabled: boolean
  }
  stripe: {
    enabled: boolean
    stripe_publishable_key?: string
    stripe_secret_key?: string
  }
  tilopay: {
    enabled: boolean
    tilopay_api_key?: string
    tilopay_secret_key?: string
  }
  bank_transfer: {
    enabled: boolean
    bank_name?: string
    account_number?: string
    account_holder?: string
    instructions?: string
  }
  mobile_bank_transfer: {
    enabled: boolean
    phone_number?: string
    instructions?: string
  }
}

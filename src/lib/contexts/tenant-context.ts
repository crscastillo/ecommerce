import { createContext, useContext } from 'react'

export interface Tenant {
  id: string
  name: string
  subdomain: string
  domain?: string
  description?: string
  logo_url?: string
  theme_config: Record<string, any>
  contact_email?: string
  contact_phone?: string
  address?: Record<string, any>
  settings: Record<string, any>
  subscription_tier: string
  is_active: boolean
  owner_id: string
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: 'owner' | 'admin' | 'staff' | 'viewer'
  permissions: Record<string, any>
  is_active: boolean
}

export interface TenantContextType {
  tenant: Tenant | null
  tenantUser: TenantUser | null
  isLoading: boolean
  error: string | null
  isOwner: boolean
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
  refreshTenant: () => Promise<void>
}

export const TenantContext = createContext<TenantContextType | null>(null)

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
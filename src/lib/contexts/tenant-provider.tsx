'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TenantContext, Tenant, TenantUser, TenantContextType } from '@/lib/contexts/tenant-context'

// Hook to get current user from Supabase
function useUser() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [supabase])
  
  return user
}

interface TenantProviderProps {
  children: ReactNode
  initialTenant?: Tenant | null
}

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(initialTenant || null)
  const [tenantUser, setTenantUser] = useState<TenantUser | null>(null)
  const [isLoading, setIsLoading] = useState(!initialTenant)
  const [error, setError] = useState<string | null>(null)
  
  const user = useUser()
  const supabase = createClient()

  const getTenantFromHeaders = (): { tenantId: string | null; subdomain: string | null } => {
    // In a real app, this would come from server-side headers
    // For now, extract from window location
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const subdomain = extractSubdomain(hostname)
      
      // You might store tenant ID in a meta tag or fetch it
      const tenantId = document.querySelector('meta[name="tenant-id"]')?.getAttribute('content') || null
      
      return { tenantId, subdomain }
    }
    return { tenantId: null, subdomain: null }
  }

  const extractSubdomain = (hostname: string): string | null => {
    const host = hostname.split(':')[0]
    const mainDomains = ['localhost', 'yourdomain.com', 'yourdomain.vercel.app']
    
    if (mainDomains.some(domain => host === domain || host === `www.${domain}`)) {
      return null
    }
    
    const parts = host.split('.')
    if (parts.length > 2) {
      return parts[0]
    }
    
    if (host.includes('.localhost') && parts.length > 1) {
      return parts[0]
    }
    
    return null
  }

  const loadTenant = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { subdomain } = getTenantFromHeaders()
      
      // Check if we're in an admin route - if so, try to load user's primary tenant
      const isAdminRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')
      
      // For admin routes, always try to get a tenant (real or demo)
      if (isAdminRoute) {
        if (user) {
          const { data: userTenants, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_active', true)
            .limit(1)
            .single()

          if (!tenantsError && userTenants) {
            setTenant(userTenants)
            setTenantUser(null)
            return
          }
        }

        // Fallback to demo tenant for admin routes in development
        if (process.env.NODE_ENV === 'development') {
          const demoTenant: Tenant = {
            id: 'demo-tenant-uuid-123e4567-e89b-12d3-a456-426614174000',
            name: 'Demo Store',
            subdomain: 'demo',
            domain: undefined,
            description: 'Demo store for testing',
            logo_url: undefined,
            theme_config: {},
            contact_email: 'demo@example.com',
            contact_phone: undefined,
            address: undefined,
            settings: {},
            subscription_tier: 'basic',
            is_active: true,
            owner_id: user?.id || 'demo-user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setTenant(demoTenant)
          setTenantUser(null)
          return
        }
        
        // In production, if user has no tenant and is trying to access admin,
        // redirect them to signup to create a tenant
        if (user && typeof window !== 'undefined') {
          window.location.href = '/signup'
          return
        }
        
        setTenant(null)
        setTenantUser(null)
        return
      }

      // For non-admin routes, only load tenant if there's a real subdomain
      if (!subdomain) {
        // No subdomain = platform pages, don't create demo tenant
        setTenant(null)
        setTenantUser(null)
        return
      }

      // Fetch tenant data
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenants')
        .select('*')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .single()

      if (tenantError) {
        throw new Error(`Tenant not found: ${tenantError.message}`)
      }

      setTenant(tenantData)

      // Fetch tenant user relationship if user is logged in
      if (user && tenantData) {
        const { data: tenantUserData } = await supabase
          .from('tenant_users')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        setTenantUser(tenantUserData || null)
      } else {
        setTenantUser(null)
      }
    } catch (err) {
      console.error('Error loading tenant:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tenant')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshTenant = async () => {
    await loadTenant()
  }

  // Load tenant on mount and when user changes
  useEffect(() => {
    loadTenant()
  }, [user?.id])

  const isOwner = Boolean(tenant && user && tenant.owner_id === user.id)
  const isAdmin = Boolean(tenantUser?.role === 'admin' || isOwner)

  const hasPermission = (permission: string): boolean => {
    if (isOwner) return true
    if (tenantUser?.role === 'admin') return true
    
    // Check specific permissions
    return Boolean(tenantUser?.permissions?.[permission])
  }

  const contextValue: TenantContextType = {
    tenant,
    tenantUser,
    isLoading,
    error,
    isOwner,
    isAdmin,
    hasPermission,
    refreshTenant,
  }

  return (
    <TenantContext.Provider value={contextValue}>
      {children}
    </TenantContext.Provider>
  )
}
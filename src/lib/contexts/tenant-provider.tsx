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
      
      // For admin routes, prioritize subdomain tenant if present, otherwise fallback to user's tenant
      if (isAdminRoute) {
        if (user) {
          // If we have a subdomain, try to load that specific tenant first
          if (subdomain) {
            const { data: subdomainTenant, error: subdomainError } = await supabase
              .from('tenants')
              .select('*')
              .eq('subdomain', subdomain)
              .eq('is_active', true)
              .maybeSingle()

            if (!subdomainError && subdomainTenant) {
              // Check if user has access to this tenant
              const isOwner = subdomainTenant.owner_id === user.id
              
              if (isOwner) {
                setTenant(subdomainTenant)
                setTenantUser(null)
                return
              }

              // Check if user is a member of this tenant
              const { data: memberCheck } = await supabase
                .from('tenant_users')
                .select('*')
                .eq('tenant_id', subdomainTenant.id)
                .eq('user_id', user.id)
                .eq('is_active', true)
                .maybeSingle()

              if (memberCheck) {
                setTenant(subdomainTenant)
                setTenantUser(memberCheck)
                return
              }

              // User doesn't have access to this tenant, redirect to unauthorized
              if (typeof window !== 'undefined') {
                window.location.href = '/admin/unauthorized'
                return
              }
            }
          }

          // Fallback: load user's first owned tenant if no subdomain or subdomain access failed
          const { data: userTenants, error: tenantsError } = await supabase
            .from('tenants')
            .select('*')
            .eq('owner_id', user.id)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle()

          if (!tenantsError && userTenants) {
            // If we're on the main domain (no subdomain) and user has a tenant,
            // redirect them to their tenant's subdomain admin
            if (!subdomain && typeof window !== 'undefined') {
              const currentHostname = window.location.hostname
              const currentPort = window.location.port
              const protocol = window.location.protocol
              
              // Build the tenant subdomain URL
              let tenantHostname: string
              
              if (currentHostname === 'localhost') {
                // Development: redirect to tenant.localhost:3000
                tenantHostname = `${userTenants.subdomain}.localhost`
              } else if (currentHostname.endsWith('.vercel.app')) {
                // Vercel: redirect to tenant.project.vercel.app
                tenantHostname = `${userTenants.subdomain}.${currentHostname}`
              } else {
                // Production: redirect to tenant.yourdomain.com
                tenantHostname = `${userTenants.subdomain}.${currentHostname}`
              }
              
              const portSuffix = currentPort ? `:${currentPort}` : ''
              const redirectUrl = `${protocol}//${tenantHostname}${portSuffix}/admin`
              
              console.log('Redirecting to tenant subdomain:', redirectUrl)
              window.location.href = redirectUrl
              return
            }
            
            setTenant(userTenants)
            setTenantUser(null)
            return
          }

          // If user doesn't own any tenants, check if they're a member of any tenant
          if (!subdomain) {
            const { data: memberTenants, error: memberError } = await supabase
              .from('tenant_users')
              .select(`
                *,
                tenants:tenant_id (
                  id,
                  name,
                  subdomain,
                  description,
                  logo_url,
                  theme_config,
                  contact_email,
                  contact_phone,
                  address,
                  settings,
                  subscription_tier,
                  is_active,
                  owner_id,
                  created_at,
                  updated_at
                )
              `)
              .eq('user_id', user.id)
              .eq('is_active', true)
              .limit(1)
              .maybeSingle()

            if (!memberError && memberTenants && memberTenants.tenants) {
              const memberTenant = memberTenants.tenants
              
              // Redirect to the tenant subdomain they're a member of
              if (typeof window !== 'undefined') {
                const currentHostname = window.location.hostname
                const currentPort = window.location.port
                const protocol = window.location.protocol
                
                let tenantHostname: string
                
                if (currentHostname === 'localhost') {
                  tenantHostname = `${memberTenant.subdomain}.localhost`
                } else if (currentHostname.endsWith('.vercel.app')) {
                  tenantHostname = `${memberTenant.subdomain}.${currentHostname}`
                } else {
                  tenantHostname = `${memberTenant.subdomain}.${currentHostname}`
                }
                
                const portSuffix = currentPort ? `:${currentPort}` : ''
                const redirectUrl = `${protocol}//${tenantHostname}${portSuffix}/admin`
                
                console.log('Redirecting to member tenant subdomain:', redirectUrl)
                window.location.href = redirectUrl
                return
              }
            }
          }
        }

        // If user has no tenant and is trying to access admin,
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
      // Use Next.js API route for tenant fetch
      const response = await fetch(`/api/tenant?subdomain=${subdomain}`)
      const result = await response.json()
      if (!response.ok || !result.data) {
        throw new Error(result.error || `Tenant not found for subdomain: ${subdomain}`)
      }
      setTenant(result.data)

      // Fetch tenant user relationship if user is logged in
      if (user && result.data) {
        const { data: tenantUserData } = await supabase
          .from('tenant_users')
          .select('*')
          .eq('tenant_id', result.data.id)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle()

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
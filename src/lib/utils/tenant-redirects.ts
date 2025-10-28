import { createClient } from '@/lib/supabase/client'

export interface TenantRedirectOptions {
  fallbackPath?: string
  onError?: (error: any) => void
}

/**
 * Redirects an authenticated user to their tenant's admin panel
 * Checks owned tenants first, then team memberships
 */
export const redirectToUserTenantAdmin = async (
  user: any, 
  options: TenantRedirectOptions = {}
) => {
  const { fallbackPath = '/signup', onError } = options
  const supabase = createClient()

  try {
    // First try to get user's owned tenant
    const { data: userTenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!tenantsError && userTenants) {
      redirectToTenantSubdomain(userTenants.subdomain)
      return
    }

    // If no owned tenants, check if user is a member of any tenant
    const { data: memberTenants, error: memberError } = await supabase
      .from('tenant_users')
      .select(`
        *,
        tenants:tenant_id (
          subdomain
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!memberError && memberTenants && memberTenants.tenants) {
      redirectToTenantSubdomain(memberTenants.tenants.subdomain)
      return
    }

    // No tenant access, redirect to fallback
    window.location.href = fallbackPath
  } catch (error) {
    console.error('Error checking user tenants:', error)
    if (onError) {
      onError(error)
    } else {
      window.location.href = fallbackPath
    }
  }
}

/**
 * Redirects to a specific tenant's subdomain admin panel
 */
export const redirectToTenantSubdomain = (subdomain: string, path: string = '/admin') => {
  if (typeof window === 'undefined') {
    console.warn('redirectToTenantSubdomain called on server side')
    return
  }

  const currentHostname = window.location.hostname
  const currentPort = window.location.port
  const protocol = window.location.protocol
  
  // Check if we're already on the target subdomain to prevent infinite loops
  const currentSubdomain = extractSubdomain(currentHostname)
  if (currentSubdomain === subdomain) {
    console.log('Already on target subdomain, redirecting to admin path')
    window.location.href = path
    return
  }
  
  let tenantHostname: string
  
  if (currentHostname === 'localhost') {
    tenantHostname = `${subdomain}.localhost`
  } else if (currentHostname.endsWith('.vercel.app')) {
    tenantHostname = `${subdomain}.${currentHostname}`
  } else if (currentHostname === 'aluro.shop' || currentHostname === 'www.aluro.shop') {
    // Production domain
    tenantHostname = `${subdomain}.aluro.shop`
  } else {
    tenantHostname = `${subdomain}.${currentHostname}`
  }
  
  const portSuffix = currentPort ? `:${currentPort}` : ''
  const redirectUrl = `${protocol}//${tenantHostname}${portSuffix}${path}`
  
  console.log('Redirecting to tenant subdomain:', redirectUrl)
  
  // Add a small delay to prevent rapid redirects
  setTimeout(() => {
    window.location.href = redirectUrl
  }, 100)
}

/**
 * Extracts subdomain from hostname
 */
export const extractSubdomain = (hostname: string): string | null => {
  if (!hostname) return null
  
  const host = hostname.split(':')[0]
  
  // If it's just localhost, no subdomain
  if (host === 'localhost') return null
  
  // Handle production domain (aluro.shop)
  if (host === 'aluro.shop' || host === 'www.aluro.shop') {
    return null // Main domain
  }
  
  if (host.endsWith('.aluro.shop')) {
    const parts = host.split('.')
    if (parts.length >= 3) {
      return parts[0] // Extract subdomain from subdomain.aluro.shop
    }
  }
  
  // Handle Vercel deployments
  if (host.endsWith('.vercel.app')) {
    const parts = host.split('.')
    if (parts.length > 3) {
      return parts[0]
    }
  }
  
  // Handle localhost subdomains like tenant.localhost
  if (host.endsWith('.localhost')) {
    const parts = host.split('.')
    if (parts.length === 2) {
      return parts[0]
    }
  }
  
  // Handle regular domains
  const parts = host.split('.')
  if (parts.length > 2) {
    return parts[0]
  }
  
  return null
}
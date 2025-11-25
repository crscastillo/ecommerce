import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export interface TenantDomainConfig {
  id: string
  name: string
  subdomain: string
  domain?: string
  is_active: boolean
}

/**
 * Service for managing tenant domain configurations
 */
export class TenantDomainService {
  private supabase: any

  constructor(useServerClient = false) {
    if (useServerClient) {
      // For server-side usage, create client directly
      this.supabase = createServerClient()
    } else {
      // For client-side usage
      this.supabase = createClient()
    }
  }

  /**
   * Get tenant by subdomain or custom domain
   */
  async getTenantByDomain(hostname: string): Promise<TenantDomainConfig | null> {
    // First try by custom domain
    const { data: domainTenant, error: domainError } = await this.supabase
      .from('tenants')
      .select('id, name, subdomain, domain, is_active')
      .eq('domain', hostname)
      .eq('is_active', true)
      .maybeSingle()

    if (domainTenant && !domainError) {
      return domainTenant
    }

    // Then try to extract subdomain and lookup
    const subdomain = this.extractSubdomain(hostname)
    if (subdomain) {
      const { data: subdomainTenant, error: subdomainError } = await this.supabase
        .from('tenants')
        .select('id, name, subdomain, domain, is_active')
        .eq('subdomain', subdomain)
        .eq('is_active', true)
        .maybeSingle()

      if (subdomainTenant && !subdomainError) {
        return subdomainTenant
      }
    }

    return null
  }

  /**
   * Update tenant custom domain
   */
  async updateTenantDomain(tenantId: string, domain: string | null): Promise<boolean> {
    try {
      // Validate domain format if provided
      if (domain && !this.isValidDomain(domain)) {
        throw new Error('Invalid domain format')
      }

      // Check if domain is already taken
      if (domain) {
        const existing = await this.getTenantByDomain(domain)
        if (existing && existing.id !== tenantId) {
          throw new Error('Domain is already taken by another tenant')
        }
      }

      const { error } = await this.supabase
        .from('tenants')
        .update({ domain })
        .eq('id', tenantId)

      return !error
    } catch (error) {
      console.error('Error updating tenant domain:', error)
      return false
    }
  }

  /**
   * Validate domain format
   */
  private isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return domainRegex.test(domain) && domain.length <= 253
  }

  /**
   * Extract subdomain from hostname
   */
  private extractSubdomain(hostname: string): string | null {
    const host = hostname.split(':')[0]
    
    // Get domains from environment or use defaults
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    
    // Handle production domain subdomains
    if (host.endsWith(`.${productionDomain}`)) {
      const parts = host.split('.')
      if (parts.length >= 3) {
        return parts[0]
      }
    }
    
    // Handle Vercel preview deployments
    if (host.endsWith('.vercel.app')) {
      const parts = host.split('.')
      if (parts.length > 3) {
        return parts[0]
      }
    }
    
    // Handle localhost development
    if (host.includes('.localhost') && host.split('.').length > 1) {
      return host.split('.')[0]
    }
    
    return null
  }

  /**
   * Get tenant access method (subdomain vs custom domain)
   */
  getTenantAccessMethod(hostname: string, tenant: TenantDomainConfig): 'subdomain' | 'custom-domain' {
    if (tenant.domain === hostname) {
      return 'custom-domain'
    }
    return 'subdomain'
  }

  /**
   * Generate the canonical URL for a tenant
   */
  getTenantCanonicalUrl(tenant: TenantDomainConfig): string {
    // Prefer custom domain if available
    if (tenant.domain) {
      return `https://${tenant.domain}`
    }
    
    // Fallback to subdomain
    const baseDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    return `https://${tenant.subdomain}.${baseDomain}`
  }

  /**
   * Check if a hostname is a platform domain (not a tenant domain)
   */
  isPlatformDomain(hostname: string): boolean {
    const host = hostname.split(':')[0]
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    
    const platformDomains = [
      'localhost',
      productionDomain,
      `www.${productionDomain}`
    ]
    
    return platformDomains.includes(host) || 
           (host.endsWith('.vercel.app') && host.split('.').length === 3) // Main Vercel domain
  }
}

export const tenantDomainService = new TenantDomainService()
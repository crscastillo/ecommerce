export interface DomainInfo {
  isOnSubdomain: boolean
  subdomain: string | null
  hostname: string
  isProduction: boolean
}

export function detectDomain(): DomainInfo {
  if (typeof window === 'undefined') {
    return {
      isOnSubdomain: false,
      subdomain: null,
      hostname: '',
      isProduction: false
    }
  }

  const currentHostname = window.location.hostname
  const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
  
  const isOnTenantSubdomain = 
    (currentHostname !== 'localhost' && currentHostname.includes('.localhost')) || // localhost subdomain
    (currentHostname.includes(`.${productionDomain}`) && currentHostname !== productionDomain) || // production subdomain
    (currentHostname.includes('.vercel.app') && currentHostname.split('.').length > 3) // vercel subdomain

  const subdomain = isOnTenantSubdomain ? extractSubdomain(currentHostname) : null
  
  return {
    isOnSubdomain: isOnTenantSubdomain,
    subdomain,
    hostname: currentHostname,
    isProduction: !currentHostname.includes('localhost')
  }
}

export function extractSubdomain(hostname: string): string | null {
  const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
  
  if (hostname.includes('.localhost')) {
    // Development: extract from tenant.localhost
    const parts = hostname.split('.')
    return parts[0] !== 'localhost' ? parts[0] : null
  }
  
  if (hostname.includes(`.${productionDomain}`)) {
    // Production: extract from tenant.domain.com
    const parts = hostname.split('.')
    return parts[0]
  }
  
  if (hostname.includes('.vercel.app')) {
    // Vercel: extract from tenant.project.vercel.app
    const parts = hostname.split('.')
    if (parts.length > 3) {
      return parts[0]
    }
  }
  
  return null
}

export function getMainDomainUrl(): string {
  if (typeof window === 'undefined') return ''
  
  const { hostname, isProduction } = detectDomain()
  const protocol = window.location.protocol
  const port = window.location.port
  
  if (isProduction) {
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    return `${protocol}//${productionDomain}`
  }
  
  const portSuffix = port ? `:${port}` : ''
  return `${protocol}//localhost${portSuffix}`
}
/**
 * Platform Configuration
 * Centralized configuration for platform branding and environment settings
 */

export const platformConfig = {
  // Platform branding
  name: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Aluro',
  
  // Domain configuration
  domain: {
    development: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000',
    production: process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop',
    current: process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'
  },

  // Get the appropriate domain based on environment
  getDomain: () => {
    if (process.env.NODE_ENV === 'production') {
      return platformConfig.domain.production
    }
    return platformConfig.domain.development
  },

  // Get full URL with protocol
  getFullDomain: (includeProtocol = true) => {
    const domain = platformConfig.getDomain()
    if (!includeProtocol) return domain
    
    if (domain.includes('localhost')) {
      return `http://${domain}`
    }
    return `https://${domain}`
  },

  // Generate subdomain URL
  getSubdomainUrl: (subdomain: string, includeProtocol = true) => {
    const domain = platformConfig.getDomain()
    
    if (domain.includes('localhost')) {
      // For localhost, we might need different handling
      // Could use different ports or URL parameters
      return includeProtocol ? `http://${domain}` : domain
    }
    
    const subdomainUrl = `${subdomain}.${domain}`
    return includeProtocol ? `https://${subdomainUrl}` : subdomainUrl
  },

  // SEO and meta information
  seo: {
    defaultTitle: process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Aluro',
    titleTemplate: `%s | ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Aluro'}`,
    description: `Create your online store with ${process.env.NEXT_PUBLIC_PLATFORM_NAME || 'Aluro'} - The modern ecommerce platform for businesses of all sizes.`,
    keywords: 'ecommerce, online store, store builder, multi-tenant, saas'
  },

  // Debug settings
  debug: {
    middleware: process.env.NEXT_PUBLIC_DEBUG_MIDDLEWARE === 'true'
  }
}

// Export individual values for convenience
export const PLATFORM_NAME = platformConfig.name
export const CURRENT_DOMAIN = platformConfig.getDomain()
export const FULL_DOMAIN = platformConfig.getFullDomain()
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { detectDomain } from '@/lib/utils/domain-detection'
import { TenantInfo } from '@/lib/hooks/use-auth'

interface UseTenantDetectionResult {
  tenantInfo: TenantInfo | null
  isOnSubdomain: boolean
  loading: boolean
  error: string | null
}

export function useTenantDetection(): UseTenantDetectionResult {
  const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null)
  const [isOnSubdomain, setIsOnSubdomain] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const detectTenant = async () => {
      try {
        const domainInfo = detectDomain()
        setIsOnSubdomain(domainInfo.isOnSubdomain)

        if (domainInfo.isOnSubdomain && domainInfo.subdomain) {
          // Fetch tenant information
          const { data, error: tenantError } = await supabase
            .from('tenants')
            .select('id, name, subdomain')
            .eq('subdomain', domainInfo.subdomain)
            .eq('is_active', true)
            .maybeSingle()

          if (tenantError) {
            setError(`Failed to load tenant: ${tenantError.message}`)
          } else if (data) {
            setTenantInfo(data)
          } else {
            setError('Tenant not found')
          }
        }
      } catch (err) {
        setError('Error detecting tenant')
      } finally {
        setLoading(false)
      }
    }

    detectTenant()
  }, [supabase])

  return {
    tenantInfo,
    isOnSubdomain,
    loading,
    error
  }
}
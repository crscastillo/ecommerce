'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { platformConfig } from '@/lib/config/platform'
import { Store, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { redirectToUserTenantAdmin } from '@/lib/utils/tenant-redirects'
import { useTranslations } from 'next-intl'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [message, setMessage] = useState('')
  const [isOnSubdomain, setIsOnSubdomain] = useState(false)
  const [tenantInfo, setTenantInfo] = useState<{name: string, subdomain: string, id: string} | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')

  // Check if user is already authenticated and detect subdomain on component mount
  useEffect(() => {
    const checkAuthAndDomain = async () => {
      try {
        // First, detect if we're on a subdomain
        const currentHostname = window.location.hostname
        const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
        const isOnTenantSubdomain = 
          (currentHostname !== 'localhost' && currentHostname.includes('.localhost')) || // localhost subdomain
          (currentHostname.includes(`.${productionDomain}`) && currentHostname !== productionDomain) || // production subdomain
          (currentHostname.includes('.vercel.app') && currentHostname.split('.').length > 3) // vercel subdomain
        
        setIsOnSubdomain(isOnTenantSubdomain)

        let currentTenantInfo = null
        if (isOnTenantSubdomain) {
          // Get tenant info for subdomain login
          const subdomain = extractSubdomain(currentHostname)
          if (!subdomain) {
            setMessage('Invalid subdomain detected.')
            setCheckingAuth(false)
            return
          }

          const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('name, subdomain, id')
            .eq('subdomain', subdomain)
            .eq('is_active', true)
            .maybeSingle()

          if (tenantError || !tenant) {
            setMessage('This tenant does not exist or is inactive.')
            setCheckingAuth(false)
            return
          }

          currentTenantInfo = { name: tenant.name, subdomain: tenant.subdomain, id: tenant.id }
          setTenantInfo(currentTenantInfo)
        }

        // Check authentication
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (!error && user) {
          if (isOnTenantSubdomain && currentTenantInfo) {
            // On subdomain - validate user has access to this specific tenant
            const hasAccess = await validateUserForTenant(user.id, currentTenantInfo.id)
            
            if (hasAccess) {
              router.push('/admin')
              return
            } else {
              // Sign out user since they don't have access to this tenant
              await supabase.auth.signOut()
              setMessage('You do not have access to this tenant.')
            }
          } else if (!isOnTenantSubdomain) {
            // On main domain - handle platform admin vs tenant user
            try {
              const response = await fetch('/api/auth/check-platform-admin')
              const { isPlatformAdmin } = await response.json()
              
              if (isPlatformAdmin) {
                router.push('/platform')
                return
              }
              
              // Redirect tenant users to their subdomain
              await redirectToUserTenantAdmin(user, {
                fallbackPath: '/signup',
                onError: (error) => {
                  console.error('Redirect failed:', error)
                  router.push('/signup')
                }
              })
              return
            } catch (error) {
              console.error('Error checking admin status:', error)
              setMessage('Error checking authentication. Please try again.')
            }
          }
        }
      } catch (error) {
        console.error('Auth/domain check failed:', error)
        setMessage('An error occurred during authentication check.')
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAuthAndDomain()
  }, [router, supabase])

  const extractSubdomain = (hostname: string): string | null => {
    if (!hostname) return null
    
    const host = hostname.split(':')[0]
    
    if (host === 'localhost') return null
    
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    if (host === productionDomain || host === `www.${productionDomain}`) {
      return null
    }
    
    if (host.endsWith(`.${productionDomain}`)) {
      const parts = host.split('.')
      if (parts.length >= 3) {
        return parts[0]
      }
    }
    
    if (host.endsWith('.vercel.app')) {
      const parts = host.split('.')
      if (parts.length > 3) {
        return parts[0]
      }
    }
    
    if (host.endsWith('.localhost')) {
      const parts = host.split('.')
      if (parts.length === 2) {
        return parts[0]
      }
    }
    
    const parts = host.split('.')
    if (parts.length > 2) {
      return parts[0]
    }
    
    return null
  }

  const getMainDomainUrl = (): string => {
    const hostname = window.location.hostname
    const host = hostname.split(':')[0]
    const productionDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    const protocol = window.location.protocol
    const port = window.location.port
    
    if (host.endsWith(`.${productionDomain}`) || host === productionDomain) {
      return `${protocol}//${productionDomain}`
    }
    
    if (host.endsWith('.vercel.app')) {
      const parts = host.split('.')
      if (parts.length >= 3) {
        const mainDomain = parts.slice(-3).join('.')
        return `${protocol}//${mainDomain}`
      }
    }
    
    if (host.includes('localhost')) {
      return `${protocol}//localhost${port ? ':' + port : ''}`
    }
    
    const parts = host.split('.')
    if (parts.length > 2) {
      const mainDomain = parts.slice(1).join('.')
      return `${protocol}//${mainDomain}`
    }
    
    return `${protocol}//${host}`
  }

  const validateUserForTenant = async (userId: string, tenantId: string): Promise<boolean> => {
    try {
      // Check if user owns this tenant
      const { data: ownerCheck } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .eq('owner_id', userId)
        .maybeSingle()

      if (ownerCheck) {
        return true
      }

      // Check if user is a member of this tenant
      const { data: memberCheck } = await supabase
        .from('tenant_users')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle()

      return !!memberCheck
    } catch (error) {
      console.error('Error validating user for tenant:', error)
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      if (!data.user) {
        setMessage('Login failed - no user returned.')
        setLoading(false)
        return
      }

      if (isOnSubdomain) {
        // SUBDOMAIN LOGIN - Validate user has access to THIS specific tenant
        if (!tenantInfo) {
          setMessage('Tenant information not available.')
          setLoading(false)
          return
        }

        const hasAccess = await validateUserForTenant(data.user.id, tenantInfo.id)
        
        if (!hasAccess) {
          // Sign out the user since they don't have access to this tenant
          await supabase.auth.signOut()
          setMessage('You do not have access to this tenant. Please check your credentials or contact the tenant administrator.')
          setLoading(false)
          return
        }

        // Success! User has access to this tenant
        setMessage('Login successful!')
        router.push('/admin')
      } else {
        // MAIN DOMAIN LOGIN - Check user type and redirect accordingly
        try {
          const response = await fetch('/api/auth/check-platform-admin')
          const { isPlatformAdmin } = await response.json()
          
          if (isPlatformAdmin) {
            // Platform admin - session stays on main domain, redirect to platform
            setMessage('Welcome, Platform Administrator!')
            router.push('/platform')
            return
          }
          
          // For tenant users - DO NOT store session on main domain
          // Instead, redirect to their tenant subdomain with session transfer
          setMessage('Redirecting to your store...')
          await redirectToUserTenantAdmin(data.user, {
            fallbackPath: '/signup', // If no tenant found, redirect to signup
            onError: (error) => {
              console.error('Redirect failed:', error)
              setMessage('Unable to find your tenant. Please contact support or create a new store.')
              setLoading(false)
            }
          })
        } catch (adminCheckError) {
          console.error('Error checking admin status:', adminCheckError)
          setMessage('Error verifying authentication. Please try again.')
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setMessage('An unexpected error occurred')
      setLoading(false)
    }
  }

  // Show loading while checking authentication status
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('checkingAuth')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold">
              {isOnSubdomain ? (tenantInfo?.name || 'Store') : platformConfig.name}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isOnSubdomain ? t('adminLogin') : t('signinToAccount')}
          </CardTitle>
          <CardDescription className="text-center">
            {isOnSubdomain ? (
              tenantInfo ? (
                <>{t('signinToManage')} <strong>{tenantInfo.name}</strong></>
              ) : (
                t('signinToAdmin')
              )
            ) : (
              t('enterCredentials')
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">{t('emailAddress')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('enterEmail')}
              />
            </div>
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('enterPassword')}
              />
            </div>
            
            {message && (
              <div className={`flex items-start gap-2 text-sm p-3 rounded-md ${
                message.includes('successful') || message.includes('Welcome') || message.includes('Redirecting')
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {!(message.includes('successful') || message.includes('Welcome') || message.includes('Redirecting')) && 
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                }
                <span>{message}</span>
              </div>
            )}
            
            <Button 
              type="submit" 
              disabled={loading || (isOnSubdomain && !tenantInfo)} 
              className="w-full"
            >
              {loading ? t('signingIn') : (
                isOnSubdomain ? t('signinToAdminBtn') : t('signIn')
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            {isOnSubdomain ? (
              <Link 
                href={getMainDomainUrl()}
                className="text-blue-600 hover:text-blue-500"
              >
                {t('backToMainSite')}
              </Link>
            ) : (
              <>
                <span className="text-gray-600">{t('dontHaveAccount')} </span>
                <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>
          
          {isOnSubdomain && tenantInfo && (
            <div className="mt-4 text-center text-xs text-gray-500 border-t pt-4">
              {t('tenant')}: {tenantInfo.subdomain}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
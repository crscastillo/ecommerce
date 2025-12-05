'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { platformConfig } from '@/lib/config/platform'
import { Store, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { redirectToUserTenantAdmin } from '@/lib/utils/tenant-redirects'
import { useLogin, LoginCredentials } from '@/lib/hooks/use-auth'
import { useTenantDetection } from '@/lib/hooks/use-tenant-detection'
import { LoginForm } from '@/components/auth/auth-forms'
import { getMainDomainUrl } from '@/lib/utils/domain-detection'

export default function Login() {
  const { tenantInfo, isOnSubdomain, loading: tenantLoading, error: tenantError } = useTenantDetection()
  const { loading, error, success, successMessage, login } = useLogin()
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations('auth')

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          if (isOnSubdomain && tenantInfo) {
            // Validate user has access to this tenant
            const hasAccess = await validateUserForTenant(user.id, tenantInfo.id)
            if (hasAccess) {
              router.push('/admin')
              return
            } else {
              // User is logged in but doesn't have access to this tenant
              await supabase.auth.signOut()
            }
          } else if (!isOnSubdomain) {
            // Main domain - redirect based on user type
            try {
              const response = await fetch('/api/auth/check-platform-admin')
              const { isPlatformAdmin } = await response.json()
              
              if (isPlatformAdmin) {
                router.push('/platform')
                return
              } else {
                // Redirect to user's tenant
                await redirectToUserTenantAdmin(user)
                return
              }
            } catch (error) {
              // If there's an error checking admin status, just continue to login
            }
          }
        }
      } catch (error) {
        // Continue to login form
      }
    }

    if (!tenantLoading) {
      checkAuth()
    }
  }, [router, supabase, isOnSubdomain, tenantInfo, tenantLoading])

  const validateUserForTenant = async (userId: string, tenantId: string): Promise<boolean> => {
    try {
      // Check if user owns this tenant
      const { data: ownerCheck } = await supabase
        .from('tenants')
        .select('id')
        .eq('id', tenantId)
        .eq('owner_id', userId)
        .maybeSingle()

      if (ownerCheck) return true

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
      return false
    }
  }

  const handleLogin = async (credentials: LoginCredentials) => {
    await login(credentials, tenantInfo)
  }

  // Show loading spinner while checking tenant/auth
  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if tenant detection failed
  if (tenantError && isOnSubdomain) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">Tenant Not Found</CardTitle>
            <CardDescription>{tenantError}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link 
              href={getMainDomainUrl()}
              className="text-primary hover:text-primary/80 underline"
            >
              Return to main site
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-primary mr-2" />
            <span className="text-xl font-bold text-foreground">
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
          {/* Success Message */}
          {(success || successMessage) && (
            <div className="mb-4 flex items-start gap-2 text-sm p-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{successMessage || 'Login successful!'}</span>
            </div>
          )}

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            isSubdomain={isOnSubdomain}
            tenantName={tenantInfo?.name}
          />
          
          {/* Navigation Links */}
          <div className="mt-6 text-center text-sm">
            {isOnSubdomain ? (
              <Link 
                href={getMainDomainUrl()}
                className="text-primary hover:text-primary/80"
              >
                {t('backToMainSite')}
              </Link>
            ) : (
              <>
                <span className="text-muted-foreground">{t('dontHaveAccount')} </span>
                <Link href="/signup" className="font-medium text-primary hover:text-primary/80">
                  {t('signUp')}
                </Link>
              </>
            )}
          </div>
          
          {/* Tenant Info */}
          {isOnSubdomain && tenantInfo && (
            <div className="mt-4 text-center text-xs text-muted-foreground border-t border-border pt-4">
              {t('tenant')}: {tenantInfo.subdomain}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
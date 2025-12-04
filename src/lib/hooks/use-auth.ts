'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { redirectToUserTenantAdmin } from '@/lib/utils/tenant-redirects'
import { getBaseUrl } from '@/lib/utils'
import { isPlatformAdmin } from '@/lib/actions/admin-check'

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword?: string
}

export interface TenantSignupData extends SignupCredentials {
  storeName: string
  subdomain: string
  description: string
  contactEmail: string
}

export interface AuthState {
  loading: boolean
  error: string
  success: boolean
  successMessage: string
}

export interface TenantInfo {
  id: string
  name: string
  subdomain: string
}

// Hook for login functionality
export function useLogin() {
  const [state, setState] = useState<AuthState>({
    loading: false,
    error: '',
    success: false,
    successMessage: ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  const login = async (credentials: LoginCredentials, tenantInfo?: TenantInfo | null) => {
    setState({ loading: true, error: '', success: false, successMessage: '' })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        setState({ loading: false, error: error.message, success: false, successMessage: '' })
        return { success: false, error: error.message }
      }

      if (!data.user) {
        setState({ loading: false, error: 'Login failed - no user returned.', success: false, successMessage: '' })
        return { success: false, error: 'Login failed - no user returned.' }
      }

      // Handle tenant-specific login
      if (tenantInfo) {
        const hasAccess = await validateUserForTenant(data.user.id, tenantInfo.id)
        
        if (!hasAccess) {
          await supabase.auth.signOut()
          setState({ 
            loading: false, 
            error: 'You do not have access to this tenant. Please check your credentials or contact the tenant administrator.',
            success: false, 
            successMessage: '' 
          })
          return { success: false, error: 'Access denied to tenant' }
        }

        setState({ loading: false, error: '', success: true, successMessage: 'Login successful!' })
        router.push('/admin')
        return { success: true }
      }

      // Handle main domain login - check user type
      try {
        const response = await fetch('/api/auth/check-platform-admin')
        const { isPlatformAdmin: isAdmin } = await response.json()
        
        if (isAdmin) {
          setState({ loading: false, error: '', success: true, successMessage: 'Welcome, Platform Administrator!' })
          router.push('/platform')
          return { success: true }
        }
        
        // Redirect tenant users to their subdomain
        setState({ loading: false, error: '', success: true, successMessage: 'Redirecting to your store...' })
        await redirectToUserTenantAdmin(data.user, {
          fallbackPath: '/signup',
          onError: (error) => {
            setState({ 
              loading: false, 
              error: 'Unable to find your tenant. Please contact support or create a new store.',
              success: false, 
              successMessage: '' 
            })
          }
        })
        return { success: true }
        
      } catch (adminCheckError) {
        setState({ 
          loading: false, 
          error: 'Error verifying authentication. Please try again.',
          success: false, 
          successMessage: '' 
        })
        return { success: false, error: 'Authentication verification failed' }
      }

    } catch (error) {
      setState({ 
        loading: false, 
        error: 'An unexpected error occurred',
        success: false, 
        successMessage: '' 
      })
      return { success: false, error: 'Unexpected error' }
    }
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
      return false
    }
  }

  return {
    ...state,
    login,
    validateUserForTenant
  }
}

// Hook for signup functionality
export function useSignup() {
  const [state, setState] = useState<AuthState>({
    loading: false,
    error: '',
    success: false,
    successMessage: ''
  })

  const [signupData, setSignupData] = useState<TenantSignupData>({
    email: '',
    password: '',
    storeName: '',
    subdomain: '',
    description: '',
    contactEmail: ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  const updateSignupData = (updates: Partial<TenantSignupData>) => {
    setSignupData(prev => ({ ...prev, ...updates }))
  }

  const handleSignup = async () => {
    return await signupTenant(signupData)
  }

  const signupUser = async (credentials: SignupCredentials) => {
    setState({ loading: true, error: '', success: false, successMessage: '' })

    try {
      // Validate password match if confirmPassword is provided
      if (credentials.confirmPassword && credentials.password !== credentials.confirmPassword) {
        setState({ loading: false, error: 'Passwords do not match', success: false, successMessage: '' })
        return { success: false, error: 'Passwords do not match' }
      }

      // Check if this is a platform admin
      const isAdmin = await isPlatformAdmin(credentials.email)
      if (isAdmin) {
        return await createPlatformAdminAccount(credentials)
      }

      setState({ 
        loading: false, 
        error: 'Regular user signup should be done through tenant creation',
        success: false, 
        successMessage: '' 
      })
      return { success: false, error: 'Use tenant signup instead' }

    } catch (error) {
      setState({ 
        loading: false, 
        error: 'An unexpected error occurred',
        success: false, 
        successMessage: '' 
      })
      return { success: false, error: 'Unexpected error' }
    }
  }

  const signupTenant = async (tenantData: TenantSignupData) => {
    setState({ loading: true, error: '', success: false, successMessage: '' })

    try {
      // Store tenant data for after email confirmation
      const pendingTenant = {
        storeName: tenantData.storeName,
        subdomain: tenantData.subdomain,
        description: tenantData.description,
        contactEmail: tenantData.contactEmail
      }
      localStorage.setItem('pendingTenant', JSON.stringify(pendingTenant))

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tenantData.email,
        password: tenantData.password,
        options: {
          data: {
            full_name: tenantData.storeName,
            pending_tenant_name: tenantData.storeName,
            pending_tenant_subdomain: tenantData.subdomain,
            pending_tenant_description: tenantData.description,
            pending_tenant_contact_email: tenantData.contactEmail,
          },
          emailRedirectTo: `${getBaseUrl()}/auth/callback?setup=tenant`,
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      setState({ 
        loading: false, 
        error: '', 
        success: true, 
        successMessage: 'Account created successfully! Please check your email to verify your account and set up your store.' 
      })
      return { success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
      setState({ loading: false, error: errorMessage, success: false, successMessage: '' })
      return { success: false, error: errorMessage }
    }
  }

  const createPlatformAdminAccount = async (credentials: SignupCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: 'Platform Administrator',
            role: 'platform_admin'
          },
          emailRedirectTo: `${getBaseUrl()}/auth/callback`
        }
      })

      if (error) throw new Error(error.message)

      setState({ 
        loading: false, 
        error: '', 
        success: true, 
        successMessage: 'Platform admin account created! Please check your email to verify your account.' 
      })
      return { success: true }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create platform admin account'
      setState({ loading: false, error: errorMessage, success: false, successMessage: '' })
      return { success: false, error: errorMessage }
    }
  }

  return {
    ...state,
    signupData,
    updateSignupData,
    handleSignup,
    signupUser,
    signupTenant,
    createPlatformAdminAccount
  }
}

// Hook for subdomain validation
export function useSubdomainValidation() {
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const supabase = createClient()

  const validateSubdomain = (value: string): boolean => {
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    const isValidLength = value.length >= 3 && value.length <= 30
    const hasValidChars = regex.test(value)
    const noConsecutiveHyphens = !value.includes('--')
    
    return isValidLength && hasValidChars && noConsecutiveHyphens
  }

  const checkAvailability = async (subdomain: string) => {
    if (!validateSubdomain(subdomain)) {
      setIsAvailable(false)
      return false
    }

    setIsChecking(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('subdomain')
        .eq('subdomain', subdomain)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      const available = !data
      setIsAvailable(available)
      return available

    } catch (error) {
      setIsAvailable(false)
      return false
    } finally {
      setIsChecking(false)
    }
  }

  return {
    isChecking,
    isAvailable,
    validateSubdomain,
    checkAvailability
  }
}
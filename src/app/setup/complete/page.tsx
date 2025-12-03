'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getBaseDomain } from '@/lib/utils'

export default function SetupComplete() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  const [apiCalling, setApiCalling] = useState(false) // Add API call state
  const hasRun = useRef(false)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let ignore = false // Use cleanup flag instead of ref
    
    const completeTenantSetup = async () => {
      try {
        // Get pending tenant data from localStorage
        const pendingTenantStr = localStorage.getItem('pendingTenant')
        if (!pendingTenantStr) {
          setError('No pending store setup found. Please start the signup process again.')
          setLoading(false)
          return
        }

        const pendingTenant = JSON.parse(pendingTenantStr)

        // Check ignore flag early
        if (ignore) return

        // Verify user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setError('Please sign in to complete your store setup.')
          setLoading(false)
          return
        }

        // Check ignore flag again
        if (ignore) return        // Check if tenant already exists for this user
        const { data: existingTenants } = await supabase
          .from('tenants')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)

        // Check ignore flag before proceeding
        if (ignore) return

        let tenant

        if (existingTenants && existingTenants.length > 0) {
          // Tenant already exists - just use it and update info if needed
          tenant = existingTenants[0]
          
          // Update tenant with the form data (in case user changed details)
          const { data: updatedTenant, error: updateError } = await supabase
            .from('tenants')
            .update({
              name: pendingTenant.storeName,
              description: pendingTenant.description,
              contact_email: pendingTenant.contactEmail,
            })
            .eq('id', tenant.id)
            .select()
            .single()

          if (!updateError && updatedTenant) {
            tenant = updatedTenant
          }
        } else {
          // No tenant exists - create new one
          // Prevent concurrent API calls
          if (apiCalling || ignore) {
            return
          }
          setApiCalling(true)
          
          const response = await fetch('/api/tenants', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: pendingTenant.storeName,
              subdomain: pendingTenant.subdomain,
              description: pendingTenant.description,
              contact_email: pendingTenant.contactEmail,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            throw new Error(result.error || 'Failed to create store')
          }
          
          tenant = result.tenant
        }

        // Check ignore flag before setting state
        if (ignore) return

        // Clear pending data
        localStorage.removeItem('pendingTenant')
        
        setTenantData(tenant)
        setSuccess(true)

        // Redirect to admin after a short delay
        setTimeout(() => {
          const subdomain = tenant.subdomain
          
          // Build the admin URL based on environment
          let adminUrl: string
          
          if (process.env.NODE_ENV === 'development') {
            // For development: subdomain.localhost:3000/admin
            adminUrl = `http://${subdomain}.localhost:3000/admin`
          } else {
            // For production: subdomain.basedomain.com/admin
            const baseDomain = getBaseDomain()
            adminUrl = `https://${subdomain}.${baseDomain}/admin`
          }
          
          window.location.href = adminUrl
        }, 2000) // 2 second delay

        // Don't auto-redirect for now - let user click button

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete store setup'
        setError(errorMessage)
      } finally {
        setApiCalling(false) // Reset API calling state
        setLoading(false)
      }
    }

    completeTenantSetup()
    
    // Cleanup function to prevent race conditions
    return () => {
      ignore = true
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Setting Up Your Store</CardTitle>
            <CardDescription>
              Please wait while we complete your store setup...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Setup Failed</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button onClick={() => router.push('/signup')} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/login')} className="w-full">
                Sign In Instead
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success && tenantData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Store Created Successfully!</CardTitle>
            <CardDescription>
              Your store "{tenantData.name}" is ready at {tenantData.subdomain}.yourdomain.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              You're being redirected to your admin dashboard...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span className="text-sm">Redirecting to admin...</span>
            </div>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const subdomain = tenantData.subdomain
                  
                  let adminUrl: string
                  if (process.env.NODE_ENV === 'development') {
                    adminUrl = `http://${subdomain}.localhost:3000/admin`
                  } else {
                    const baseDomain = getBaseDomain()
                    adminUrl = `https://${subdomain}.${baseDomain}/admin`
                  }
                  
                  window.location.href = adminUrl
                }}
              >
                Go to Admin Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
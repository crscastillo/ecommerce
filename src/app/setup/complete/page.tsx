'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SetupComplete() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tenantData, setTenantData] = useState<any>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
        console.log('Completing tenant setup:', pendingTenant)

        // Verify user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          setError('Please sign in to complete your store setup.')
          setLoading(false)
          return
        }

        // Create tenant using API route
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

        // Clear pending data
        localStorage.removeItem('pendingTenant')
        
        setTenantData(result.tenant)
        setSuccess(true)

        // Redirect to admin after a short delay
        setTimeout(() => {
          const subdomain = result.tenant.subdomain
          const host = window.location.host
          // For development, use subdomain.localhost:3000
          // For production, it would be subdomain.yourdomain.com
          const adminUrl = process.env.NODE_ENV === 'development'
            ? `http://${subdomain}.localhost:3000/admin`
            : `https://${subdomain}.${host.replace(/^[^.]+\./, '')}/admin`
          
          window.location.href = adminUrl
        }, 3000)

      } catch (err) {
        console.error('Error completing setup:', err)
        setError(err instanceof Error ? err.message : 'Failed to complete store setup')
      } finally {
        setLoading(false)
      }
    }

    completeTenantSetup()
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
                  const host = window.location.host
                  const adminUrl = process.env.NODE_ENV === 'development'
                    ? `http://${subdomain}.localhost:3000/admin`
                    : `https://${subdomain}.${host.replace(/^[^.]+\./, '')}/admin`
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
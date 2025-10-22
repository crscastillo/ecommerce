'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TenantSignup() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form data
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  
  // Validation
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [checkingSubdomain, setCheckingSubdomain] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const validateSubdomain = (value: string) => {
    // Simple validation: 3-30 chars, alphanumeric and hyphens, no consecutive hyphens, no start/end with hyphen
    const regex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/
    const isValidLength = value.length >= 3 && value.length <= 30
    const hasValidChars = regex.test(value)
    const noConsecutiveHyphens = !value.includes('--')
    
    console.log('Validating subdomain:', value, {
      isValidLength,
      hasValidChars,
      noConsecutiveHyphens,
      overall: isValidLength && hasValidChars && noConsecutiveHyphens
    })
    
    return isValidLength && hasValidChars && noConsecutiveHyphens
  }

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!validateSubdomain(subdomain)) {
      setSubdomainAvailable(false)
      return
    }

    setCheckingSubdomain(true)
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('subdomain')
        .eq('subdomain', subdomain)
        .maybeSingle()  // Use maybeSingle() instead of single()

      // If data exists, subdomain is taken
      // If no data and no error, subdomain is available
      if (error) {
        console.error('Error checking subdomain:', error)
        setSubdomainAvailable(false)
      } else {
        setSubdomainAvailable(!data)  // Available if no data found
      }
    } catch (err) {
      console.error('Subdomain check failed:', err)
      setSubdomainAvailable(false)
    } finally {
      setCheckingSubdomain(false)
    }
  }

  const handleSubdomainChange = (value: string) => {
    const cleanValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSubdomain(cleanValue)
    
    // Reset availability state when typing
    setSubdomainAvailable(null)
    
    if (cleanValue.length >= 3) {
      const timeoutId = setTimeout(() => {
        console.log('Checking subdomain:', cleanValue, 'Valid:', validateSubdomain(cleanValue))
        checkSubdomainAvailability(cleanValue)
      }, 500)
      
      return () => clearTimeout(timeoutId)
    } else {
      setSubdomainAvailable(null)
    }
  }

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setStep(2)
  }

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!storeName || !subdomain || !contactEmail) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!validateSubdomain(subdomain)) {
      setError('Subdomain must be 3-30 characters, start and end with alphanumeric characters, and contain only lowercase letters, numbers, and hyphens')
      return
    }
    
    if (subdomainAvailable === false) {
      setError('This subdomain is not available')
      return
    }
    
    await createTenantAccount()
  }

  const createTenantAccount = async () => {
    setLoading(true)
    setError('')

    try {
      // Store tenant data in localStorage for after email confirmation
      const tenantData = {
        storeName,
        subdomain,
        description,
        contactEmail
      }
      localStorage.setItem('pendingTenant', JSON.stringify(tenantData))

      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?setup=tenant`,
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      setSuccess(true)

    } catch (err) {
      console.error('Error creating account:', err)
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Store Created Successfully!</CardTitle>
            <CardDescription>
              Your store "{storeName}" has been created at {subdomain}.yourdomain.com
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Please check your email <strong>{email}</strong> and click the verification link to activate your account and complete your store setup.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              After verification, you'll be automatically redirected to complete your store configuration.
            </p>
            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-500 text-sm">
                Already verified? Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Account</span>
            <span>Store Details</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {step === 1 ? 'Create Your Account' : 'Set Up Your Store'}
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 
                ? 'Start by creating your account' 
                : 'Configure your online store'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create a password"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full">
                  Continue
                </Button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div>
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    required
                    placeholder="My Awesome Store"
                  />
                </div>

                <div>
                  <Label htmlFor="subdomain">Store Subdomain *</Label>
                  <div className="flex">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      required
                      placeholder="mystore"
                      className="rounded-r-none"
                    />
                    <div className="bg-gray-100 border border-l-0 px-3 py-2 text-sm text-gray-600 rounded-r-md">
                      .yourdomain.com
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {checkingSubdomain && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Checking...</span>
                      </>
                    )}
                    {subdomainAvailable === true && (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                      </>
                    )}
                    {subdomainAvailable === false && (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <Badge variant="outline" className="text-red-600 border-red-600">
                          Not Available
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    3-30 characters, letters, numbers, and hyphens only
                  </p>
                </div>

                <div>
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    placeholder="contact@mystore.com"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Store Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your store"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || subdomainAvailable === false}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Store'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
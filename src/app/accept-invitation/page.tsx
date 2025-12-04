'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface InvitationData {
  id: string
  tenant_id: string
  email: string
  role: string
  invited_at: string
  tenant: {
    name: string
    subdomain: string
  }
}

function AcceptInvitationContent() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [wrongSubdomain, setWrongSubdomain] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const invitationId = searchParams.get('invitation_id')

  const supabase = createClient()

  useEffect(() => {
    if (token || invitationId) {
      loadInvitation()
    } else {
      setError('Invalid invitation link')
      setLoading(false)
    }
  }, [token, invitationId])

  const loadInvitation = async () => {
    try {
      // If we have a token, verify it with Supabase Auth first
      if (token) {
        const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
          type: 'invite',
          token_hash: token
        })
        
        if (verifyError) {
          setError('Invalid or expired invitation link')
          setLoading(false)
          return
        }
      }

      // Load invitation details
      let query = supabase
        .from('tenant_users_invitations')
        .select(`
          id,
          tenant_id,
          email,
          role,
          invited_at,
          expires_at,
          tenants:tenant_id (
            name,
            subdomain
          )
        `)
        .eq('is_active', true)

      if (invitationId) {
        query = query.eq('id', invitationId)
      } else {
        // If no invitation ID, we need to find it by email from the auth verification
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email) {
          setError('Unable to identify invitation')
          setLoading(false)
          return
        }
        query = query.eq('email', user.email)
      }

      const { data, error } = await query.single()

      if (error || !data) {
        setError('Invitation not found or has expired')
        setLoading(false)
        return
      }

      // Check if invitation has expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      const tenantSubdomain = (data.tenants as any)?.subdomain || 'unknown'
      setInvitation({
        id: data.id,
        tenant_id: data.tenant_id,
        email: data.email,
        role: data.role,
        invited_at: data.invited_at,
        tenant: {
          name: (data.tenants as any)?.name || 'Unknown Store',
          subdomain: tenantSubdomain
        }
      })

      // Subdomain check: if not on the correct subdomain, set flag
      if (typeof window !== 'undefined') {
        const currentHost = window.location.host
        if (!currentHost.startsWith(`${tenantSubdomain}.`)) {
          setWrongSubdomain(true)
        }
      }
    } catch (error) {
      setError('Failed to load invitation details')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitation) return
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `https://${invitation.tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'}/admin`
        }
      })

      if (authError) {
        if (authError.message.includes('User already registered')) {
          // User exists, try to sign them in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password: password
          })
          
          if (signInError) {
            setError('An account with this email already exists. Please sign in with the correct password or reset your password.')
            return
          }
        } else {
          throw authError
        }
      }

      // Add user to tenant_users table
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: invitation.tenant_id,
          user_id: authData?.user?.id,
          role: invitation.role,
          is_active: true,
          invited_at: invitation.invited_at,
          accepted_at: new Date().toISOString()
        })

      if (tenantUserError) {
      }

      // Mark invitation as accepted
      await supabase
        .from('tenant_users_invitations')
        .update({
          accepted_at: new Date().toISOString(),
          is_active: false
        })
        .eq('id', invitation.id)

      setSuccess(true)
      
      // Redirect to tenant admin after a brief delay
      setTimeout(() => {
        const isDev = process.env.NODE_ENV === 'development'
        const redirectUrl = isDev 
          ? `http://${invitation.tenant.subdomain}.localhost:3000/admin`
          : `https://${invitation.tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'yourdomain.com'}/admin`
        window.location.href = redirectUrl
      }, 2000)

    } catch (error) {
      setError('Failed to accept invitation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If on the wrong subdomain, show warning and redirect button
  if (wrongSubdomain && invitation) {
    const params = []
    if (invitationId) params.push(`invitation_id=${encodeURIComponent(invitationId)}`)
    if (token) params.push(`token=${encodeURIComponent(token)}`)
    const paramString = params.length ? `?${params.join('&')}` : ''
    const correctUrl = `https://${invitation.tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'}/accept-invitation${paramString}`
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <Card className="w-full max-w-md border-yellow-400">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wrong Store Link</h3>
            <p className="text-center text-gray-700 mb-4">
              This invitation is for <b>{invitation.tenant.name}</b>.<br />
              Please open the link on the correct store subdomain to accept your invitation.
            </p>
            <Button onClick={() => window.location.href = correctUrl}>
              Go to {invitation.tenant.subdomain}.{process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to {invitation?.tenant.name}!</h3>
            <p className="text-center text-gray-600 mb-4">
              Your invitation has been accepted successfully. You will be redirected to the admin dashboard shortly.
            </p>
            <Button
              onClick={() => router.push(`https://${invitation?.tenant.subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'}/admin`)}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Invitation</h3>
            <p className="text-center text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Join {invitation.tenant.name}</CardTitle>
          <CardDescription>
            You've been invited to join as a {invitation.role}. Create your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={invitation.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <Alert>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Invitation & Create Account
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AcceptInvitationContent />
    </Suspense>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  expires_at: string
  tenant: {
    name: string
    subdomain: string
  }
}

export default function AcceptInvitationPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')

  const router = useRouter()
  const params = useParams()
  const invitationId = params.invitationId as string

  const supabase = createClient()

  useEffect(() => {
    if (invitationId) {
      loadInvitation()
    } else {
      setError('Invalid invitation link')
      setLoading(false)
    }
  }, [invitationId])

  const loadInvitation = async () => {
    try {
      setLoading(true)
      setError('')

      // Load invitation details
      const { data, error } = await supabase
        .from('tenant_users_invitations')
        .select(`
          id,
          tenant_id,
          email,
          role,
          invited_at,
          expires_at,
          is_active,
          tenants!tenant_id (
            name,
            subdomain
          )
        `)
        .eq('id', invitationId)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setError('Invitation not found or has expired')
        setLoading(false)
        return
      }

      // Check if invitation has expired
      const expiresAt = new Date(data.expires_at)
      if (expiresAt < new Date()) {
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      setInvitation({
        ...data,
        tenant: Array.isArray(data.tenants) ? data.tenants[0] : data.tenants
      })

    } catch (err) {
      console.error('Error loading invitation:', err)
      setError('Failed to load invitation details')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!invitation) return

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      let currentUser = null

      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            invitation_id: invitation.id
          }
        }
      })

      if (signUpError) {
        // If user already exists, try to sign them in
        if (signUpError.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: invitation.email,
            password: password
          })

          if (signInError) {
            setError('User already exists. Please sign in with your existing password, or reset your password if you forgot it.')
            return
          }

          currentUser = signInData?.user
        } else {
          setError(signUpError.message)
          return
        }
      } else {
        currentUser = authData?.user
      }
      if (!currentUser) {
        setError('Failed to create account')
        return
      }

      // Add user to tenant
      const { error: tenantUserError } = await supabase
        .from('tenant_users')
        .insert({
          tenant_id: invitation.tenant_id,
          user_id: currentUser.id,
          role: invitation.role,
          is_active: true,
          invited_at: invitation.invited_at,
          accepted_at: new Date().toISOString()
        })

      if (tenantUserError) {
        console.error('Error adding user to tenant:', tenantUserError)
        setError('Failed to complete invitation process')
        return
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

      // Redirect to tenant admin after success
      setTimeout(() => {
        const isLocalhost = window.location.hostname === 'localhost'
        const targetUrl = isLocalhost 
          ? `http://${invitation.tenant.subdomain}.localhost:3000/admin`
          : `https://${invitation.tenant.subdomain}.${window.location.hostname}/admin`
        
        window.location.href = targetUrl
      }, 2000)

    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading invitation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Welcome to the team!</h2>
            <p className="text-gray-600 mb-4">
              You've successfully joined {invitation?.tenant.name}. 
              Redirecting you to the admin panel...
            </p>
            <div className="flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Accept Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitation?.tenant.name}</strong> as a <strong>{invitation?.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={invitation?.email || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter a secure password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
            />
          </div>

          <Button 
            onClick={handleAcceptInvitation} 
            className="w-full" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting Invitation...
              </>
            ) : (
              'Accept Invitation & Create Account'
            )}
          </Button>

          <div className="text-center text-sm text-gray-500">
            <p>Already have an account? <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/login')}>Sign in instead</Button></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
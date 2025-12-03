'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [validatingSession, setValidatingSession] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    // Check if this is a valid password reset session
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setMessage({ 
            type: 'error', 
            text: 'Invalid or expired password reset link. Please request a new one.' 
          })
          return
        }

        // Check if this is specifically a password recovery session
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session from URL parameters
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (sessionError) {
            setMessage({ 
              type: 'error', 
              text: 'Failed to validate reset session. Please try again.' 
            })
            return
          }
        }
        
        setValidatingSession(false)
      } catch (error) {
        setMessage({ 
          type: 'error', 
          text: 'Failed to validate reset session. Please try again.' 
        })
        setValidatingSession(false)
      }
    }

    validateSession()
  }, [searchParams, supabase.auth])

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: 'Password updated successfully! Redirecting to admin dashboard...' 
      })

      // Redirect to admin dashboard after 2 seconds
      setTimeout(() => {
        router.push('/admin')
      }, 2000)

    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update password. Please try again.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    if (strength < 2) return { label: 'Weak', color: 'text-red-600', bgColor: 'bg-red-100' }
    if (strength < 4) return { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    return { label: 'Strong', color: 'text-green-600', bgColor: 'bg-green-100' }
  }

  if (validatingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Validating reset session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <p className="text-gray-600 text-sm">
            Enter your new password below
          </p>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`p-4 rounded-lg flex items-center space-x-2 mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {!message || message.type === 'error' ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Password strength:</span>
                      <span className={getPasswordStrength(password).color}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          getPasswordStrength(password).label === 'Weak' ? 'bg-red-500 w-1/3' :
                          getPasswordStrength(password).label === 'Medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters long
                  </li>
                  <li className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? 'text-green-600' : ''}>
                    • Mix of uppercase and lowercase letters
                  </li>
                  <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                    • At least one number
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : ''}>
                    • At least one special character
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </form>
          ) : null}

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => router.push('/admin')}
              className="text-sm"
            >
              Back to Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
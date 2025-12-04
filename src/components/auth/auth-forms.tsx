'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { LoginCredentials, SignupCredentials, TenantSignupData } from '@/lib/hooks/use-auth'
import { useSubdomainValidation } from '@/lib/hooks/use-auth'
import { platformConfig } from '@/lib/config/platform'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { useEffect } from 'react'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>
  onEmailChange?: (email: string) => void
  loading?: boolean
  error?: string
  isSubdomain?: boolean
  tenantName?: string
}

export function LoginForm({ onSubmit, onEmailChange, loading, error, isSubdomain, tenantName }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const t = useTranslations('auth')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t('emailAddress')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            onEmailChange?.(e.target.value)
          }}
          required
          placeholder={t('enterEmail')}
          disabled={loading}
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
          disabled={loading}
        />
      </div>
      
      {error && (
        <div className="flex items-start gap-2 text-sm p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={loading || !email || !password} 
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('signingIn')}
          </>
        ) : (
          isSubdomain ? t('signinToAdminBtn') : t('signIn')
        )}
      </Button>
    </form>
  )
}

interface SignupFormProps {
  email?: string
  password?: string
  onEmailChange?: (email: string) => void
  onPasswordChange?: (password: string) => void
  onSubmit: (credentials: SignupCredentials) => Promise<void>
  loading?: boolean
  error?: string
  requireConfirmPassword?: boolean
}

export function SignupForm({ 
  email: initialEmail = '', 
  password: initialPassword = '',
  onEmailChange,
  onPasswordChange,
  onSubmit, 
  loading, 
  error, 
  requireConfirmPassword = true 
}: SignupFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState(initialPassword)
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const t = useTranslations('auth')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    if (!email || !password) {
      setValidationError('Please fill in all fields')
      return
    }
    
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    if (requireConfirmPassword && password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    
    await onSubmit({ email, password, confirmPassword: requireConfirmPassword ? confirmPassword : undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">{t('emailAddress')}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder={t('enterEmail')}
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="password">{t('password')}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            onPasswordChange?.(e.target.value)
          }}
          required
          placeholder={t('createPassword')}
          minLength={6}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          {t('mustBe6Chars')}
        </p>
      </div>

      {requireConfirmPassword && (
        <div>
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder={t('confirmPasswordPlaceholder')}
            minLength={6}
            disabled={loading}
          />
        </div>
      )}
      
      {(error || validationError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error || validationError}
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={loading || !email || !password || (requireConfirmPassword && !confirmPassword)} 
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('creatingAccount')}
          </>
        ) : (
          t('createAccount')
        )}
      </Button>
    </form>
  )
}

interface TenantDetailsFormProps {
  onStoreNameChange: (storeName: string) => void
  onSubdomainChange: (subdomain: string) => void
  onDescriptionChange: (description: string) => void
  onContactEmailChange: (contactEmail: string) => void
  onSubmit: (data: Omit<TenantSignupData, 'email' | 'password'>) => Promise<void>
  loading?: boolean
  error?: string
}

export function TenantDetailsForm({ 
  onStoreNameChange, 
  onSubdomainChange, 
  onDescriptionChange, 
  onContactEmailChange,
  onSubmit, 
  loading, 
  error 
}: TenantDetailsFormProps) {
  const [storeName, setStoreName] = useState('')
  const [subdomain, setSubdomain] = useState('')
  const [description, setDescription] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [validationError, setValidationError] = useState('')
  
  const t = useTranslations('auth')
  const { isChecking, isAvailable, validateSubdomain, checkAvailability } = useSubdomainValidation()
  
  // Debounce subdomain input to avoid excessive API calls
  const debouncedSubdomain = useDebounce(subdomain, 500)

  // Check subdomain availability when it changes
  useEffect(() => {
    if (debouncedSubdomain && validateSubdomain(debouncedSubdomain)) {
      checkAvailability(debouncedSubdomain)
    }
  }, [debouncedSubdomain, validateSubdomain, checkAvailability])

  const handleSubdomainChange = (value: string) => {
    const lowercase = value.toLowerCase()
    setSubdomain(lowercase)
    onSubdomainChange(lowercase)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')
    
    if (!storeName || !subdomain || !contactEmail) {
      setValidationError('Please fill in all required fields')
      return
    }
    
    if (!validateSubdomain(subdomain)) {
      setValidationError('Subdomain must be 3-30 characters, start and end with alphanumeric characters, and contain only lowercase letters, numbers, and hyphens')
      return
    }
    
    if (isAvailable === false) {
      setValidationError('This subdomain is not available')
      return
    }
    
    await onSubmit({
      storeName,
      subdomain,
      description,
      contactEmail
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="storeName">{t('storeName')} *</Label>
        <Input
          id="storeName"
          value={storeName}
          onChange={(e) => {
            setStoreName(e.target.value)
            onStoreNameChange(e.target.value)
          }}
          required
          placeholder={t('storeNamePlaceholder')}
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="subdomain">{t('storeSubdomain')} *</Label>
        <div className="flex">
          <Input
            id="subdomain"
            value={subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            required
            placeholder="mystore"
            className="rounded-r-none"
            disabled={loading}
          />
          <div className="bg-gray-100 border border-l-0 px-3 py-2 text-sm text-gray-600 rounded-r-md">
            .{platformConfig.getDomain()}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {isChecking && (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm text-gray-600">Checking...</span>
            </>
          )}
          {isAvailable === true && (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <Badge variant="outline" className="text-green-600 border-green-600">
                Available
              </Badge>
            </>
          )}
          {isAvailable === false && (
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
          onChange={(e) => {
            setContactEmail(e.target.value)
            onContactEmailChange(e.target.value)
          }}
          required
          placeholder="contact@mystore.com"
          disabled={loading}
        />
      </div>

      <div>
        <Label htmlFor="description">Store Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value)
            onDescriptionChange(e.target.value)
          }}
          placeholder="Brief description of your store"
          disabled={loading}
        />
      </div>

      {(error || validationError) && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error || validationError}
        </div>
      )}

      <Button 
        type="submit" 
        disabled={loading || !storeName || !subdomain || !contactEmail || isAvailable === false}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('creatingStore')}
          </>
        ) : (
          t('createStore')
        )}
      </Button>
    </form>
  )
}
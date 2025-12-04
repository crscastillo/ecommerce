'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'
import { useSignup } from '@/lib/hooks/use-auth'
import { SignupForm, TenantDetailsForm } from '@/components/auth/auth-forms'

export default function TenantSignup() {
  const [step, setStep] = useState(1)
  const t = useTranslations('auth')
  
  const {
    signupData,
    updateSignupData,
    handleSignup,
    loading,
    error,
    success,
    successMessage
  } = useSignup()

  const handleStep1Complete = () => {
    setStep(2)
  }

  const handleStep2Complete = async (tenantData: {
    storeName: string
    subdomain: string
    description: string
    contactEmail: string
  }) => {
    updateSignupData(tenantData)
    await handleSignup()
  }

  const handleStep1Submit = async (credentials: { email: string; password: string }) => {
    updateSignupData(credentials)
    handleStep1Complete()
  }

  if (success) {
    return (
      <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <Card>
              <CardHeader className="space-y-1 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl">{t('signupSuccess.title')}</CardTitle>
                <CardDescription>
                  {successMessage || t('signupSuccess.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">{t('signupSuccess.nextSteps')}</h3>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>• {t('signupSuccess.step1')}</li>
                      <li>• {t('signupSuccess.step2')}</li>
                      <li>• {t('signupSuccess.step3')}</li>
                    </ul>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/login">
                      {t('signupSuccess.loginButton')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="m8 3 4 8 5-5v11H3V7l5 5z" />
            <path d="M9 12h6" />
          </svg>
          {t('signup.brand')}
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              {t('signup.testimonial.quote')}
            </p>
            <footer className="text-sm">{t('signup.testimonial.author')}</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {step === 1 ? t('signup.title') : t('signup.storeDetails')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {step === 1 ? t('signup.description') : t('signup.storeDescription')}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                1
              </div>
              <span className="text-sm">{t('signup.step1')}</span>
            </div>
            <div className="h-px w-8 bg-muted"></div>
            <div className="flex items-center space-x-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                2
              </div>
              <span className="text-sm">{t('signup.step2')}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {step === 1 ? (
                  <>
                    <span>{t('signup.accountInfo')}</span>
                    <Badge variant="secondary">{t('signup.step')} 1/2</Badge>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setStep(1)}
                      className="p-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span>{t('signup.storeInfo')}</span>
                    <Badge variant="secondary">{t('signup.step')} 2/2</Badge>
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <SignupForm
                  email={signupData.email}
                  password={signupData.password}
                  onEmailChange={(email: string) => updateSignupData({ email })}
                  onPasswordChange={(password: string) => updateSignupData({ password })}
                  onSubmit={handleStep1Submit}
                  loading={loading}
                  error={error}
                />
              ) : (
                <TenantDetailsForm
                  onStoreNameChange={(storeName: string) => updateSignupData({ storeName })}
                  onSubdomainChange={(subdomain: string) => updateSignupData({ subdomain })}
                  onDescriptionChange={(description: string) => updateSignupData({ description })}
                  onContactEmailChange={(contactEmail: string) => updateSignupData({ contactEmail })}
                  onSubmit={handleStep2Complete}
                  loading={loading}
                  error={error}
                />
              )}
            </CardContent>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground">
            {t('signup.hasAccount')}{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              {t('signup.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
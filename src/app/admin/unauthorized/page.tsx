'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, ArrowLeft, Home } from 'lucide-react'

export default function AdminUnauthorized() {
  const router = useRouter()
  const t = useTranslations()

  useEffect(() => {
    // Auto-redirect after 10 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 10000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">{t('errors.accessDenied')}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {t('errors.noAdminPermission')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            {t('errors.needAdminAccess')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.goBack')}
            </Button>
            <Button 
              onClick={() => router.push('/')}
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              {t('navigation.home')}
            </Button>
          </div>
          
          <p className="text-xs text-gray-400 mt-4">
            {t('common.redirectingToHomepage')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { FeatureFlagsService, SecurityFeatureFlags } from '@/lib/services/feature-flags'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Shield, Trash2 } from 'lucide-react'

interface Tenant {
  id: string
  name: string
  subdomain: string
  contact_email?: string | null
  subscription_tier: string
  is_active: boolean
  created_at: string
}

interface SecurityTabProps {
  tenant: Tenant
  saving: boolean
  onPasswordReset: () => Promise<void>
  onSignOut: () => Promise<void>
  onDeleteStore: () => Promise<void>
}

export function SecurityTab({
  tenant,
  saving,
  onPasswordReset,
  onSignOut,
  onDeleteStore
}: SecurityTabProps) {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [securityFeatures, setSecurityFeatures] = useState<SecurityFeatureFlags>({
    mfa_sms_enabled: false,
    mfa_authenticator_enabled: false,
    advanced_session_management: false
  })
  const [featuresLoading, setFeaturesLoading] = useState(true)

  useEffect(() => {
    const loadSecurityFeatures = async () => {
      try {
        const features = await FeatureFlagsService.getEnabledSecurityFeaturesForTier(
          tenant.subscription_tier as 'basic' | 'pro' | 'enterprise'
        )
        setSecurityFeatures(features)
      } catch (error) {
        console.error('Failed to load security features:', error)
        // Keep default disabled state on error
      } finally {
        setFeaturesLoading(false)
      }
    }

    loadSecurityFeatures()
  }, [tenant.subscription_tier])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('sections.accountInformation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t('security.subscriptionTier')}</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="capitalize">
                {tenant.subscription_tier}
              </Badge>
              <span className="text-sm text-gray-500">{t('security.plan')}</span>
            </div>
          </div>
          <div>
            <Label>{t('security.storeStatus')}</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant={tenant.is_active ? "default" : "secondary"}>
                {tenant.is_active ? t('security.active') : t('security.inactive')}
              </Badge>
            </div>
          </div>
          <div>
            <Label>{t('security.created')}</Label>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(tenant.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sections.passwordSecurity')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">{t('security.changePassword')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('security.changePasswordDescription')}
            </p>
            <Button 
              onClick={onPasswordReset}
              disabled={saving || !tenant.contact_email}
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              {saving ? t('security.sending') : t('security.sendPasswordResetEmail')}
            </Button>
            {!tenant.contact_email && (
              <p className="text-xs text-orange-600 mt-2">
                {t('security.addContactEmailFirst')}
              </p>
            )}
          </div>

          {!featuresLoading && (securityFeatures.mfa_sms_enabled || securityFeatures.mfa_authenticator_enabled) && (
            <>
              <Separator />

              <div>
                <h3 className="font-medium mb-3">{t('security.twoFactorAuth')}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {t('security.twoFactorDescription')}
                </p>
                
                <div className="space-y-3">
                  {securityFeatures.mfa_sms_enabled && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{t('security.smsAuth')}</div>
                        <div className="text-sm text-gray-500">{t('security.smsDescription')}</div>
                      </div>
                      <Badge variant="outline">{t('security.comingSoon')}</Badge>
                    </div>
                  )}
                  
                  {securityFeatures.mfa_authenticator_enabled && (
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{t('security.authenticatorApp')}</div>
                        <div className="text-sm text-gray-500">{t('security.authenticatorDescription')}</div>
                      </div>
                      <Badge variant="outline">{t('security.comingSoon')}</Badge>
                    </div>
                  )}
                </div>
              </div>

              <Separator />
            </>
          )}

          <div>
            <h3 className="font-medium mb-3">{t('security.loginSessions')}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('security.loginSessionsDescription')}
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{t('security.currentSession')}</div>
                  <div className="text-sm text-gray-500">
                    {t('security.lastActive')}: {new Date().toLocaleString()}
                  </div>
                </div>
                <Badge variant="default">{t('security.active')}</Badge>
              </div>
              
              {securityFeatures.advanced_session_management ? (
                <Button 
                  variant="outline" 
                  onClick={onSignOut}
                  disabled={saving}
                >
                  {saving ? t('security.signingOut') : t('security.logoutAllDevices')}
                </Button>
              ) : (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  Advanced session management not available for your plan
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">{t('sections.dangerZone')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-red-600">{tCommon('deleteStore')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {tCommon('deleteStorePermanently')}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {tCommon('deleteStore')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{tCommon('deleteStore')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {tCommon('deleteStoreConfirm', { storeName: tenant.name })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={onDeleteStore}
                    >
                      {tCommon('deleteStore')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

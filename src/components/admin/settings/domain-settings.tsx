'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, ExternalLink, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTenant } from '@/lib/contexts/tenant-context'
import { tenantDomainService } from '@/lib/services/tenant-domain'

interface DomainSettingsProps {
  onSave?: (domain: string | null) => Promise<void>
  saving?: boolean
}

export function DomainSettings({ onSave, saving = false }: DomainSettingsProps) {
  const t = useTranslations('settings')
  const { tenant } = useTenant()
  const [customDomain, setCustomDomain] = useState(tenant?.domain || '')
  const [isValidDomain, setIsValidDomain] = useState(true)
  const [domainStatus, setDomainStatus] = useState<'checking' | 'valid' | 'invalid' | null>(null)

  const validateDomain = (domain: string) => {
    if (!domain.trim()) {
      setIsValidDomain(true)
      setDomainStatus(null)
      return true
    }

    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    const valid = domainRegex.test(domain) && domain.length <= 253

    setIsValidDomain(valid)
    return valid
  }

  const handleDomainChange = (value: string) => {
    const cleanDomain = value.toLowerCase().trim()
    setCustomDomain(cleanDomain)
    validateDomain(cleanDomain)
  }

  const handleSave = async () => {
    if (!tenant || !onSave) return

    const domainToSave = customDomain.trim() || null
    
    if (domainToSave && !isValidDomain) {
      return
    }

    try {
      await onSave(domainToSave)
    } catch (error) {
      console.error('Error saving domain:', error)
    }
  }

  const getSubdomainUrl = () => {
    if (!tenant) return ''
    const baseDomain = process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 'aluro.shop'
    return `${tenant.subdomain}.${baseDomain}`
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('domain.title', { defaultMessage: 'Domain Settings' })}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {t('domain.description', { 
              defaultMessage: 'Configure how customers access your store' 
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Subdomain */}
          <div className="space-y-3">
            <Label>{t('domain.currentSubdomain', { defaultMessage: 'Current Subdomain' })}</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="font-mono text-sm">{getSubdomainUrl()}</span>
              <Badge variant="secondary" className="text-xs">
                {t('common.active', { defaultMessage: 'Active' })}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => window.open(`https://${getSubdomainUrl()}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Custom Domain */}
          <div className="space-y-3">
            <Label htmlFor="custom-domain">
              {t('domain.customDomain', { defaultMessage: 'Custom Domain' })}
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="custom-domain"
                  value={customDomain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  placeholder="www.yourstore.com"
                  className={`font-mono ${!isValidDomain ? 'border-red-500' : ''}`}
                />
                <Button 
                  onClick={handleSave}
                  disabled={saving || !isValidDomain}
                >
                  {saving ? t('common.saving', { defaultMessage: 'Saving...' }) : t('common.save', { defaultMessage: 'Save' })}
                </Button>
              </div>
              {!isValidDomain && customDomain && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {t('domain.invalidFormat', { defaultMessage: 'Please enter a valid domain format' })}
                </p>
              )}
            </div>
          </div>

          {/* Current Custom Domain Status */}
          {tenant?.domain && (
            <div className="space-y-3">
              <Label>{t('domain.currentCustomDomain', { defaultMessage: 'Current Custom Domain' })}</Label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="font-mono text-sm">{tenant.domain}</span>
                <Badge variant="default" className="text-xs">
                  {t('domain.custom', { defaultMessage: 'Custom' })}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => window.open(`https://${tenant.domain}`, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DNS Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('domain.dnsInstructions', { defaultMessage: 'DNS Configuration' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>
              {t('domain.dnsTitle', { defaultMessage: 'Configure your DNS records' })}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                {t('domain.dnsDescription', { 
                  defaultMessage: 'To use a custom domain, add these DNS records to your domain provider:' 
                })}
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                <div>Type: CNAME</div>
                <div>Name: www (or @)</div>
                <div>Value: {getSubdomainUrl()}</div>
              </div>
              <p className="text-sm text-gray-600">
                {t('domain.dnsNote', { 
                  defaultMessage: 'DNS changes can take up to 48 hours to propagate worldwide.' 
                })}
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
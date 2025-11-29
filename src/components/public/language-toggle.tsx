'use client'

import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'
import { usePublicLanguage } from '@/lib/contexts/public-language-context'
import { useTranslations } from 'next-intl'

export function PublicLanguageToggle() {
  const { locale, setLocale, isPublicRoute } = usePublicLanguage()
  const t = useTranslations('homepage.header')
  
  // Only show on public routes
  if (!isPublicRoute) {
    return null
  }

  const toggleLanguage = () => {
    const newLocale = locale === 'es' ? 'en' : 'es'

    setLocale(newLocale)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2"
      title={t('languageToggle')}
    >
      <Globe className="h-4 w-4" />
      <span className="text-sm font-medium">
        {locale === 'es' ? 'ES' : 'EN'}
      </span>
    </Button>
  )
}
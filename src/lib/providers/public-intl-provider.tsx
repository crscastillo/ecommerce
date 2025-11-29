'use client'

import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { usePublicLanguage } from '@/lib/contexts/public-language-context'

// Import all messages statically
import enMessages from '../../../messages/en.json'
import esMessages from '../../../messages/es.json'

const messagesMap: Record<string, any> = {
  en: enMessages,
  es: esMessages,
}

interface Props {
  children: ReactNode
}

export function PublicIntlProvider({ children }: Props) {
  const { locale, isPublicRoute } = usePublicLanguage()
  
  // Only apply to public routes, let the main IntlProvider handle tenant routes
  if (!isPublicRoute) {
    return <>{children}</>
  }
  
  // Get messages for the current locale, fallback to Spanish (default)
  const messages = messagesMap[locale] || messagesMap.es


  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
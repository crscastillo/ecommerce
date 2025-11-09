'use client'

import { ReactNode, useState, useEffect } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'

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

export function IntlProvider({ children }: Props) {
  const { tenant } = useTenant()
  const pathname = usePathname()
  
  // Determine if we're in admin area
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // Use admin_language for admin routes, store_language for store routes
  const locale = isAdminRoute 
    ? (tenant as any)?.admin_language || 'en'
    : (tenant as any)?.store_language || 'en'
  
  // Get messages for the current locale, fallback to English
  const messages = messagesMap[locale] || messagesMap.en

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
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
  
  // Check if we're on a public route (main domain, not tenant subdomain)
  // First check if it's a public page path
  const isPublicPage = pathname === '/' ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/features') ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/contact')
  
  // Then check hostname (only on client side)
  const isPublicDomain = typeof window === 'undefined' ? true : ( // Assume public on SSR
    window.location.hostname === 'localhost' ||
    window.location.hostname.startsWith('localhost:') ||
    window.location.hostname === process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN ||
    window.location.hostname === `www.${process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN}` ||
    window.location.hostname.includes('vercel.app')
  )
  
  const isPublicRoute = isPublicPage && isPublicDomain
  
  // Skip providing translations for public routes - let PublicIntlProvider handle them
  if (isPublicRoute) {
    return <>{children}</>
  }
  
  // Determine if we're in admin area
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // Use admin_language for admin routes, store_language for store routes
  // Read language preferences from tenant.settings
  const tenantSettings = (tenant?.settings as any) || {}
  const locale = isAdminRoute 
    ? tenantSettings.admin_language || 'en'
    : tenantSettings.store_language || 'en'
  
  // Get messages for the current locale, fallback to English
  const messages = messagesMap[locale] || messagesMap.en

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
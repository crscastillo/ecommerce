'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface PublicLanguageContextType {
  locale: string
  setLocale: (locale: string) => void
  isPublicRoute: boolean
}

const PublicLanguageContext = createContext<PublicLanguageContextType | undefined>(undefined)

export function PublicLanguageProvider({ children }: { children: ReactNode }) {
  // Initialize state with cookie value if available
  const [locale, setLocaleState] = useState(() => {
    // Check for saved locale in cookie on client side
    if (typeof window !== 'undefined') {
      const savedLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('public-locale='))
        ?.split('=')[1]
      
      if (savedLocale && ['en', 'es'].includes(savedLocale)) {
        return savedLocale
      }
    }
    return 'es' // Default to Spanish (ES)
  })
  const pathname = usePathname()
  const router = useRouter()

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
  




  const setLocale = (newLocale: string) => {

    if (['en', 'es'].includes(newLocale)) {

      setLocaleState(newLocale)
      
      // Save to cookie
      if (typeof window !== 'undefined') {
        document.cookie = `public-locale=${newLocale}; path=/; max-age=${365 * 24 * 60 * 60}` // 1 year
      }
    }
  }

  return (
    <PublicLanguageContext.Provider value={{ locale, setLocale, isPublicRoute }}>
      {children}
    </PublicLanguageContext.Provider>
  )
}

export function usePublicLanguage() {
  const context = useContext(PublicLanguageContext)
  if (context === undefined) {
    throw new Error('usePublicLanguage must be used within a PublicLanguageProvider')
  }
  return context
}
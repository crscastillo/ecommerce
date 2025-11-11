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
  const [locale, setLocaleState] = useState('es') // Default to Spanish
  const pathname = usePathname()
  const router = useRouter()

  // Check if we're on a public route (main domain, not tenant subdomain)
  const isPublicRoute = !pathname?.startsWith('/admin') && 
                       typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        !window.location.hostname.includes('.localhost'))

  // Load language from cookie on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isPublicRoute) {
      const savedLocale = document.cookie
        .split('; ')
        .find(row => row.startsWith('public-locale='))
        ?.split('=')[1]
      
      if (savedLocale && ['en', 'es'].includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [isPublicRoute])

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
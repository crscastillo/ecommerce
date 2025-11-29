import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the proper base URL for the application
 * Uses environment variables in order of preference:
 * 1. NEXT_PUBLIC_SITE_URL (explicit override)
 * 2. VERCEL_URL (when deployed on Vercel)
 * 3. localhost:3000 (fallback for development)
 */
export function getBaseUrl(): string {
  // Client-side: use window.location.origin if in production
  if (typeof window !== 'undefined') {
    // If we're in production (not localhost), use the current origin
    if (!window.location.origin.includes('localhost')) {
      return window.location.origin
    }
  }
  
  // Server-side or localhost: use environment variables
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  return 'http://localhost:3000'
}

/**
 * Get the proper base domain for multi-tenant redirects
 */
export function getBaseDomain(): string {
  return process.env.NEXT_PUBLIC_BASE_DOMAIN || 
         process.env.NEXT_PUBLIC_PRODUCTION_DOMAIN || 
         'localhost:3000'
}

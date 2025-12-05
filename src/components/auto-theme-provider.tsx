'use client'

import { useAutoTheme } from '@/lib/hooks/use-auto-theme'

/**
 * Auto Theme Provider
 * Automatically detects and applies system theme on component mount
 * This provider should be placed high in the component tree
 */
export function AutoThemeProvider({ children }: { children: React.ReactNode }) {
  // Hook automatically handles theme detection and system changes
  useAutoTheme()
  
  return <>{children}</>
}

/**
 * Theme Script
 * Inline script to prevent flash of incorrect theme
 * This should be added to the document head before hydration
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var storedTheme = localStorage.getItem('theme-preference');
        var systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (storedTheme === 'dark' || (!storedTheme && systemPreference)) {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {
        // Fallback: do nothing if localStorage is not available
      }
    })();
  `
  
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
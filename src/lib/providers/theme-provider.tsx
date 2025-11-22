'use client'

import { useEffect } from 'react'
import { useTenant } from '@/lib/contexts/tenant-context'
import { THEME_COLORS, type ThemeId } from '@/lib/theme/colors'
import { usePathname } from 'next/navigation'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { tenant } = useTenant()
  const pathname = usePathname()
  
  // Determine if we're on admin or public site
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/platform-admin')
  
  useEffect(() => {
    if (!tenant?.theme_config) return
    
    const themeConfig = tenant.theme_config as any
    const selectedTheme = isAdmin 
      ? (themeConfig.admin_theme || 'default') as ThemeId
      : (themeConfig.store_theme || 'default') as ThemeId
    
    const themeColors = THEME_COLORS[selectedTheme]
    if (!themeColors) return
    
    // Apply theme colors to CSS variables
    const root = document.documentElement
    const isDark = root.classList.contains('dark')
    const colors = isDark ? themeColors.dark : themeColors.light
    
    root.style.setProperty('--primary', colors.primary)
    root.style.setProperty('--primary-foreground', colors.primaryForeground)
    root.style.setProperty('--secondary', colors.secondary)
    root.style.setProperty('--secondary-foreground', colors.secondaryForeground)
    root.style.setProperty('--accent', colors.accent)
    root.style.setProperty('--accent-foreground', colors.accentForeground)
    root.style.setProperty('--muted', colors.muted)
    root.style.setProperty('--muted-foreground', colors.mutedForeground)
    root.style.setProperty('--destructive', colors.destructive)
    root.style.setProperty('--border', colors.border)
    root.style.setProperty('--input', colors.input)
    root.style.setProperty('--ring', colors.ring)
    
    // Also apply to sidebar variables for admin
    if (isAdmin) {
      root.style.setProperty('--sidebar-primary', colors.primary)
      root.style.setProperty('--sidebar-primary-foreground', colors.primaryForeground)
      root.style.setProperty('--sidebar-accent', colors.accent)
      root.style.setProperty('--sidebar-accent-foreground', colors.accentForeground)
      root.style.setProperty('--sidebar-border', colors.border)
      root.style.setProperty('--sidebar-ring', colors.ring)
    }
    
  }, [tenant?.theme_config, isAdmin])
  
  // Watch for dark mode changes
  useEffect(() => {
    if (!tenant?.theme_config) return
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          // Trigger re-application of theme when dark mode toggles
          const event = new CustomEvent('theme-mode-change')
          window.dispatchEvent(event)
        }
      })
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })
    
    const handleThemeModeChange = () => {
      const themeConfig = tenant.theme_config as any
      const selectedTheme = isAdmin 
        ? (themeConfig.admin_theme || 'default') as ThemeId
        : (themeConfig.store_theme || 'default') as ThemeId
      
      const themeColors = THEME_COLORS[selectedTheme]
      if (!themeColors) return
      
      const root = document.documentElement
      const isDark = root.classList.contains('dark')
      const colors = isDark ? themeColors.dark : themeColors.light
      
      root.style.setProperty('--primary', colors.primary)
      root.style.setProperty('--primary-foreground', colors.primaryForeground)
      root.style.setProperty('--secondary', colors.secondary)
      root.style.setProperty('--secondary-foreground', colors.secondaryForeground)
      root.style.setProperty('--accent', colors.accent)
      root.style.setProperty('--accent-foreground', colors.accentForeground)
      root.style.setProperty('--muted', colors.muted)
      root.style.setProperty('--muted-foreground', colors.mutedForeground)
      root.style.setProperty('--destructive', colors.destructive)
      root.style.setProperty('--border', colors.border)
      root.style.setProperty('--input', colors.input)
      root.style.setProperty('--ring', colors.ring)
      
      if (isAdmin) {
        root.style.setProperty('--sidebar-primary', colors.primary)
        root.style.setProperty('--sidebar-primary-foreground', colors.primaryForeground)
        root.style.setProperty('--sidebar-accent', colors.accent)
        root.style.setProperty('--sidebar-accent-foreground', colors.accentForeground)
        root.style.setProperty('--sidebar-border', colors.border)
        root.style.setProperty('--sidebar-ring', colors.ring)
      }
    }
    
    window.addEventListener('theme-mode-change', handleThemeModeChange)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('theme-mode-change', handleThemeModeChange)
    }
  }, [tenant?.theme_config, isAdmin])
  
  return <>{children}</>
}

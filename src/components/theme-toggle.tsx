'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { themeUtils } from '@/lib/hooks/use-auto-theme'

type Theme = 'light' | 'dark' | 'system'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function ThemeToggle({ 
  variant = 'button', 
  size = 'default', 
  showLabel = false 
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    setTheme(themeUtils.getThemePreference())
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size={size} disabled>
        <Monitor className="h-4 w-4" />
        {showLabel && <span className="ml-2">Theme</span>}
      </Button>
    )
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    themeUtils.setTheme(newTheme)
  }

  const getThemeIcon = (themeName: Theme) => {
    switch (themeName) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = (themeName: Theme) => {
    switch (themeName) {
      case 'light':
        return 'Light'
      case 'dark':
        return 'Dark'
      case 'system':
        return 'System'
    }
  }

  if (variant === 'button') {
    // Simple toggle button (cycles through themes)
    const handleToggle = () => {
      const nextTheme: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
      handleThemeChange(nextTheme)
    }

    return (
      <Button 
        variant="outline" 
        size={size}
        onClick={handleToggle}
        aria-label={`Switch to ${theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'} theme`}
      >
        {getThemeIcon(theme)}
        {showLabel && <span className="ml-2">{getThemeLabel(theme)}</span>}
      </Button>
    )
  }

  // Dropdown variant with all options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={size}>
          {getThemeIcon(theme)}
          {showLabel && <span className="ml-2">{getThemeLabel(theme)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Simple theme toggle hook for custom implementations
 */
export function useThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme(themeUtils.getThemePreference())
  }, [])

  const toggleTheme = () => {
    if (!mounted) return
    
    const nextTheme: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system'
    setTheme(nextTheme)
    themeUtils.setTheme(nextTheme)
  }

  const setThemePreference = (newTheme: Theme) => {
    if (!mounted) return
    
    setTheme(newTheme)
    themeUtils.setTheme(newTheme)
  }

  return {
    theme: mounted ? theme : 'system',
    toggleTheme,
    setTheme: setThemePreference,
    isSystemTheme: theme === 'system',
    isDark: mounted ? themeUtils.getCurrentTheme() === 'dark' : false,
    mounted
  }
}
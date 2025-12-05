'use client'

import { useEffect } from 'react'

/**
 * Automatic Theme Detector Hook
 * Automatically applies dark/light theme based on system preference
 * and listens for system theme changes
 */
export function useAutoTheme() {
  useEffect(() => {
    // Check if user has manually set theme preference
    const storedTheme = localStorage.getItem('theme-preference')
    
    // Function to apply theme
    const applyTheme = (isDark: boolean) => {
      const html = document.documentElement
      if (isDark) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    }

    // Function to get system preference
    const getSystemPreference = () => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }

    // Apply initial theme
    if (storedTheme === 'dark') {
      applyTheme(true)
    } else if (storedTheme === 'light') {
      applyTheme(false)
    } else {
      // No manual preference, use system preference
      applyTheme(getSystemPreference())
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-update if user hasn't set manual preference
      if (!localStorage.getItem('theme-preference')) {
        applyTheme(e.matches)
      }
    }

    // Add listener for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])
}

/**
 * Theme Toggle Functions
 * Utilities for manually controlling theme
 */
export const themeUtils = {
  // Toggle between dark and light
  toggle: () => {
    const html = document.documentElement
    const isDark = html.classList.contains('dark')
    
    if (isDark) {
      html.classList.remove('dark')
      localStorage.setItem('theme-preference', 'light')
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme-preference', 'dark')
    }
  },

  // Set specific theme
  setTheme: (theme: 'light' | 'dark' | 'system') => {
    const html = document.documentElement
    
    if (theme === 'system') {
      localStorage.removeItem('theme-preference')
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (systemPreference) {
        html.classList.add('dark')
      } else {
        html.classList.remove('dark')
      }
    } else if (theme === 'dark') {
      html.classList.add('dark')
      localStorage.setItem('theme-preference', 'dark')
    } else {
      html.classList.remove('dark')
      localStorage.setItem('theme-preference', 'light')
    }
  },

  // Get current theme
  getCurrentTheme: (): 'light' | 'dark' => {
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  },

  // Get theme preference (system, light, or dark)
  getThemePreference: (): 'light' | 'dark' | 'system' => {
    const stored = localStorage.getItem('theme-preference')
    return (stored as 'light' | 'dark') || 'system'
  }
}
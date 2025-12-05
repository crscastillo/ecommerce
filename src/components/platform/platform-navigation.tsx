'use client'

import { Button } from "@/components/ui/button"
import { Store } from "lucide-react"
import Link from "next/link"
import { PublicLanguageToggle } from "@/components/public/language-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { platformConfig } from "@/lib/config/platform"
import { useTranslations } from "next-intl"

interface PlatformNavigationProps {
  user: any
  onGoToAdmin: () => void
}

export function PlatformNavigation({ user, onGoToAdmin }: PlatformNavigationProps) {
  const tHeader = useTranslations('homepage.header')
  
  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Store className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
              {platformConfig.name}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle variant="button" size="sm" />
            <PublicLanguageToggle />
            {user ? (
              <Button variant="default" onClick={onGoToAdmin}>
                {tHeader('goToAdmin')}
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{tHeader('signIn')}</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default">{tHeader('getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

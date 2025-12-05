'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function CartBreadcrumb() {
  const t = useTranslations('cart')
  const tNav = useTranslations('navigation')

  return (
    <div className="bg-card border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-4 h-4 mr-1" />
            {tNav('home')}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Link href="/products" className="text-muted-foreground hover:text-foreground transition-colors">
            {tNav('products')}
          </Link>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground font-medium">{t('title')}</span>
        </nav>
      </div>
    </div>
  )
}
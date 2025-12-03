'use client'

import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function CartBreadcrumb() {
  const t = useTranslations('cart')
  const tNav = useTranslations('navigation')

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <Home className="w-4 h-4 mr-1" />
            {tNav('home')}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link href="/products" className="text-gray-600 hover:text-gray-900 transition-colors">
            {tNav('products')}
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium">{t('title')}</span>
        </nav>
      </div>
    </div>
  )
}
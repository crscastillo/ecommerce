'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart, ArrowLeft, Bookmark, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface CartHeaderProps {
  itemCount: number
}

export function CartHeader({ itemCount }: CartHeaderProps) {
  const t = useTranslations('cart')

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <ShoppingCart className="w-6 h-6" />
            {t('title')}
          </h1>
          <div className="mt-2">
            <p className="text-gray-600">
              {itemCount} {itemCount === 1 ? t('item') : t('items')} {t('inYourCart')}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link href="/products">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">{t('continueShopping')}</span>
              <span className="xs:hidden">{t('continue')}</span>
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            {t('saveCart')}
          </Button>
          <Button variant="ghost" size="sm" className="hidden lg:flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            {t('share')}
          </Button>
        </div>
      </div>
    </div>
  )
}
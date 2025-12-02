'use client'

import Link from 'next/link'

interface Category {
  name: string
  slug: string
}

interface ProductBreadcrumbProps {
  category?: Category
  t: any
}

export function ProductBreadcrumb({ category, t }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
      <Link href="/" className="hover:text-gray-900">{t('navigation.home')}</Link>
      <span>/</span>
      <Link href="/products" className="hover:text-gray-900">{t('navigation.products')}</Link>
      {category && (
        <>
          <span>/</span>
          <Link 
            href={`/products?category=${category.slug}`} 
            className="hover:text-gray-900"
          >
            {category.name}
          </Link>
        </>
      )}
    </nav>
  )
}

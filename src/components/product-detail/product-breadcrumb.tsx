'use client'

import Link from 'next/link'

interface Brand {
  name: string
  slug: string
}

interface Category {
  name: string
  slug: string
}

interface ProductBreadcrumbProps {
  productName: string
  brand?: Brand
  category?: Category
  t: any
}

export function ProductBreadcrumb({ productName, brand, category, t }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
      <Link href="/" className="hover:text-gray-900">{t('navigation.home')}</Link>
      <span>/</span>
      <Link href="/products" className="hover:text-gray-900">{t('navigation.products')}</Link>
      {brand && (
        <>
          <span>/</span>
          <Link 
            href={`/brands/${brand.slug}`} 
            className="hover:text-gray-900"
          >
            {brand.name}
          </Link>
        </>
      )}
      {category && (
        <>
          <span>/</span>
          <Link 
            href={`/products/category/${category.slug}`} 
            className="hover:text-gray-900"
          >
            {category.name}
          </Link>
        </>
      )}
      <span>/</span>
      <span className="text-gray-900">{productName}</span>
    </nav>
  )
}

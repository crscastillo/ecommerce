'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface Brand {
  name: string
  slug: string
}

interface Category {
  name: string
  slug: string
}

interface ProductInfoHeaderProps {
  name: string
  brand?: Brand
  category?: Category
  price: string
  comparePrice?: string
  shortDescription?: string
  isOutOfStock?: boolean
  isLowStock?: boolean
  currentStock?: number
  totalStock?: number
  isVariableProduct?: boolean
  isInCart?: boolean
  cartQuantity?: number
  t: any
}

export function ProductInfoHeader({
  name,
  brand,
  category,
  price,
  comparePrice,
  shortDescription,
  isOutOfStock,
  isLowStock,
  currentStock,
  totalStock,
  isVariableProduct,
  isInCart,
  cartQuantity,
  t
}: ProductInfoHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{name}</h1>
        <div className="flex items-center gap-2 text-sm">
          {brand && (
            <>
              <span className="text-gray-600">{t('product.by')}</span>
              <Link 
                href={`/brands/${brand.slug}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {brand.name}
              </Link>
            </>
          )}
          {category && (
            <>
              {brand && <span className="text-gray-400">•</span>}
              <span className="text-gray-600">{t('product.in')}</span>
              <Link 
                href={`/products/category/${category.slug}`}
                className="font-medium text-blue-600 hover:text-blue-800"
              >
                {category.name}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center space-x-4">
        <span className="text-3xl font-bold text-gray-900">
          {price}
        </span>
        {comparePrice && (
          <span className="text-xl text-gray-500 line-through">
            {comparePrice}
          </span>
        )}
      </div>

      {/* Short Description */}
      {shortDescription && (
        <p className="text-lg text-gray-600">{shortDescription}</p>
      )}

      {/* Stock Status */}
      <div className="flex items-center space-x-2">
        {isOutOfStock ? (
          <Badge variant="destructive">{t('product.outOfStock')}</Badge>
        ) : isLowStock ? (
          <Badge variant="outline" className="border-orange-500 text-orange-600">
            {t('product.onlyXLeftInStock', { count: currentStock })}
          </Badge>
        ) : (
          <Badge variant="outline" className="border-green-500 text-green-600">
            {t('product.inStock')}
            {isVariableProduct && totalStock && (
              <span className="ml-1">({totalStock} {t('product.total')})</span>
            )}
          </Badge>
        )}
        
        {/* Cart Status */}
        {isInCart && cartQuantity && (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            {cartQuantity} {t('product.inCart')}
          </Badge>
        )}
      </div>
    </div>
  )
}

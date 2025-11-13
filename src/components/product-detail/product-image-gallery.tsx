'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'

interface ProductImageGalleryProps {
  images?: string[]
  productName: string
  isFeatured?: boolean
  discountPercentage?: number
  isOutOfStock?: boolean
  isLowStock?: boolean
  t: any
}

export function ProductImageGallery({
  images,
  productName,
  isFeatured,
  discountPercentage,
  isOutOfStock,
  isLowStock,
  t
}: ProductImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
        {images && images.length > 0 ? (
          <Image
            src={images[selectedImageIndex]}
            alt={productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isFeatured && (
            <Badge className="bg-blue-600 hover:bg-blue-700">{t('product.featured')}</Badge>
          )}
          {discountPercentage && discountPercentage > 0 && (
            <Badge variant="destructive">-{discountPercentage}% {t('product.off')}</Badge>
          )}
          {isOutOfStock && (
            <Badge variant="secondary">{t('product.outOfStock')}</Badge>
          )}
          {isLowStock && (
            <Badge variant="outline" className="border-orange-500 text-orange-600">
              {t('product.lowStock')}
            </Badge>
          )}
        </div>
      </div>

      {/* Thumbnail Images */}
      {images && images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 4).map((image: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`aspect-square relative bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                selectedImageIndex === index 
                  ? 'border-blue-600' 
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

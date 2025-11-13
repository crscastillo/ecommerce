'use client'

import { Truck, Shield, RefreshCw } from 'lucide-react'

interface ProductFeaturesProps {
  shippingThreshold: string
}

export function ProductFeatures({ shippingThreshold }: ProductFeaturesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Truck className="w-5 h-5" />
        <span>Free shipping on orders over {shippingThreshold}</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Shield className="w-5 h-5" />
        <span>1-year warranty included</span>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <RefreshCw className="w-5 h-5" />
        <span>30-day return policy</span>
      </div>
    </div>
  )
}

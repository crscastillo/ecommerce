'use client'

import { Package } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OrdersEmptyStateProps {
  hasFilters: boolean
  isDemoTenant: boolean
}

export function OrdersEmptyState({ hasFilters, isDemoTenant }: OrdersEmptyStateProps) {
  const t = useTranslations('orders')

  return (
    <div className="text-center py-8">
      <Package className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noOrdersFound')}</h3>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters 
          ? 'Try adjusting your filters or search term.'
          : isDemoTenant
            ? 'This is a demo environment. Orders will appear here once customers start placing them in a real store.'
            : 'Orders will appear here once customers start placing them.'
        }
      </p>
      {isDemoTenant && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-700">
            <strong>Demo Mode:</strong> You're viewing the orders page in demo mode. 
            In a real store with orders, you'd see comprehensive order management features here.
          </p>
        </div>
      )}
    </div>
  )
}
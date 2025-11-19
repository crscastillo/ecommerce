'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OrderFiltersProps {
  searchTerm: string
  statusFilter: string
  fulfillmentFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onFulfillmentFilterChange: (value: string) => void
}

export function OrderFilters({
  searchTerm,
  statusFilter,
  fulfillmentFilter,
  onSearchChange,
  onStatusFilterChange,
  onFulfillmentFilterChange
}: OrderFiltersProps) {
  const t = useTranslations('orders')

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">{t('filters.search')}</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="search"
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="w-full sm:w-48">
            <Label>{t('paymentStatus')}</Label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allPayments')}</SelectItem>
                <SelectItem value="pending">{t('status.pending')}</SelectItem>
                <SelectItem value="paid">{t('status.paid')}</SelectItem>
                <SelectItem value="refunded">{t('status.refunded')}</SelectItem>
                <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Label>{t('fulfillmentStatus')}</Label>
            <Select value={fulfillmentFilter} onValueChange={onFulfillmentFilterChange}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allFulfillment')}</SelectItem>
                <SelectItem value="unfulfilled">{t('status.unfulfilled')}</SelectItem>
                <SelectItem value="fulfilled">{t('status.fulfilled')}</SelectItem>
                <SelectItem value="partial">{t('status.partial')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
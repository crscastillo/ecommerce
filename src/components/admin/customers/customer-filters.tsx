'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CustomerFiltersProps {
  searchTerm: string
  statusFilter: string
  marketingFilter: string
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onMarketingFilterChange: (value: string) => void
}

export function CustomerFilters({
  searchTerm,
  statusFilter,
  marketingFilter,
  onSearchChange,
  onStatusFilterChange,
  onMarketingFilterChange
}: CustomerFiltersProps) {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('filters')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCustomers')}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('customerType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('all')}</SelectItem>
              <SelectItem value="registered">{t('registered')}</SelectItem>
              <SelectItem value="guest">{t('guest')}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={marketingFilter} onValueChange={onMarketingFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t('marketingSubscription')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tCommon('all')}</SelectItem>
              <SelectItem value="subscribed">{t('subscribed')}</SelectItem>
              <SelectItem value="unsubscribed">{t('unsubscribed')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
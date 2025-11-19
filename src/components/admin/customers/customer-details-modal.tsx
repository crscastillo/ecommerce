'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Mail, Phone, Calendar } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Database } from '@/lib/types/database'
import Link from 'next/link'

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomerDetailsModalProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailsModal({ customer, open, onOpenChange }: CustomerDetailsModalProps) {
  const t = useTranslations('customers')
  const tCommon = useTranslations('common')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date))
  }

  if (!customer) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('customerDetails')}</DialogTitle>
          <DialogDescription>
            {t('viewCustomerInformation')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">{t('personalInformation')}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>{t('name')}:</strong> {' '}
                  {customer.first_name || customer.last_name 
                    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                    : t('unnamedCustomer')
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">{t('accountInformation')}</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>{t('status')}:</strong> {' '}
                  <Badge variant={customer.user_id ? "default" : "secondary"}>
                    {customer.user_id ? t('registered') : t('guest')}
                  </Badge>
                </div>
                <div>
                  <strong>{t('marketing')}:</strong> {' '}
                  <Badge variant={customer.accepts_marketing ? "default" : "outline"}>
                    {customer.accepts_marketing ? t('subscribed') : t('unsubscribed')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{t('joined')}: {formatDate(customer.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Statistics */}
          <div>
            <h3 className="font-medium mb-2">{t('orderStatistics')}</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{customer.orders_count || 0}</div>
                <div className="text-muted-foreground">{t('totalOrders')}</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">{formatCurrency(customer.total_spent || 0)}</div>
                <div className="text-muted-foreground">{t('totalSpent')}</div>
              </div>
              <div className="text-center p-3 bg-muted rounded">
                <div className="text-2xl font-bold">
                  {customer.orders_count && customer.orders_count > 0 
                    ? formatCurrency((customer.total_spent || 0) / customer.orders_count)
                    : formatCurrency(0)
                  }
                </div>
                <div className="text-muted-foreground">{t('averageOrder')}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <div>
              <h3 className="font-medium mb-2">{t('customerNotes')}</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {customer.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" asChild>
              <Link href={`/admin/customers/${customer.id}`}>
                {t('viewFullProfile')}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/customers/${customer.id}/edit`}>
                {t('editCustomer')}
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
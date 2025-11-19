'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Edit, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Database } from '@/lib/types/database'
import Link from 'next/link'

type Customer = Database['public']['Tables']['customers']['Row']

interface CustomersTableProps {
  customers: Customer[]
  loading?: boolean
  onViewCustomer: (customer: Customer) => void
}

export function CustomersTable({ customers, loading, onViewCustomer }: CustomersTableProps) {
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

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium">{t('noCustomers')}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('noCustomersDescription')}
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('customer')}</TableHead>
          <TableHead>{tCommon('status')}</TableHead>
          <TableHead>{t('orders')}</TableHead>
          <TableHead>{t('totalSpent')}</TableHead>
          <TableHead>{t('lastOrder')}</TableHead>
          <TableHead>{t('marketing')}</TableHead>
          <TableHead>{t('joinDate')}</TableHead>
          <TableHead className="text-right">{tCommon('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customers.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div>
                <div className="font-medium">
                  {customer.first_name || customer.last_name 
                    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                    : t('unnamedCustomer')
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {customer.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Badge 
                  variant={
                    (customer as any).status === 'active' ? 'default' : 
                    (customer as any).status === 'inactive' ? 'secondary' : 
                    (customer as any).status === 'suspended' ? 'destructive' :
                    'default'
                  }
                >
                  {(customer as any).status ? t(`status.${(customer as any).status}`) : t('status.active')}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {customer.user_id ? t('registered') : t('guest')}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {customer.orders_count || 0}
            </TableCell>
            <TableCell>
              {formatCurrency(customer.total_spent || 0)}
            </TableCell>
            <TableCell>
              {customer.last_order_date 
                ? formatDate(customer.last_order_date)
                : t('never')
              }
            </TableCell>
            <TableCell>
              <Badge variant={customer.accepts_marketing ? "default" : "outline"}>
                {customer.accepts_marketing ? t('subscribed') : t('unsubscribed')}
              </Badge>
            </TableCell>
            <TableCell>
              {formatDate(customer.created_at)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCustomer(customer)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/admin/customers/${customer.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
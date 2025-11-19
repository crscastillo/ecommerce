'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Database } from '@/lib/types/database'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
}

interface OrdersTableProps {
  orders: Order[]
  onViewOrder: (order: Order) => void
  onEditOrder: (orderId: string) => void
  onUpdateStatus: (orderId: string, field: 'financial_status' | 'fulfillment_status', value: string) => void
}

export function OrdersTable({
  orders,
  onViewOrder,
  onEditOrder,
  onUpdateStatus
}: OrdersTableProps) {
  const t = useTranslations('orders')

  const getStatusBadge = (status: string, type: 'financial' | 'fulfillment') => {
    const config = {
      financial: {
        pending: { variant: 'secondary' as const, label: t('status.pending') },
        paid: { variant: 'default' as const, label: t('status.paid') },
        refunded: { variant: 'destructive' as const, label: t('status.refunded') },
        cancelled: { variant: 'outline' as const, label: t('status.cancelled') }
      },
      fulfillment: {
        unfulfilled: { variant: 'secondary' as const, label: t('status.unfulfilled') },
        fulfilled: { variant: 'default' as const, label: t('status.fulfilled') },
        partial: { variant: 'outline' as const, label: t('status.partial') }
      }
    }

    const typeConfig = config[type]
    const statusConfig = (typeConfig as any)[status] || { variant: 'outline' as const, label: status }
    return (
      <Badge variant={statusConfig.variant}>
        {statusConfig.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('orderNumber')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('paymentStatus')}</TableHead>
            <TableHead>{t('fulfillmentStatus')}</TableHead>
            <TableHead>{t('total')}</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div>
                  <div className="font-medium">#{order.order_number}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {order.customers?.first_name || order.customers?.last_name 
                      ? `${order.customers.first_name || ''} ${order.customers.last_name || ''}`.trim()
                      : t('guestCustomer')
                    }
                  </div>
                  <div className="text-sm text-gray-500">{order.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatDate(order.created_at)}
                </div>
              </TableCell>
              <TableCell>
                <Select 
                  value={order.financial_status || undefined} 
                  onValueChange={(value) => onUpdateStatus(order.id, 'financial_status', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      {getStatusBadge(order.financial_status || 'pending', 'financial')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="paid">{t('status.paid')}</SelectItem>
                    <SelectItem value="refunded">{t('status.refunded')}</SelectItem>
                    <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select 
                  value={order.fulfillment_status || undefined} 
                  onValueChange={(value) => onUpdateStatus(order.id, 'fulfillment_status', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      {getStatusBadge(order.fulfillment_status || 'unfulfilled', 'fulfillment')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unfulfilled">{t('status.unfulfilled')}</SelectItem>
                    <SelectItem value="fulfilled">{t('status.fulfilled')}</SelectItem>
                    <SelectItem value="partial">{t('status.partial')}</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {formatCurrency(order.total_price)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditOrder(order.id)}
                  >
                    {t('editOrder')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
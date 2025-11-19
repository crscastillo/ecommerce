'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Package, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface OrderStatsProps {
  stats: {
    total: number
    pending: number
    paid: number
    fulfilled: number
    totalRevenue: number
  }
}

export function OrderStats({ stats }: OrderStatsProps) {
  const t = useTranslations('orders')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const statCards = [
    {
      title: t('totalOrders'),
      value: stats.total,
      icon: Package,
      color: 'text-blue-500'
    },
    {
      title: t('pendingPayment'),
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-orange-500'
    },
    {
      title: t('fulfilled'),
      value: stats.fulfilled,
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      title: t('summary.totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-500',
      isFormatted: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold">
                  {card.isFormatted ? card.value : card.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
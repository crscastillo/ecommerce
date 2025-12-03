'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTenant } from '@/lib/contexts/tenant-context'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStats } from '@/components/admin/orders/order-stats'
import { OrderFilters } from '@/components/admin/orders/order-filters'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersEmptyState } from '@/components/admin/orders/orders-empty-state'

type Order = Database['public']['Tables']['orders']['Row'] & {
  customers?: {
    first_name: string | null
    last_name: string | null
  }
}

type OrderStats = {
  total: number
  pending: number
  paid: number
  fulfilled: number
  totalRevenue: number
}

export default function OrdersPage() {
  const router = useRouter()
  const { tenant } = useTenant()
  const t = useTranslations('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('all')

  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    paid: 0,
    fulfilled: 0,
    totalRevenue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    if (tenant?.id) {
      loadOrders()
      loadStats()
    }
  }, [tenant?.id])



  const loadOrders = async () => {
    try {
      setLoading(true)
      
      // If no tenant ID, don't make database calls
      if (!tenant?.id) {
        setOrders([])
        setLoading(false)
        return
      }
      

      
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            first_name,
            last_name
          )
        `)
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })

      if (error) {
        return
      }

      setOrders(orders || [])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // If no tenant ID, show empty stats
      if (!tenant?.id) {
        const emptyStats: OrderStats = {
          total: 0,
          pending: 0,
          paid: 0,
          fulfilled: 0,
          totalRevenue: 0
        }
        setStats(emptyStats)
        return
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('financial_status, fulfillment_status, total_price')
        .eq('tenant_id', tenant.id)

      if (error) {
        return
      }

      const stats: OrderStats = {
        total: orders?.length || 0,
        pending: orders?.filter(o => o.financial_status === 'pending').length || 0,
        paid: orders?.filter(o => o.financial_status === 'paid').length || 0,
        fulfilled: orders?.filter(o => o.fulfillment_status === 'fulfilled').length || 0,
        totalRevenue: orders?.filter(o => o.financial_status === 'paid')
          .reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
      }

      setStats(stats)
    } catch (error) {
    }
  }

  const updateOrderStatus = async (orderId: string, field: 'financial_status' | 'fulfillment_status', value: string) => {
    try {
      // Don't update if no tenant ID
      if (!tenant?.id) {
        return
      }
      
      const { error } = await supabase
        .from('orders')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('tenant_id', tenant.id)

      if (error) {
        return
      }

      // Refresh orders and stats
      await Promise.all([loadOrders(), loadStats()])
    } catch (error) {
    }
  }



  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customers?.first_name && order.customers.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customers?.last_name && order.customers.last_name.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || order.financial_status === statusFilter
    const matchesFulfillment = fulfillmentFilter === 'all' || order.fulfillment_status === fulfillmentFilter

    return matchesSearch && matchesStatus && matchesFulfillment
  })





  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{t('title')}</h1>
      </div>

      {/* Stats Cards */}
      <OrderStats stats={stats} />

      {/* Filters */}
      <OrderFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        fulfillmentFilter={fulfillmentFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onFulfillmentFilterChange={setFulfillmentFilter}
      />

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('summary.ordersCount', { count: filteredOrders.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <OrdersEmptyState 
              hasFilters={searchTerm !== '' || statusFilter !== 'all' || fulfillmentFilter !== 'all'}
              isDemoTenant={tenant?.id === 'demo-tenant-id'}
            />
          ) : (
            <OrdersTable
              orders={filteredOrders}
              onViewOrder={(orderId) => router.push(`/admin/orders/${orderId}`)}
              onUpdateStatus={updateOrderStatus}
            />
          )}
        </CardContent>
      </Card>


    </div>
  )
}